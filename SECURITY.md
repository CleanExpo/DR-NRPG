# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Disaster Recovery NRPG platform, please report it responsibly:

- **Email:** security@disasterrecovery.com.au
- **Do NOT:** Use the public issue tracker
- **Response Time:** We aim to respond within 24 hours

## Security Best Practices

### Environment Variables

All sensitive configuration is stored in environment variables. Never commit `.env` files to git.

#### Required Variables
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Base URL for authentication callbacks (e.g., `http://localhost:3000`)
- `DATABASE_URL` - PostgreSQL connection string

#### Optional Variables
- `OPENAI_API_KEY` - For AI-powered features
- `STRIPE_SECRET_KEY` - For payment processing
- `TWILIO_ACCOUNT_SID` - For SMS notifications
- `REDIS_URL` - For caching and session storage

#### Security Rules
- Never commit `.env` files to git
- Use `.env.local` for local development (auto-ignored by git)
- Store production secrets in hosting provider's secret management
- Rotate secrets every 90 days
- Use different secrets for each environment (dev, staging, production)
- Review `.gitignore` to ensure all `.env*` files are excluded

### API Security

#### Rate Limiting

All API endpoints are protected with rate limiting to prevent abuse:

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| Public | 5 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| API (Authenticated) | 30 requests | 1 minute |
| Admin | 100 requests | 1 minute |

Rate limit headers are included in responses:
- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Requests remaining
- `RateLimit-Reset` - Time when limit resets

#### Input Validation

All API routes use Zod schemas for validation:
- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- Phone number format validation
- ZIP code format validation
- SQL injection prevention through Prisma ORM
- Type-safe request/response handling

### Authentication

#### Password Security
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Validated on both client and server

#### Session Management
- JWT tokens with 24-hour expiration
- Secure HTTP-only cookies
- CSRF protection enabled
- Session invalidation on logout
- Automatic session cleanup on inactivity

#### Login Attempt Tracking
- Failed attempts logged to database
- IP address and user agent captured
- Automatic account lockout after 5 failed attempts
- Manual admin review required for unlock
- Audit trail maintained for compliance

### Data Protection

#### Database Security
- Connection via SSL/TLS in production
- Prepared statements (Prisma ORM prevents injection)
- Role-based access control (RBAC)
- Sensitive data encryption at rest
- Automatic backups with encryption
- Data retention policies enforced

#### HTTPS Enforcement
- All production traffic over HTTPS
- HSTS header enabled (`max-age=31536000`)
- Automatic HTTP to HTTPS redirect
- Certificate pinning for critical APIs

### Security Headers

All responses include security headers to prevent common attacks:

```
X-Content-Type-Options: nosniff
  → Prevents MIME type sniffing

X-Frame-Options: DENY
  → Prevents clickjacking attacks

X-XSS-Protection: 1; mode=block
  → Enables XSS protection

Strict-Transport-Security: max-age=31536000; includeSubDomains
  → Forces HTTPS for all future requests

Content-Security-Policy: default-src 'self'; ...
  → Restricts resource loading sources

Referrer-Policy: strict-origin-when-cross-origin
  → Controls referrer information

Permissions-Policy: geolocation=(), microphone=(), camera=()
  → Restricts browser feature access

X-DNS-Prefetch-Control: off
  → Prevents DNS prefetching
```

### Fraud Detection

#### Automated Risk Scoring
- Transaction amount analysis
- User behavior patterns (velocity, frequency)
- IP geolocation checks
- Device fingerprinting
- Card number pattern analysis
- Behavioral anomaly detection

#### Risk Thresholds
- **Low (0-30):** Auto-approve
- **Medium (31-60):** Manual review recommended
- **High (61-80):** Manual review required
- **Critical (81-100):** Auto-reject with notification

#### Admin Review Process
1. Flagged transactions queue with risk breakdown
2. Risk factors and evidence displayed
3. Admin can: Approve, Reject, Flag, or Investigate
4. All decisions logged with admin identity for audit
5. Automatic notifications to user on rejection

