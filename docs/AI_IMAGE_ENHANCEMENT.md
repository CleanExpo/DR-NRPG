# AI Image Enhancement System

## Overview

The AI Image Enhancement system automatically generates expert-level E.E.A.T.-optimized descriptions for inspection photos using GPT-4 Vision. This improves SEO performance by demonstrating technical expertise, referencing Australian building codes and IICRC standards.

## Features

- **E.E.A.T. Optimization**: Generates descriptions that demonstrate Experience, Expertise, Authoritativeness, and Trustworthiness
- **Context-Aware**: Analyzes images with full claim context (damage area, materials, compliance codes)
- **Batch Processing**: Process hundreds of images efficiently with progress tracking
- **Cost Control**: Built-in budget caps and cost estimation
- **Multi-Tenant**: Fully tenant-scoped for platform use

## Quick Start

### Prerequisites

1. OpenAI API key with GPT-4o access
2. PostgreSQL database (schema already migrated)
3. Existing inspection photos with Cloudinary URLs

### Configuration

Add these environment variables to your `.env` file:

```bash
# Required
OPENAI_API_KEY=sk-proj-...

# Optional (defaults shown)
AI_IMAGE_ENHANCEMENT_ENABLED=true
AI_IMAGE_ENHANCEMENT_MAX_BATCH_SIZE=100
AI_IMAGE_ENHANCEMENT_MAX_COST_USD=100.00
AI_IMAGE_ENHANCEMENT_RATE_LIMIT_RPM=400
AI_IMAGE_ENHANCEMENT_MODEL=gpt-4o
```

### Usage

#### 1. Single Image Enhancement

```bash
POST /api/admin/ai-enhancement/images/{photoId}
```

**Example:**
```bash
curl -X POST https://your-domain.com/api/admin/ai-enhancement/images/clxxx123 \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "photoId": "clxxx123",
  "description": "Severe water damage to structural timber framing and plasterboard ceiling linings in accordance with AS 3959 classification...",
  "cost": 0.0024,
  "processingTime": 2341
}
```

#### 2. Batch Enhancement

```bash
POST /api/admin/ai-enhancement/images
```

**Request Body:**
```json
{
  "limit": 100,
  "reportId": "clyyy456",
  "damageCategory": "WATER_DAMAGE",
  "minDate": "2025-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "clzzz789",
  "totalImages": 250,
  "estimatedCost": 0.60,
  "message": "Batch job started"
}
```

#### 3. Check Job Status

