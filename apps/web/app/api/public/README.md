# Public API Namespace

## Overview

The `/api/public/*` namespace contains public-facing API endpoints for the marketing site. These endpoints handle unauthenticated requests from potential customers and contractors.

**Key Features:**
- ✅ Rate limiting (IP-based)
- ✅ CAPTCHA verification (reCAPTCHA v3)
- ✅ Honeypot spam detection
- ✅ Bot detection via User-Agent
- ✅ CSP security headers
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ CORS support
- ✅ Zod validation schemas

---

## Endpoints

### 1. Lead Capture (Claim Form Submissions)

**Endpoint:** `POST /api/public/lead-capture`

**Rate Limit:** 5 requests per 15 minutes per IP

**Purpose:** Handle claim form submissions from customers experiencing disaster damage.

**Request Body:**
```typescript
{
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Australian format: 04XX XXX XXX or 0X XXXX XXXX

  // Property Information
  propertyAddress: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
  postcode: string; // 4-digit Australian postcode

  // Damage Information
  damageType: "WATER_DAMAGE" | "FIRE_DAMAGE" | "SMOKE_DAMAGE" | "MOULD_REMEDIATION" | "STORM_DAMAGE" | "FLOOD_DAMAGE" | "OTHER";
  damageDescription: string; // 10-1000 characters

  // Insurance Information
  hasInsurance: boolean;
  insuranceProvider?: "NRMA" | "SUNCORP" | "ALLIANZ" | "QBE" | "IAG" | "CGU" | "MEDIBANK" | "OTHER";
  claimNumber?: string;

  // Urgency
  urgency: "URGENT" | "HIGH" | "STANDARD" | "SCHEDULED";

  // Marketing
  preferredContactMethod?: "EMAIL" | "PHONE" | "SMS";
  marketingConsent?: boolean;

  // Security
  captchaToken?: string;
  honeypot?: string; // Should be empty/null

  // Metadata
  source?: string; // UTM tracking
  referrer?: string;
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your claim has been submitted successfully",
  "data": {
    "leadId": "uuid",
    "estimatedResponseTime": "within 2 hours"
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/public/lead-capture', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '0412345678',
    propertyAddress: '123 Main St',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    damageType: 'WATER_DAMAGE',
    damageDescription: 'Burst pipe in kitchen causing water damage to floor and walls',
    hasInsurance: true,
    insuranceProvider: 'NRMA',
    urgency: 'URGENT',
    captchaToken: 'recaptcha_token_here',
  }),
});
```

---

### 2. Triage (Damage Assessment Tool)

**Endpoint:** `POST /api/public/triage`

**Rate Limit:** 10 requests per 15 minutes per IP

**Purpose:** Process interactive damage assessment questionnaire to provide urgency score and recommendations.

**Request Body:**
```typescript
{
  // Contact Information (optional for initial triage)
  email?: string;
  phone?: string;

  // Triage Responses
  responses: Array<{
    questionId: string;
    answer: string | number | boolean | string[];
  }>;

  // Property Information
  postcode?: string;
  state?: string;

  // Metadata
  triageSessionId?: string; // For multi-step triage
  completedAt?: string; // ISO datetime

  // Security
  captchaToken?: string;
  honeypot?: string;
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Assessment completed successfully",
  "data": {
    "triageId": "uuid",
    "results": {
      "urgencyLevel": "URGENT",
      "urgencyScore": 85,
      "estimatedCost": 5000,
      "estimatedCostRange": {
        "min": 3500,
        "max": 6500
      },
      "recommendations": [
        "Immediate water extraction required",
        "Professional mould remediation required"
      ],
      "requiredServices": ["WATER_DAMAGE", "MOULD_REMEDIATION"],
      "nextSteps": [
        "An emergency response team will contact you within 2 hours",
        "Prepare photos of the damaged areas",
        "Contact your insurance provider if applicable",
        "Do not attempt repairs yourself - this may void insurance coverage"
      ]
    }
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/public/triage', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    postcode: '2000',
    state: 'NSW',
    responses: [
      { questionId: 'water_standing', answer: true },
      { questionId: 'water_source', answer: 'pipe' },
      { questionId: 'affected_area', answer: 'entire floor' },
      { questionId: 'mould_visible', answer: true },
      { questionId: 'when_occurred', answer: 'today' },
    ],
    captchaToken: 'recaptcha_token_here',
  }),
});
```

---

### 3. Newsletter Subscription

**Endpoint:** `POST /api/public/newsletter`

**Rate Limit:** 10 requests per 15 minutes per IP

**Purpose:** Subscribe to disaster recovery tips, news, and updates newsletter.

