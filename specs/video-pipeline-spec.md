---
project: Video Generation Pipeline
version: v1.0
status: Draft
owner: Phill McGurk
created: 2026-01-04
repository: https://github.com/CleanExpo/DR-New
content_source: https://github.com/CleanExpo/NRPG-Onboarding-Framework
---

# Video Generation Pipeline Specification

## Executive Summary

Automated video generation system for Disaster Recovery / NRPG platform that creates professional marketing, educational, and trust-building video content from existing onboarding framework documentation. The system generates, reviews, and publishes videos to YouTube with full SEO optimization, requiring minimal human intervention.

**Target:** 70 videos (Jan-July 2026) covering client journey, service explanations, and contractor value proposition.

**Budget:** ~$200/month API costs ($1,400 total through July), scaling with contractor/client revenue.

**Key Dates:**
- Soft Launch: April/May 2026
- RIA Conference: 25-27 August 2026 (Star Gold Coast)

**Core Message:** Professional restoration saves time and money. NRPG connects homeowners directly with vetted, qualified restoration specialists—eliminating middlemen who profit from delays.

---

## Problem Statement

1. No video content exists to build trust with homeowners in crisis
2. People don't know restoration professionals exist until after disaster strikes
3. The industry suffers from middlemen (TPAs, builders) who delay payments and provide subpar service
4. Manual video creation is expensive and doesn't scale
5. Content exists in onboarding modules but isn't being leveraged for marketing

---

## Success Criteria

| Metric | Target | Timeline | Measurement |
|--------|--------|----------|-------------|
| Initial videos live | 10 | Jan 2026 | YouTube published count |
| Soft launch ready | 40 | Apr 2026 | Full pipeline + content |
| Total videos | 70 | Jul 2026 | YouTube published count |
| RIA conference content | 7 | Aug 2026 | Conference-specific videos |
| Monthly generation | 10 | Ongoing | Automated pipeline output |
| Lighthouse score impact | No degradation | All | PageSpeed Insights |
| Schema validation | 100% VideoObject | All | Schema.org validator |
| Conversion correlation | Track | Post-launch | GA4 video → form submission |

---

## Scope

### In Scope

- Automated video generation from NRPG-Onboarding-Framework content
- Text-to-video using Google Veo 3.1
- Image generation using Nano Banana Pro
- Voice synthesis using ElevenLabs (Australian male voice)
- English audio with auto-generated subtitles
- YouTube hosting with unlisted → public workflow
- In-app review dashboard (approve/reject)
- SEO schema markup (VideoObject)
- Video sitemaps
- Transcripts for accessibility

### Out of Scope (V1)

- Live video calls
- User-generated content
- Manual video editing interface
- Full multi-language dubs (subtitles only)
- Real-time video streaming
- Contractor video testimonials (future phase)

### Future Considerations

- Podcast generation from content
- Interactive video elements
- A/B testing of video variants
- Contractor-submitted content integration
- Finance option explainer videos

---

## User Model

### Primary Audience: Homeowner in Crisis

**Profile:**
- Just discovered water/fire/storm damage
- Stressed, possibly panicked, overwhelmed
- Doesn't know restoration professionals exist
- May think they need plumber/builder/insurance first
- Accessing site on mobile (standing in flooded kitchen)
- Possibly after-hours when disaster struck

**Needs:**
- Immediate reassurance someone can help
- Understanding of the process
- Trust that they won't be ripped off
- Clear next step (not multiple options)

**Video Response:**
- Calm, reassuring tone
- Short (30-60 seconds for crisis content)
- Clear single CTA
- Mobile-optimized (vertical or landscape works)

### Secondary Audience: Researching Homeowner

**Profile:**
- Preparing for potential disaster (storm season)
- Comparing options after initial damage
- More time to consume content
- Desktop or mobile

**Needs:**
- Education on restoration process
- Understanding of what to expect
- Comparison with alternatives (why not just call insurance?)

**Video Response:**
- Can be longer (60-90 seconds)
- More educational depth
- Multiple videos in sequence acceptable

### Tertiary Audience: Potential Contractor