```bash
GET /api/admin/ai-enhancement/jobs?page=1&limit=10&status=PROCESSING
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "clzzz789",
      "status": "PROCESSING",
      "totalImages": 250,
      "processedImages": 123,
      "successCount": 121,
      "failureCount": 2,
      "totalCost": 0.30,
      "startedAt": "2025-02-02T10:00:00Z",
      "estimatedCompletion": "2025-02-02T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 4. Get Statistics

```bash
GET /api/admin/ai-enhancement/stats
```

**Response:**
```json
{
  "totalPhotos": 5000,
  "enhancedPhotos": 3200,
  "pendingPhotos": 1800,
  "totalCostUSD": 80.00,
  "avgCostPerImage": 0.025,
  "avgProcessingTime": 2200,
  "successRate": 98.5,
  "lastProcessedAt": "2025-02-02T10:30:00Z"
}
```

## Database Schema

### New Models

#### AIImageEnhancementLog
Tracks each enhancement operation with cost and performance metrics.

```prisma
model AIImageEnhancementLog {
  id           String   @id @default(cuid())
  photoId      String
  reportId     String
  prompt       String   @db.Text
  originalDesc String?  @db.Text
  enhancedDesc String   @db.Text
  model        String
  tokensUsed   Int
  costUSD      Decimal  @db.Decimal(10, 4)
  processingMs Int
  success      Boolean
  error        String?
  tenantId     String?
  createdAt    DateTime @default(now())
}
```

#### AIBatchProcessingJob
Manages batch processing operations with progress tracking.

```prisma
model AIBatchProcessingJob {
  id              String   @id @default(cuid())
  jobType         String
  status          String
  totalImages     Int
  processedImages Int
  successCount    Int
  failureCount    Int
  totalCostUSD    Decimal
  startedAt       DateTime?
  completedAt     DateTime?
  initiatedBy     String
  tenantId        String?
  metadata        Json?
}
```

#### InspectionPhoto Updates
Added AI enhancement tracking fields.

```prisma
model InspectionPhoto {
  // ... existing fields ...

  // AI Enhancement
  aiEnhanced      Boolean   @default(false)
  aiEnhancedAt    DateTime?
  aiModel         String?
  enhancementLogs AIImageEnhancementLog[]
}
```

## Cost Management

### Pricing (GPT-4o)
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens
- **Average cost per image: $0.0024**

### Budget Controls
- Environment variable: `AI_IMAGE_ENHANCEMENT_MAX_COST_USD`
- Batch operations check estimated cost before processing
- Automatic job termination if budget exceeded
- Real-time cost tracking in database

### Cost Optimization Tips
1. Process images in batches during off-peak hours
2. Use filters to target specific images (e.g., high-value claims)
3. Monitor `avgCostPerImage` to detect prompt inefficiencies
4. Consider using GPT-4o-mini for lower-priority images (future)

## E.E.A.T. Optimization

Generated descriptions include:

### Experience
- Specific materials (e.g., "Oregon timber joists", "R2.5 ceiling insulation")
- Precise measurements (e.g., "saturation levels exceeding 20%")
- Technical terminology (e.g., "secondary mould colonisation")

### Expertise
- Industry standards (e.g., "industry standards")
- Technical restoration terms (e.g., "immediate extraction and drying")

### Authoritativeness
- Australian building codes (e.g., "AS 3959 classification")
- Jurisdiction-specific regulations

### Trustworthiness
- Factual, professional tone
- Specific actionable insights
- Australian English spelling (colour, mould, metre)

## Monitoring & Troubleshooting

### Health Checks
Monitor these metrics:
- Success rate (target: >95%)
- Average processing time (target: <3s)
- Cost per image (target: <$0.05)

### Common Issues

#### "Unauthorized" Error
- Ensure user has ADMIN or SUPER_ADMIN role
- Check NextAuth session is valid

#### "No description generated by AI"
- Verify OpenAI API key is valid
- Check API quota hasn't been exceeded
- Review prompt template for issues

#### "Estimated cost exceeds maximum budget"
- Increase `AI_IMAGE_ENHANCEMENT_MAX_COST_USD`
- Reduce batch size
- Apply more specific filters

#### High Cost Per Image
- Review prompt template length
- Check if responses are unexpectedly long
- Verify token estimation is accurate

### Logs
All operations are logged to `AIImageEnhancementLog` table:
```sql
SELECT * FROM ai_image_enhancement_logs
WHERE success = false
ORDER BY created_at DESC
LIMIT 10;
```

## Security

### Authorization
- All endpoints require ADMIN or SUPER_ADMIN role
- Tenant-scoped data access for non-super-admins
- Session validation via NextAuth

### Data Privacy
- Prompts include claim context but no PII
- Images are accessed via secure Cloudinary URLs
- All logs are tenant-scoped

### API Key Protection
- OpenAI API key stored as environment variable
- Never exposed to client-side code
- Rotated periodically (recommended)

## Future Enhancements

### Planned Features
- [ ] Admin UI dashboard for monitoring
- [ ] Background queue processing (Redis/BullMQ)
- [ ] Real-time enhancement on upload
- [ ] Quality scoring and human feedback
- [ ] Multi-language support
- [ ] GPT-4o-mini option for cost reduction
- [ ] Image similarity detection (reuse descriptions)
- [ ] Accessibility: auto-generate alt text

## Support

For issues or questions:
1. Check logs: `apps/web/logs/ai-enhancement.log`
2. Review database: `ai_image_enhancement_logs` table
3. Monitor costs: OpenAI usage dashboard
4. GitHub Issues: https://github.com/your-repo/issues

## License

Proprietary - Disaster Recovery Platform
