# Next.js App Router Patterns

**Skill ID**: nextjs-app-router-patterns
**Version**: 1.0.0

## Purpose
Next.js 15 App Router patterns for building pages, layouts, and API routes.

## Server vs Client Components

**Default: Server Components** (zero JS sent to client)

Use `'use client'` only when you need:
- Interactivity (onClick, useState)
- Browser APIs (localStorage, window)
- React Hooks
- Event listeners

## API Routes

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const bookings = await getBookings()
  return NextResponse.json({ bookings })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const booking = await createBooking(body)
  return NextResponse.json({ booking }, { status: 201 })
}
```

## Data Fetching

```typescript
// Parallel fetching (recommended)
const [user, bookings] = await Promise.all([
  getUser(),
  getBookings()
])
```

## Metadata

```typescript
export const metadata = {
  title: 'Dashboard',
  description: 'User dashboard'
}
```

Load this skill when working with Next.js pages, layouts, or API routes.