**Profile:**
- Restoration business owner considering NRPG
- Frustrated with current TPA/builder model
- Looking for better payment terms
- Technical understanding of industry

**Needs:**
- Proof of professional standards
- Understanding of NRPG benefits
- Preview of training quality

**Video Response:**
- Module teasers (30-45 seconds)
- Professional/technical tone
- Emphasis on certification and standards

---

## Content Architecture

### Content Source

**Repository:** `NRPG-Onboarding-Framework`
**Path:** `C:\Disaster Recovery\NRPG-Onboarding-Framework`

**Structure:**
```
contractor-onboarding/
├── all-modules-summary.json          # Video planning reference
├── business-ownership-framework/     # 11 framework documents
│   ├── AUSTRALIAN_BUSINESS_PARTNERSHIP_MODEL.md
│   ├── BUSINESS_DEVELOPMENT_ASSESSMENT.md
│   ├── NRPG_SPECIALIZATION_FRAMEWORK.md
│   ├── NRPG_ONBOARDING_WORKFLOW.md
│   └── [7 more framework docs]
├── customer-service-excellence/      # 10 modules × 5 components
│   ├── course-info.json
│   └── modules/module-01 through module-10
└── water-damage-restoration/         # 12 modules × 5 components
    ├── course-info.json
    └── modules/module-01 through module-12
```

**Content Extraction:**
- Parse markdown files for key concepts
- Extract from JSON for structured data
- Summarize for video scripts (not verbatim)
- Cite IICRC, Australian Standards for authority

### Video Categories

| Category | Source Content | Videos | Priority |
|----------|---------------|--------|----------|
| Water Damage | WRT modules 01-08 | 9 | 1 |
| Client Journey | Onboarding Workflow + CSE | 14 | 2 |
| Mould & Contamination | WRT modules (mould sections) | 7 | 3 |
| Why NRPG | Business Partnership + Certification | 10 | 4 |
| Fire & Storm | WRT modules (fire/storm sections) | 6 | 5 |
| Contractor Teasers | All 22 module summaries | 12 | 6 |
| RIA Conference | Conference-specific messaging | 7 | 7 |
| Testimonials/Case Studies | Real examples (anonymized) | 5 | 8 |

**Total: 70 videos** (Jan-July 2026)

### Video Specifications

| Type | Length | Resolution | Style |
|------|--------|------------|-------|
| Crisis/Trust | 30-45 sec | 720p | Calm, reassuring |
| Process Explainer | 60-90 sec | 720p | Educational, clear |
| Technical Demo | 90-120 sec | 1080p | Professional, detailed |
| Module Teaser | 30-45 sec | 720p | Professional, preview |

**Audio:**
- ElevenLabs voice: Australian male, 45yo, professional tradesman tone
- Background: Subtle, non-distracting
- Subtitles: Auto-generated, burned in

**Visual Style:**
- Mixed realistic + animated
- Clean, not flashy
- Restoration imagery (equipment, water damage, technicians)
- NRPG/Disaster Recovery branding

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      VIDEO ORCHESTRATOR                          │
│  Gemini Pro - Plans content calendar, coordinates agents         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
  ┌───────────┬───────────┼───────────┬───────────┬───────────────┐
  ▼           ▼           ▼           ▼           ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ SCRIPT  │ │  IMAGE  │ │  VIDEO  │ │  VOICE  │ │ASSEMBLY │ │   SEO   │
│  AGENT  │ │  AGENT  │ │  AGENT  │ │  AGENT  │ │  AGENT  │ │ AGENT   │
│         │ │         │ │         │ │         │ │         │ │         │
│ Gemini  │ │  Nano   │ │Veo 3.1  │ │Eleven   │ │ FFmpeg  │ │ Schema  │
│  Pro    │ │ Banana  │ │  Fast   │ │  Labs   │ │         │ │Validate │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼           ▼
  Scripts    Reference    8-sec       Voice       Stitched   Validated
  Prompts    Images       clips       Audio       Video      Metadata
                          │           │           │
                          └─────┬─────┘           │
                                ▼                 │
                        ┌─────────────┐           │
                        │   YOUTUBE   │◄──────────┘
                        │    AGENT    │
                        │             │
                        │Upload/Manage│
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   REVIEW    │
                        │  DASHBOARD  │
                        │             │
                        │Approve/Reject│
                        └─────────────┘
