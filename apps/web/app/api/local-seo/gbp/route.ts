/**
 * Google Business Profile API Route - NRPG Platform
 *
 * Endpoints for managing GBP locations:
 * - GET: List all GBP locations or get specific location
 * - POST: Create new GBP location or post update
 * - PATCH: Update existing GBP location
 * - DELETE: Remove GBP location
 */

import { NextRequest, NextResponse } from 'next/server';
import { gbpManager, PRIORITY_CITIES } from '@/lib/seo/gbp-manager';
import { AustralianStateCode } from '@/lib/seo/local-seo-types';
import citiesData from '@/data/australian-cities.json';
import { AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';

export const dynamic = 'force-dynamic';

// =============================================================================
// GET - List locations or get specific location
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const action = searchParams.get('action');
    const city = searchParams.get('city');

    // Get specific location
    if (locationId) {
      const result = await gbpManager.getLocation(locationId);
      return NextResponse.json(result);
    }

    // Monitor reviews across all locations
    if (action === 'reviews') {
      const result = await gbpManager.monitorReviews();
      return NextResponse.json(result);
    }

    // Get locations for specific city
    if (city) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      const cityData = citiesData.cities.find(c => c.slug === citySlug || c.city.toLowerCase() === city.toLowerCase());

      if (!cityData) {
        return NextResponse.json({
          success: false,
          error: { code: 'NOT_FOUND', message: `City "${city}" not found` },
        }, { status: 404 });
      }

      const stateCode = cityData.stateCode as AustralianStateCode;
      const locationId = `nrpg-${citySlug}-${stateCode.toLowerCase()}`;
      const result = await gbpManager.getLocation(locationId);

      return NextResponse.json(result);
    }

    // List all locations
    const result = await gbpManager.listLocations();

    return NextResponse.json({
      success: true,
      data: {
        locations: result.data || [],
        totalLocations: result.data?.length || 0,
        priorityCities: PRIORITY_CITIES,
        allCities: citiesData.cities.map(c => ({
          city: c.city,
          state: c.state,
          stateCode: c.stateCode,
          slug: c.slug,
        })),
      },
      meta: result.meta,
    });
  } catch (error) {
    console.error('[GBP API] GET error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 });
  }
}

// =============================================================================
// POST - Create location or post update
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Create new GBP location
    if (action === 'create' || action === 'createLocation') {
      const { city, stateCode } = body;

      if (!city || !stateCode) {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'city and stateCode are required' },
        }, { status: 400 });
      }

      const cityData = citiesData.cities.find(
        c => c.city.toLowerCase() === city.toLowerCase() || c.slug === city.toLowerCase()
      );

      if (!cityData) {
        return NextResponse.json({
          success: false,
          error: { code: 'NOT_FOUND', message: `City "${city}" not found in database` },
        }, { status: 404 });
      }

      const stateInfo = AUSTRALIAN_LOCATIONS.find(s => s.code === stateCode);

      const result = await gbpManager.createLocation({
        city: cityData.city,
        state: stateInfo?.name || cityData.state,
        stateCode: stateCode as AustralianStateCode,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      });

      return NextResponse.json(result, { status: 201 });
    }

    // Post update to a location
    if (action === 'post' || action === 'postUpdate') {
      const { locationId, summary, type, callToAction, media, scheduledAt } = body;

      if (!locationId || !summary) {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'locationId and summary are required' },
        }, { status: 400 });
      }

      const result = await gbpManager.postUpdate(locationId, {
        type: type || 'UPDATE',
        summary,
        callToAction,
        media,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });

      return NextResponse.json(result, { status: 201 });
    }

    // Respond to review
    if (action === 'respondToReview') {
      const { reviewId, response, locationId } = body;

      if (!reviewId || !response || !locationId) {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'reviewId, response and locationId are required' },
        }, { status: 400 });
      }

      const result = await gbpManager.respondToReview(reviewId, response, locationId);
      return NextResponse.json(result);
    }

    // Upload photos
    if (action === 'uploadPhotos') {
      const { locationId, photos } = body;

      if (!locationId || !photos || !Array.isArray(photos)) {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'locationId and photos array are required' },
        }, { status: 400 });
      }

      const result = await gbpManager.uploadPhotos(locationId, photos);
      return NextResponse.json(result);
    }

    // Generate weekly posts for all locations
    if (action === 'generateWeeklyPosts') {
      const result = await gbpManager.generateWeeklyPosts();
      return NextResponse.json(result);
    }

    // Initialize priority locations (top 10 cities)
    if (action === 'initPriority') {
      const result = await gbpManager.initializePriorityLocations();
      return NextResponse.json(result);
    }

    // Initialize all locations
    if (action === 'initAll') {
      const result = await gbpManager.initializeAllLocations();
      return NextResponse.json(result);
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` },
    }, { status: 400 });
  } catch (error) {
    console.error('[GBP API] POST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 });
  }
}

// =============================================================================
// PATCH - Update location
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, updates } = body;

    if (!locationId) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'locationId is required' },
      }, { status: 400 });
    }

    // Update hours
    if (updates?.openingHours) {
      const result = await gbpManager.updateHours(locationId, updates.openingHours);
      return NextResponse.json(result);
    }

    // General update
    const result = await gbpManager.updateLocation(locationId, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GBP API] PATCH error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 });
  }
}

// =============================================================================
// DELETE - Remove location
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'locationId query parameter is required' },
      }, { status: 400 });
    }

    const result = await gbpManager.deleteLocation(locationId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GBP API] DELETE error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 });
  }
}
