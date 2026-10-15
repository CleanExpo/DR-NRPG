---
paths:
  - "apps/web/app/api/**"
---

# API Route Standards

## Every API route MUST have:
1. **Input validation** — Use zod schemas. Validate request body, query params, and path params.
2. **Authentication** — Auth middleware on every protected route. Never rely on client-side checks alone.
3. **Rate limiting** — Consider rate limits on all endpoints. Implement on auth and payment endpoints.
4. **Typed responses** — All responses must have TypeScript types. Use consistent error response format.
5. **Error handling** — try/catch on all async operations. Return appropriate HTTP status codes. Never expose internal errors to clients.

## Security checklist:
- Parameterised queries — never concatenate user input into SQL
- CSRF protection on state-changing endpoints (POST, PUT, DELETE, PATCH)
- Validate webhook signatures before processing external payloads (Stripe, Supabase, Sanity)
- Set security headers: CSP, X-Frame-Options, X-Content-Type-Options
- Never log sensitive data (tokens, passwords, PII)

## Response format:
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```