```

### API Configuration

**Required Environment Variables:**
```env
# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=

# Gemini API
GEMINI_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=<voice-id>  # Non-runnable placeholder; choose an approved Australian voice

# YouTube Data API
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
YOUTUBE_CHANNEL_ID=

# Optional: Analytics
GA4_MEASUREMENT_ID=
GA4_API_SECRET=
```

### Agent Definitions

#### Script Agent
```yaml
name: script-agent
purpose: Generate video scripts from onboarding content
input: Markdown/JSON from NRPG-Onboarding-Framework
output: Structured script with scenes, dialogue, visual cues
model: gemini-pro
token_budget: 2000

responsibilities:
  - Parse source content for key messages
  - Structure into 8-second scene blocks
  - Write dialogue for ElevenLabs voice
  - Generate Veo prompts per scene
  - Include timing and transition notes
```

#### Image Agent
```yaml
name: image-agent
purpose: Generate reference images for video consistency
input: Script visual requirements
output: Reference images for Veo, thumbnails
model: gemini-3-pro-image (Nano Banana Pro)
token_budget: 500
cost: ~$0.15-0.24 per image

responsibilities:
  - Generate character reference images
  - Create scene establishing shots
  - Produce YouTube thumbnails
  - Maintain visual consistency across video
```

#### Video Agent
```yaml
name: video-agent
purpose: Generate video clips from scripts
input: Scene prompts, reference images
output: 8-second video clips with audio
model: veo-3.1-fast (drafts), veo-3.1 (finals)
cost: $0.15/sec (fast), $0.40/sec (standard)

responsibilities:
  - Generate 8-second clips per scene
  - Use reference images for consistency
  - Enable native audio generation
  - Handle scene extensions for longer videos
```

#### Voice Agent
```yaml
name: voice-agent
purpose: Generate voiceover from scripts
input: Dialogue text
output: Audio files with timestamps
api: ElevenLabs
voice: Australian male, professional, calm

responsibilities:
  - Generate voice audio for each scene
  - Maintain consistent voice across video
  - Provide timing markers for sync
  - Support multiple languages (future)
```

#### Assembly Agent
```yaml
name: assembly-agent
purpose: Stitch clips into final video
input: Video clips, audio tracks, subtitles
output: Final composed video
tools: FFmpeg

responsibilities:
  - Stitch 8-second clips in sequence
  - Sync voiceover with video
  - Add transitions between scenes
  - Burn in subtitles
  - Add intro/outro branding
  - Export in YouTube-optimized format
```

#### SEO Agent
```yaml
name: seo-agent
purpose: Optimize video metadata for search
input: Video content, script, target keywords
output: SEO metadata package
tools: Schema.org validator, YouTube API

responsibilities:
  - Generate VideoObject schema
  - Create optimized title/description
  - Generate tags and categories
  - Create video sitemap entry
  - Produce transcript for accessibility
  - Validate Lighthouse impact
```

#### YouTube Agent
```yaml
name: youtube-agent
purpose: Manage YouTube upload and publishing
input: Final video, metadata
output: YouTube video ID, status
api: YouTube Data API v3

responsibilities:
  - Upload video as unlisted to "Drafts" playlist
  - Apply metadata (title, description, tags)
  - Set thumbnail
  - Notify for review
  - Move to "Published" on approval
  - Delete on rejection
```

### Database Schema

```prisma
model Video {
  id            String   @id @default(cuid())
  title         String
  description   String   @db.Text
  category      String   // water-damage, client-journey, etc.
  status        VideoStatus @default(GENERATING)

  // Source
  sourceContent String   // Path to source markdown/json
  script        String   @db.Text

  // YouTube
  youtubeId     String?
  youtubeUrl    String?
  playlistId    String?  // drafts or published
  thumbnailUrl  String?

  // SEO
  schemaMarkup  Json?
  transcript    String?  @db.Text
  keywords      String[]

  // Metrics
  generationCost Float?
  generationTime Int?    // seconds
  viewCount     Int      @default(0)

  // Timestamps
  createdAt     DateTime @default(now())
  publishedAt   DateTime?
  updatedAt     DateTime @updatedAt

  // Relations
  scenes        Scene[]
  reviews       VideoReview[]
}