**Request Body:**
```typescript
{
  // Contact Information
  email: string;
  firstName?: string;
  lastName?: string;

  // Preferences
  interests?: Array<
    | "WATER_DAMAGE"
    | "FIRE_DAMAGE"
    | "MOULD_PREVENTION"
    | "STORM_PREPAREDNESS"
    | "INSURANCE_TIPS"
    | "RESTORATION_NEWS"
    | "GENERAL"
  >;

  // Location
  state?: string;
  postcode?: string;

  // Consent (required)
  marketingConsent: true;

  // Security
  captchaToken?: string;
  honeypot?: string;

  // Metadata
  source?: string;
  referrer?: string;
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter! Check your email to confirm.",
  "data": {
    "status": "subscribed",
    "interests": ["WATER_DAMAGE", "MOULD_PREVENTION"]
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

**Unsubscribe:**

**Endpoint:** `DELETE /api/public/newsletter?email=xxx&token=xxx`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "You have been successfully unsubscribed from our newsletter.",
  "data": {
    "status": "unsubscribed"
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

---

### 4. Contractor Inquiry (NRPG Application)

**Endpoint:** `POST /api/public/contractor-inquiry`

**Rate Limit:** 3 requests per hour per IP (strict)

**Purpose:** Submit contractor application to join the NRPG network.

**Request Body:**
```typescript
{
  // Business Information
  businessName: string;
  abn: string; // 11-digit Australian Business Number
  businessType: "SOLE_TRADER" | "PARTNERSHIP" | "COMPANY" | "TRUST";

  // Contact Information
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;

  // Business Address
  businessAddress: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
  postcode: string;

  // Services Offered
  servicesOffered: Array<string>; // See service types in validation schema

  // Service Areas
  serviceAreas: Array<string>; // Australian states

  // Certifications (optional)
  certifications?: Array<{
    type: string; // industry certification type, or one of "INSURANCE_APPROVED", "TRADE_LICENSE", "OTHER"
    name: string;
    number?: string;
    expiryDate?: string;
  }>;

  // Insurance (required)
  hasPublicLiability: boolean;
  publicLiabilityAmount?: number; // Minimum $1M
  hasWorkersCompensation: boolean;

  // Experience
  yearsInBusiness: number;
  numberOfEmployees: number;

  // Additional Information
  additionalInfo?: string;
  website?: string;
  availability24x7?: boolean;
  emergencyResponseTime?: "UNDER_2_HOURS" | "SAME_DAY" | "NEXT_DAY" | "SCHEDULED";

  // Consent (required)
  termsAccepted: true;
  backgroundCheckConsent: true;

  // Security
  captchaToken?: string;
  honeypot?: string;

  // Metadata
  source?: string;
  referrer?: string;
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your contractor application has been submitted successfully",
  "data": {
    "applicationId": "uuid",
    "status": "AUTO_APPROVED", // or "REVIEW_REQUIRED" or "NEEDS_MORE_INFO"
    "nextSteps": [
      "Your application has been preliminarily approved",
      "We will conduct background and credential verification",
      "You will receive onboarding instructions within 2-3 business days",
      "Prepare copies of your insurance certificates and licenses"
    ],
    "estimatedReviewTime": "2-3 business days"
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

---

## Security Features

### 1. Rate Limiting

All endpoints implement IP-based rate limiting:
- **Lead Capture:** 5 requests / 15 minutes
- **Triage:** 10 requests / 15 minutes
- **Newsletter:** 10 requests / 15 minutes
- **Contractor Inquiry:** 3 requests / hour

Headers returned:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2025-01-02T12:15:00.000Z
Retry-After: 900 (if rate limited)
```

### 2. CAPTCHA Verification

All endpoints support Google reCAPTCHA v3:
- **Lead Capture:** Score threshold 0.5
- **Triage:** Score threshold 0.3 (more lenient)
- **Newsletter:** Score threshold 0.4
- **Contractor Inquiry:** Score threshold 0.6 (strictest)

### 3. Honeypot Fields

Include hidden `honeypot` field in forms (should remain empty):
```html
<input type="text" name="honeypot" style="display: none;" tabindex="-1" autocomplete="off" />
```

### 4. Bot Detection

User-Agent based bot detection automatically rejects common bot patterns.

### 5. Security Headers

All responses include:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 6. CORS Support

CORS headers enable cross-origin requests from approved domains.

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "validationErrors": {
        "email": ["Invalid email format"],
        "phone": ["Invalid Australian phone number format"]
      }
    },
    "timestamp": "2025-01-02T12:00:00.000Z",
    "requestId": "req_1735819200_abc123"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `AUTHENTICATION_ERROR` (401) - Authentication required
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `DUPLICATE_ENTRY` (409) - Resource already exists
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error
- `EXTERNAL_SERVICE_ERROR` (502) - External service failure

---

## Environment Variables

```bash
# CAPTCHA (choose one)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Optional: Redis for distributed rate limiting (production)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Testing Endpoints

```bash
# Test lead capture
curl -X POST http://localhost:3000/api/public/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "0412345678",
    "propertyAddress": "123 Main St",
    "suburb": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "damageType": "WATER_DAMAGE",
    "damageDescription": "Test description",
    "hasInsurance": true,
    "urgency": "STANDARD",
    "marketingConsent": true
  }'
```

---

## Production Deployment

### Checklist

- [ ] Configure CAPTCHA secret keys
- [ ] Set up database connection
- [ ] Configure allowed CORS origins
- [ ] Set up Redis for distributed rate limiting (recommended)
- [ ] Configure email service for notifications
- [ ] Set up monitoring and alerting
- [ ] Test all endpoints with production data
- [ ] Load test rate limiting
- [ ] Security audit
- [ ] GDPR compliance review

### Monitoring

Track these metrics:
- Request count per endpoint
- Response times (p50, p95, p99)
- Error rates by status code
- Rate limit hit rate
- CAPTCHA verification success rate
- Bot detection rate

---

## Database Models

See Prisma schema additions for new tables:
- `LeadCapture`
- `TriageAssessment`
- `NewsletterSubscription`
- `ContractorInquiry`

---

## TODO: Future Enhancements

- [ ] Email notification system integration
- [ ] SMS notifications for urgent cases
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Email marketing platform integration (Mailchimp, SendGrid)
- [ ] Advanced triage AI recommendations
- [ ] Multi-language support
- [ ] File upload support (photos, documents)
- [ ] Real-time chat integration
- [ ] Webhook callbacks for third-party integrations
- [ ] API analytics dashboard

---

## Support

For questions or issues:
- Technical: tech@disasterrecovery.com.au
- Business: sales@disasterrecovery.com.au
- Security: security@disasterrecovery.com.au