## Dependency Management

### Automated Security Scanning

```bash
# Run security audit
npm run security:audit

# Fix known vulnerabilities
npm run security:fix

# Check for moderate+ vulnerabilities
npm run security:check
```

### Update Schedule
- **Critical vulnerabilities:** Immediate (< 24 hours)
- **High vulnerabilities:** Within 7 days
- **Medium/Low vulnerabilities:** Monthly review
- **Dependency updates:** Quarterly review
- **Patch releases:** Weekly check

## Incident Response Plan

### Phase 1: Detection & Assessment (0-1 hour)
1. Incident reported or detected via monitoring
2. Severity assessment using CVSS scoring
3. Stakeholder notification (security team + management)
4. Initial containment (firewall rules, IP blocking)

### Phase 2: Containment (1-4 hours)
1. Disable affected credentials/endpoints
2. Implement temporary fixes
3. Preserve evidence for forensics
4. Monitor for ongoing attacks
5. Increase logging and monitoring

### Phase 3: Eradication (4-24 hours)
1. Identify root cause
2. Develop permanent fix
3. Test in staging environment
4. Deploy to production
5. Verify fix effectiveness

### Phase 4: Recovery (24-48 hours)
1. Restore normal operations
2. Monitor for recurrence
3. Verify fix effectiveness
4. Update security controls
5. Clear breach notification flags

### Phase 5: Post-Incident (48+ hours)
1. Post-mortem analysis
2. Document lessons learned
3. Update security policies
4. Notify affected users (if applicable)
5. Regulatory compliance reporting
6. Update security runbooks

## Compliance

### Data Privacy
- GDPR compliance for EU users
- CCPA compliance for California users
- Data retention policies enforced
- Right to deletion implemented
- Data export functionality available

### PCI DSS
- No storage of full credit card numbers
- Stripe handles all card data
- PCI SAQ-A compliance maintained
- Quarterly vulnerability scanning
- Annual penetration testing

### SOC 2
- Security controls documented
- Access logs maintained
- Regular security audits
- Vendor risk assessments
- Change management procedures

### HIPAA (if applicable)
- Business associate agreements in place
- Encryption at rest and in transit
- Access controls and audit logging
- Data breach notification procedures
- Regular risk assessments

## Security Training

All team members receive:
- Secure coding practices training (annual)
- OWASP Top 10 awareness
- Phishing awareness training (quarterly)
- Incident response procedures
- Social engineering awareness
- Password management best practices

## Security Checklist

### Before Deployment
- [ ] Environment variables validated
- [ ] Security headers verified in browser dev tools
- [ ] Rate limiting tested on all endpoints
- [ ] Input validation tested with malicious data
- [ ] SQL injection tests passed
- [ ] XSS protection verified
- [ ] HTTPS configured and verified
- [ ] Database backups tested
- [ ] Logging and monitoring configured
- [ ] Security audit passed

### After Deployment
- [ ] Monitor logs for suspicious activity
- [ ] Review rate limit hits
- [ ] Monitor failed login attempts
- [ ] Review fraud detection alerts
- [ ] Check SSL certificate expiration
- [ ] Verify backup integrity

### Weekly Tasks
- [ ] Review security logs
- [ ] Check failed login trends
- [ ] Review fraud detection flags
- [ ] Verify monitoring alerts

### Monthly Tasks
- [ ] Run security audit: `npm run security:audit`
- [ ] Review access logs
- [ ] Update security documentation
- [ ] Team security briefing

### Quarterly Tasks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Dependency review and updates
- [ ] Policy review and updates
- [ ] Team security training

### Annual Tasks
- [ ] Comprehensive security assessment
- [ ] Third-party security audit
- [ ] Disaster recovery drill
- [ ] Policy review and refresh
- [ ] Compliance verification

## Security Contact

For security inquiries: security@disasterrecovery.com.au

**Last Updated:** 2025-12-16
**Next Review:** 2026-03-16