model Scene {
  id          String   @id @default(cuid())
  videoId     String
  video       Video    @relation(fields: [videoId], references: [id])

  order       Int
  duration    Int      // seconds
  prompt      String   @db.Text
  dialogue    String?  @db.Text
  clipUrl     String?
  audioUrl    String?

  createdAt   DateTime @default(now())
}

model VideoReview {
  id          String   @id @default(cuid())
  videoId     String
  video       Video    @relation(fields: [videoId], references: [id])

  reviewerId  String
  action      ReviewAction // APPROVED, REJECTED, REGENERATE
  notes       String?  @db.Text

  createdAt   DateTime @default(now())
}

enum VideoStatus {
  GENERATING
  DRAFT
  PENDING_REVIEW
  APPROVED
  PUBLISHED
  REJECTED
  FAILED
}

enum ReviewAction {
  APPROVED
  REJECTED
  REGENERATE
}
```

---

## Workflow

### Generation Pipeline

```
1. PLAN
   └─ Orchestrator selects next video from content calendar
   └─ Identifies source content files
   └─ Determines video category and specifications

2. SCRIPT
   └─ Script Agent reads source content
   └─ Generates scene-by-scene script
   └─ Includes Veo prompts and dialogue
   └─ Estimates duration and cost

3. ASSETS
   └─ Image Agent generates reference images
   └─ Creates thumbnail options
   └─ Stores in cloud storage

4. GENERATE
   └─ Video Agent generates 8-sec clips per scene
   └─ Voice Agent generates audio per scene
   └─ Clips stored temporarily

5. ASSEMBLE
   └─ Assembly Agent stitches clips
   └─ Syncs audio and video
   └─ Burns in subtitles
   └─ Adds branding

6. VALIDATE
   └─ SEO Agent generates schema
   └─ Creates transcript
   └─ Validates metadata

7. UPLOAD
   └─ YouTube Agent uploads as unlisted
   └─ Adds to "Drafts" playlist
   └─ Stores YouTube ID in database

8. NOTIFY
   └─ Sends notification to admin dashboard
   └─ Video appears in review queue

9. REVIEW
   └─ Human previews in dashboard (YouTube embed)
   └─ Approves → moves to "Published" playlist
   └─ Rejects → flags for regeneration
   └─ Regenerate → returns to step 2 with notes

10. PUBLISH
    └─ YouTube Agent changes to public
    └─ Adds to public playlist
    └─ Updates site embed
    └─ Submits to video sitemap
```

### Review Dashboard

**Location:** `/admin/videos`

**Features:**
- List of pending review videos
- YouTube embed player for preview
- Approve / Reject / Regenerate buttons
- Notes field for regeneration feedback
- Cost tracking per video
- Monthly budget status

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ Video Review Dashboard                    Budget: $67/$100  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [YouTube Video Embed]                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Title: What Happens in the First 24 Hours After Water...   │
│ Category: Water Damage                                      │
│ Duration: 62 seconds                                        │
│ Cost: $9.30                                                 │
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────────┐               │
│ │ APPROVE  │  │  REJECT  │  │ REGENERATE   │               │
│ └──────────┘  └──────────┘  └──────────────┘               │
│                                                             │
│ Notes: [                                               ]    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Queue: 3 pending  │  Published: 7  │  This month: 10       │
└─────────────────────────────────────────────────────────────┘
```

---

## SEO & Schema Implementation

