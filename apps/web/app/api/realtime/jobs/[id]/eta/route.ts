
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { createRedisRateLimiter, getSharedRedis } from '@/lib/api/redis-rate-limit'
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface DirectionsResponse {
  routes: Array<{
    legs: Array<{
      duration: { value: number; text: string }
      duration_in_traffic?: { value: number; text: string }
      distance: { value: number; text: string }
    }>
    overview_polyline: { points: string }
  }>
  status: string
}

// Simple in-memory cache for ETA calculations
const etaCache = new Map<string, { data: unknown; expiry: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

// DR-1009: every cache miss below makes paid Google calls, so each signed-in user gets
// a shared (Redis) limit. The client polls once a minute per job; 20 a minute leaves
// room for several open jobs or tabs. Without Redis the route refuses rather than
// calling Google unlimited.
const etaRateLimiter = createRedisRateLimiter({
  name: 'eta',
  windowMs: 60 * 1000,
  maxRequests: 20,
  failClosed: true,
  message: 'Too many ETA requests. Please wait a moment.',
})

// A job's address does not change, so its coordinates are kept in the shared store
// rather than geocoded again on every ETA miss. A failed lookup is kept briefly so a
// bad address does not cost a paid call on every poll.
const GEOCODE_TTL_SECONDS = 7 * 24 * 60 * 60
const GEOCODE_MISS_TTL_SECONDS = 10 * 60

type Coordinates = { lat: number; lng: number }

// One check for every coordinate pair, whether it came from the cache or from Google.
function toCoordinates(value: unknown): Coordinates | null {
  if (!value || typeof value !== 'object') return null
  const { lat, lng } = value as { lat?: unknown; lng?: unknown }
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

function isMissMarker(value: unknown): boolean {
  return !!value && typeof value === 'object' && (value as { miss?: unknown }).miss === true
}

async function geocodeJobLocation(jobId: string, location: string): Promise<Coordinates | null> {
  const redis = getSharedRedis()
  const addressHash = createHash('sha256').update(location).digest('hex').slice(0, 32)
  const key = `eta:geocode:${jobId}:${addressHash}`

  if (redis) {
    try {
      // Anything that is neither a valid pair nor the miss marker is ignored and re-geocoded.
      const cached = await redis.get<unknown>(key)
      if (isMissMarker(cached)) return null
      const cachedCoords = toCoordinates(cached)
      if (cachedCoords) return cachedCoords
    } catch (error) {
      console.error('ETA geocode cache read failed:', error)
    }
  }

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`
  const geocodeRes = await fetch(geocodeUrl)
  const geocodeData = await geocodeRes.json()

  const coords = geocodeData.status === 'OK' ? toCoordinates(geocodeData.results?.[0]?.geometry?.location) : null

  // Only a definite answer is kept; a quota or server error is not, so it is retried.
  const definite = geocodeData.status === 'OK' || geocodeData.status === 'ZERO_RESULTS'
  if (redis && definite) {
    try {
      await redis.set(key, coords ?? { miss: true }, { ex: coords ? GEOCODE_TTL_SECONDS : GEOCODE_MISS_TTL_SECONDS })
    } catch (error) {
      console.error('ETA geocode cache write failed:', error)
    }
  }

  return coords
}

function getCacheKey(jobId: string, contractorLat: number, contractorLng: number): string {
  // Round coordinates to reduce cache misses for small movements
  const roundedLat = Math.round(contractorLat * 1000) / 1000
  const roundedLng = Math.round(contractorLng * 1000) / 1000
  return `${jobId}:${roundedLat}:${roundedLng}`
}

// GET - Calculate ETA using Google Directions API
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { user: authUser } = authResult.context

    const limited = await etaRateLimiter(request, authUser.id)
    if (limited) {
      return limited
    }

    const db = getTenantDb(authResult.context)

    const { id: jobId } = await params

    // Verify user has access to this job
    const job = await db.serviceRequest.findFirst({
      where: {
        id: jobId,
        userId: authUser.id,
      },
      select: {
        id: true,
        userId: true,
        location: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 })
    }

    // Get contractor's latest location
    const latestLocation = await db.contractorLocationHistory.findFirst({
      where: { jobId },
      orderBy: { timestamp: 'desc' },
    })

    if (!latestLocation) {
      return NextResponse.json({
        eta: null,
        message: 'Contractor location not available',
      })
    }

    // Check cache
    const cacheKey = getCacheKey(jobId, latestLocation.latitude, latestLocation.longitude)
    const cached = etaCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json(cached.data)
    }

    // Determine destination coordinates
    let destLat: number | undefined
    let destLng: number | undefined

    // Geocode the location string (Google Geocoding, cached per job address)
    if (job.location) {
      const coords = await geocodeJobLocation(jobId, job.location)
      if (coords) {
        destLat = coords.lat
        destLng = coords.lng
      }
    }

    if (!destLat || !destLng) {
      return NextResponse.json({
        eta: null,
        message: 'Could not determine destination coordinates',
      })
    }

    // Call Google Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${latestLocation.latitude},${latestLocation.longitude}&destination=${destLat},${destLng}&departure_time=now&traffic_model=best_guess&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`

    const directionsRes = await fetch(directionsUrl)
    const directionsData: DirectionsResponse = await directionsRes.json()

    if (directionsData.status !== 'OK' || !directionsData.routes?.[0]?.legs?.[0]) {
      return NextResponse.json({
        eta: null,
        message: 'Could not calculate route',
      })
    }

    const leg = directionsData.routes[0].legs[0]
    const route = directionsData.routes[0]

    // Prefer traffic-aware duration if available
    const durationSeconds = leg.duration_in_traffic?.value || leg.duration.value
    const durationMinutes = Math.ceil(durationSeconds / 60)
    const distanceMetres = leg.distance.value
    const distanceKm = distanceMetres / 1000

    // Determine traffic condition based on difference between normal and traffic duration
    let trafficCondition: 'clear' | 'moderate' | 'heavy' = 'clear'
    if (leg.duration_in_traffic) {
      const normalDuration = leg.duration.value
      const trafficDuration = leg.duration_in_traffic.value
      const trafficRatio = trafficDuration / normalDuration

      if (trafficRatio > 1.5) {
        trafficCondition = 'heavy'
      } else if (trafficRatio > 1.2) {
        trafficCondition = 'moderate'
      }
    }

    const result = {
      eta: durationMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      trafficCondition,
      durationText: leg.duration_in_traffic?.text || leg.duration.text,
      distanceText: leg.distance.text,
      routePolyline: route.overview_polyline.points,
      contractorLocation: {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
      },
      destinationLocation: {
        latitude: destLat,
        longitude: destLng,
      },
      calculatedAt: new Date().toISOString(),
    }

    // Cache the result
    etaCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL })

    // Clean up old cache entries periodically
    if (Math.random() < 0.1) {
      const now = Date.now()
      for (const [key, value] of etaCache.entries()) {
        if (value.expiry < now) {
          etaCache.delete(key)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating ETA:', error)
    return NextResponse.json({ error: 'Failed to calculate ETA' }, { status: 500 })
  }
}
