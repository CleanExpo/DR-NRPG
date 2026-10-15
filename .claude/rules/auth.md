---
paths:
  - "apps/web/lib/auth*.ts"
  - "apps/web/src/lib/auth/**"
  - "apps/web/middleware.ts"
  - "apps/web/app/api/auth/**"
  - "**/auth/**"
---

# Authentication & Authorisation Standards

## Auth architecture:
- NextAuth.js for session management
- JWT tokens for API authentication
- CORS configured for approved origins only
- Session validation on every protected route — never trust client-side auth alone

## Route protection:
- Every protected API route checks auth via middleware or getServerSession
- Role-based access: check user role before processing (admin, contractor, client)
- Never expose user IDs or internal identifiers in client-facing responses
- Token refresh: handle expired tokens gracefully with proper error codes

## Password & credential handling:
- Never store plaintext passwords
- Never log tokens, passwords, or session data
- Never include credentials in URL parameters
- Secrets in environment variables only — never in code

## JWT patterns:
- Short-lived access tokens (15min default)
- Longer-lived refresh tokens stored securely
- Validate token signature and expiry on every request
- Include only necessary claims — minimise token payload

## Mobile app preparation:
- JWT auth + CORS already configured for future iOS/Android apps
- Push notification tokens: store per-device, clean up on logout
- Deep link handling: validate all deep link URLs server-side