### VideoObject Schema

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "What to Expect in the First 24 Hours After Water Damage",
  "description": "Professional restoration guide...",
  "thumbnailUrl": "https://...",
  "uploadDate": "2026-01-15T10:00:00+10:00",
  "duration": "PT1M2S",
  "contentUrl": "https://youtube.com/watch?v=...",
  "embedUrl": "https://youtube.com/embed/...",
  "publisher": {
    "@type": "Organization",
    "name": "Disaster Recovery Australia",
    "logo": {
      "@type": "ImageObject",
      "url": "https://..."
    }
  },
  "transcript": "Full transcript text..."
}
```

### Video Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://disasterrecovery.com.au/services/water-damage</loc>
    <video:video>
      <video:thumbnail_loc>https://...</video:thumbnail_loc>
      <video:title>Water Damage First 24 Hours</video:title>
      <video:description>...</video:description>
      <video:content_loc>https://youtube.com/watch?v=...</video:content_loc>
      <video:duration>62</video:duration>
    </video:video>
  </url>
</urlset>
```

### E-E-A-T Compliance

| Signal | Implementation |
|--------|----------------|
| Experience | Content from real contractor training modules |
| Expertise | industry standards references, Australian regulations |
| Authoritativeness | NRPG certification framework, industry partnerships |
| Trustworthiness | Transparent pricing ($2,750), no hidden fees messaging |

---

## Cost Management

### Quality-First Approach

Using **Veo 3.1 Standard ($0.40/sec)** for first-attempt quality:
- Fewer regenerations = lower actual cost
- 1080p output
- Better native audio sync
- Professional grade for soft launch and RIA conference

### API Cost Breakdown (Per Month @ 10 Videos)

| Service | Unit Cost | Typical Use | Est. Monthly |
|---------|-----------|-------------|--------------|
| Veo 3.1 Standard | $0.40/sec | 500 sec (10 × 50s avg) | $200 |
| Nano Banana Pro | $0.15/image | 20 images | $3 |
| ElevenLabs | ~$0.30/1000 chars | 10,000 chars | $3 |
| YouTube API | Free | N/A | $0 |
| Gemini Pro | ~$0.01/1000 tokens | 50,000 tokens | $0.50 |
| **Total** | | | **~$206.50** |

### 7-Month Budget (Jan-Jul 2026)

| Month | Videos | Focus | Budget |
|-------|--------|-------|--------|
| Jan | 10 | Water Damage + Foundation | $200 |
| Feb | 10 | Client Journey + Mould | $200 |
| Mar | 10 | Why NRPG + Fire/Storm | $200 |
| Apr | 10 | **Soft Launch** Polish | $200 |
| May | 10 | Contractor Content | $200 |
| Jun | 10 | Analytics-Driven | $200 |
| Jul | 10 | RIA Conference Prep | $200 |
| **Total** | **70** | | **$1,400** |

### Revenue-Based Scaling

Once paid contractors and clients flow through DR:
- Scale up: More videos, faster refresh, new categories
- Scale down: Reduce frequency if cash-constrained
- Target: Video budget = 5-10% of monthly DR revenue

### Budget Controls

```typescript
const BUDGET_CONFIG = {
  monthly_limit: 250.00,        // Buffer above $200 estimate
  warning_threshold: 0.75,      // Alert at 75%
  video_cost_estimate: 20.00,   // 50sec @ $0.40/sec avg
  max_videos_per_day: 2,
  auto_pause_at_limit: true,
  quality_tier: 'standard'      // veo-3.1 standard for quality
};
```

### Optimization Strategies

1. **Quality first, regenerate rarely** — Veo 3.1 Standard for best first-attempt results
2. **Batch similar videos** — Reuse reference images across related content
3. **Optimize script length** — Target 8-second scene boundaries exactly
4. **Use Fast tier for thumbnails only** — Reference images don't need Standard
5. **Monthly generation schedule** — Spread across month, not front-loaded
6. **Revenue-based scaling** — Increase budget when DR revenue flows

---

## Implementation Plan

### Phase 1: Foundation (Jan Week 1-2)
- [ ] Set up API credentials and verify access
- [ ] Create agent folder structure in `.claude/agents/video/`
- [ ] Build Script Agent with content parsing
- [ ] Test Gemini Pro script generation
- [ ] Verify NRPG-Onboarding-Framework access

**Deliverable:** Working script generation from source content

### Phase 2: Generation Pipeline (Jan Week 3-4)
- [ ] Build Image Agent with Nano Banana Pro
- [ ] Build Video Agent with Veo 3.1 Standard
- [ ] Build Voice Agent with ElevenLabs
- [ ] Test individual clip generation
- [ ] Verify quality and consistency

**Deliverable:** Single video clip generation working
**January Videos:** 10 (Water Damage focus)

### Phase 3: Assembly & YouTube (Feb Week 1-2)
- [ ] Build Assembly Agent with FFmpeg
- [ ] Implement subtitle burning
- [ ] Build YouTube Agent
- [ ] Set up playlists (Drafts, Published)
- [ ] Test upload workflow

**Deliverable:** End-to-end video generation and upload

### Phase 4: Review Dashboard (Feb Week 3-4)
- [ ] Build admin review UI
- [ ] Implement approve/reject/regenerate
- [ ] Add cost tracking
- [ ] Add budget alerts
- [ ] Test full workflow

**Deliverable:** Complete review workflow
**February Videos:** 10 (Client Journey + Mould)

### Phase 5: SEO & Automation (Mar)
- [ ] Build SEO Agent
- [ ] Implement VideoObject schema
- [ ] Create video sitemap
- [ ] Generate transcripts
- [ ] Lighthouse testing
- [ ] Content calendar automation

**Deliverable:** Fully autonomous pipeline
**March Videos:** 10 (Why NRPG + Fire/Storm)

### Phase 6: Soft Launch Prep (Apr)
- [ ] Polish all 40 videos
- [ ] Full SEO audit
- [ ] GA4 integration
- [ ] Performance tracking
- [ ] Fill content gaps

**Deliverable:** **Soft Launch Ready**
**April Videos:** 10 (Polish + Gaps)

### Phase 7: Scale & Optimize (May-Jul)
- [ ] Revenue-based scaling decisions
- [ ] Analytics-driven content priorities
- [ ] RIA Conference content production
- [ ] Contractor teaser videos

**May-July Videos:** 30 (Contractor + RIA focus)

### Key Milestones

| Date | Milestone |
|------|-----------|
| Jan 31, 2026 | Pipeline operational, 10 videos |
| Feb 28, 2026 | Full automation, 20 videos |
| Mar 31, 2026 | SEO complete, 30 videos |
| **Apr 30, 2026** | **Soft Launch, 40 videos** |
| Jul 31, 2026 | Pre-RIA complete, 70 videos |
| **Aug 25-27, 2026** | **RIA Conference** |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API costs exceed budget | Medium | High | Budget alerts, auto-pause |
| Video quality inconsistent | Medium | Medium | Reference images, prompt templates |
| YouTube API rate limits | Low | Medium | Queue system, batch uploads |
| Content parsing errors | Medium | Low | Validation, fallback prompts |
| Review bottleneck | Medium | Low | Notification system, mobile access |
| Veo 3.1 API changes | Low | High | Abstract API layer, version pinning |

---

## Messaging Guidelines

### The Industry Problem (Handle Carefully)

**The Truth:**
- Insurance industry uses "Delay, Deny, Defend"
- TPAs and builders profit from delays
- Contractors wait 30+ days for payment
- Subpar restoration leads to more building work

**How to Communicate:**
- Focus on the POSITIVE alternative, not attacks
- "Direct connection to qualified professionals"
- "Transparent pricing from day one"
- "No middlemen, no delays"
- "Your claim, your contractor, your timeline"

**Avoid:**
- Naming specific insurance companies
- Political framing
- Accusatory language
- Victim positioning

**Example Script Framing:**
```
WRONG: "Insurance companies are corrupt and delay your claim."

RIGHT: "When disaster strikes, you deserve immediate help from
qualified professionals—not weeks of waiting. NRPG connects you
directly with vetted restoration specialists who get paid upfront,
so they can focus on restoring your home, not chasing invoices."
```

---

## Content Tone

| Audience | Tone | Pacing | CTA Style |
|----------|------|--------|-----------|
| Crisis homeowner | Calm, reassuring | Slow, steady | Soft ("We're here to help") |
| Researching homeowner | Educational, confident | Medium | Informative ("Learn more") |
| Potential contractor | Professional, empathetic | Medium | Direct ("Join the network") |

**Voice Characteristics (ElevenLabs):**
- Australian accent
- Male, ~45 years old
- Professional tradesman
- Warm but authoritative
- No corporate stiffness

---

## RIA Conference Strategy (August 25-27, 2026)

**Event:** RIA 2026 Conference & Trade Show
**Venue:** The Star Gold Coast
**Dates:** August 25-27, 2026

### Conference-Specific Content (7 Videos)

| # | Title | Purpose | Length |
|---|-------|---------|--------|
| 1 | NRPG: The Future of Australian Restoration | Brand intro for conference | 90s |
| 2 | Why Leading Restorers Are Joining NRPG | Contractor recruitment | 60s |
| 3 | The Payment Problem: A Better Way | Industry message | 60s |
| 4 | Training Excellence: CSE Overview | Module showcase | 45s |
| 5 | Training Excellence: WRT Overview | Module showcase | 45s |
| 6 | Client Success Stories | Trust building | 60s |
| 7 | Join the Network | CTA for booth | 45s |

### Conference Goals

- **Brand Presence:** Videos playing at trade booth
- **Lead Capture:** QR codes linking to contractor signup
- **Industry Recognition:** Position NRPG as professional standard
- **Networking:** Use videos as conversation starters

### Pre-Conference Timeline

| Date | Action |
|------|--------|
| Jun 1 | Begin RIA-specific content planning |
| Jul 15 | All 7 conference videos complete |
| Aug 1 | Final review and approval |
| Aug 15 | Videos loaded on booth displays |
| Aug 25-27 | **Conference** |

---

## Appendices

### A. Content Source Files

Primary sources from NRPG-Onboarding-Framework:
```
contractor-onboarding/
├── business-ownership-framework/
│   ├── NRPG_ONBOARDING_WORKFLOW.md        # Client journey
│   ├── NRPG_OPERATIONAL_PROCEDURES.md     # What to expect
│   ├── PROFESSIONAL_CERTIFICATION_FRAMEWORK.md  # Why NRPG
│   └── NRPG_SPECIALIZATION_FRAMEWORK.md   # Standards
├── customer-service-excellence/
│   └── modules/                            # Client communication
└── water-damage-restoration/
    └── modules/                            # Technical content
```

### B. Video Content Calendar (70 Videos: Jan-Jul 2026)

#### Monthly Distribution

| Category | Jan | Feb | Mar | Apr | May | Jun | Jul | Total |
|----------|-----|-----|-----|-----|-----|-----|-----|-------|
| Water Damage | 5 | 2 | 1 | 1 | — | — | — | 9 |
| Client Journey | 3 | 4 | 2 | 2 | 2 | 1 | — | 14 |
| Mould | 1 | 3 | 2 | — | 1 | — | — | 7 |
| Why NRPG | 1 | 1 | 3 | 2 | 1 | 1 | 1 | 10 |
| Fire/Storm | — | — | 2 | 2 | 1 | 1 | — | 6 |
| Contractor Teasers | — | — | — | 2 | 3 | 4 | 3 | 12 |
| RIA Conference | — | — | — | — | — | 2 | 5 | 7 |
| Testimonial/Case | — | — | — | 1 | 2 | 1 | 1 | 5 |
| **Monthly Total** | **10** | **10** | **10** | **10** | **10** | **10** | **10** | **70** |

#### January Videos (Foundation)

| # | Title | Category | Source | Length |
|---|-------|----------|--------|--------|
| 1 | What Happens in the First 24 Hours | Water Damage | WRT-01 | 60s |
| 2 | Why Water Damage Needs Immediate Attention | Water Damage | WRT-02 | 45s |
| 3 | The Hidden Dangers of DIY Water Cleanup | Water Damage | WRT-03 | 60s |
| 4 | Understanding Moisture and Drying | Water Damage | WRT-04 | 60s |
| 5 | Equipment We Use (Thermal, Dehumidifiers) | Water Damage | WRT-05 | 60s |
| 6 | What to Expect When You Call | Client Journey | CSE-02 | 60s |
| 7 | The $2,750 Upfront Fee Explained | Client Journey | Onboarding | 45s |
| 8 | Understanding Your Restoration Report | Client Journey | Operational | 60s |
| 9 | Mould: When to Call a Professional | Mould | WRT (mould) | 60s |
| 10 | How NRPG Contractors Are Different | Why NRPG | Certification | 60s |

#### February Videos (Client Focus)

| # | Title | Category | Source | Length |
|---|-------|----------|--------|--------|
| 11 | Your First 48 Hours: A Checklist | Client Journey | Onboarding | 60s |
| 12 | How Insurance Reimbursement Works | Client Journey | Onboarding | 60s |
| 13 | What Restorers Do vs Don't Do | Client Journey | CSE | 45s |
| 14 | Why We're Not Builders or Plumbers | Client Journey | Operational | 45s |
| 15 | Category 1, 2, 3 Water Explained | Water Damage | WRT-06 | 60s |
| 16 | Structural Drying: What's Happening | Water Damage | WRT-07 | 60s |
| 17 | Black Mould: Facts vs Fiction | Mould | WRT (mould) | 60s |
| 18 | Mould Prevention After Water Damage | Mould | WRT (mould) | 45s |
| 19 | Air Quality Testing Explained | Mould | WRT (mould) | 45s |
| 20 | Meet the NRPG Standard | Why NRPG | Excellence | 45s |

#### March Videos (Industry Message)

| # | Title | Category | Source | Length |
|---|-------|----------|--------|--------|
| 21 | Fire Damage: The First 24 Hours | Fire/Storm | WRT (fire) | 60s |
| 22 | Smoke and Soot: What You Can't See | Fire/Storm | WRT (fire) | 60s |
| 23 | Direct to Professional: No Middlemen | Why NRPG | Partnership | 60s |
| 24 | Transparent Pricing: Why We're Upfront | Why NRPG | Certification | 60s |
| 25 | The Industry Standards We Follow | Why NRPG | Excellence | 45s |
| 26 | Client Journey: Start to Finish | Client Journey | Onboarding | 90s |
| 27 | What's in Your Restoration Report | Client Journey | Operational | 60s |
| 28 | Water Damage Prevention Tips | Water Damage | WRT | 45s |
| 29 | Mould Remediation Process | Mould | WRT (mould) | 60s |
| 30 | When DIY Makes It Worse | Mould | WRT (mould) | 45s |

#### April Videos (Soft Launch)

| # | Title | Category | Source | Length |
|---|-------|----------|--------|--------|
| 31 | Storm Season Preparation | Fire/Storm | WRT (storm) | 60s |
| 32 | After the Storm: First Steps | Fire/Storm | WRT (storm) | 60s |
| 33 | Why Payment Upfront Protects You | Why NRPG | Partnership | 60s |
| 34 | The Australian Restoration Standard | Why NRPG | Excellence | 60s |
| 35 | Following Your Claim: Dashboard Tour | Client Journey | Operational | 60s |
| 36 | Questions to Ask Your Restorer | Client Journey | CSE | 45s |
| 37 | Contractor Training Preview: CSE | Contractor | CSE-01 | 45s |
| 38 | Contractor Training Preview: WRT | Contractor | WRT-01 | 45s |
| 39 | Real Case: Kitchen Flood Recovery | Testimonial | Case Study | 60s |
| 40 | Water Damage: Seasonal Risks | Water Damage | WRT | 45s |

#### May-July Videos (Scale + RIA)

Videos 41-70 focus on:
- Contractor module teasers (12 videos)
- RIA Conference content (7 videos)
- Testimonials and case studies (5 videos)
- Fill gaps based on April analytics

### C. Required Skills

```
.claude/agents/video/
├── orchestrator/AGENT.md
├── script/AGENT.md
├── image/AGENT.md
├── video/AGENT.md
├── voice/AGENT.md
├── assembly/AGENT.md
├── seo/AGENT.md
└── youtube/AGENT.md
```

### D. External Documentation

- [Veo 3.1 API Docs](https://ai.google.dev/gemini-api/docs/video)
- [Nano Banana Pro Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Schema.org VideoObject](https://schema.org/VideoObject)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner | Phill McGurk | | |
| Technical Lead | | | |
| Content Owner | | | |

---

*Spec Version: 1.0*
*Created: 2026-01-04*
*Method: Spec Interview Framework*
