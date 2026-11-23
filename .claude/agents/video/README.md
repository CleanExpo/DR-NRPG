# Video Generation Pipeline - Agent System

## Overview

Automated video generation system using a multi-agent architecture. Produces professional marketing, educational, and trust-building videos from NRPG onboarding content.

## Agent Structure

```
.claude/agents/video/
├── orchestrator/AGENT.md   # Coordination, scheduling, budget
├── script/AGENT.md         # Script generation (Gemini Pro)
├── image/AGENT.md          # Reference images (Nano Banana Pro)
├── video/AGENT.md          # Video clips (Veo 3.1)
├── voice/AGENT.md          # Voiceover (ElevenLabs)
├── assembly/AGENT.md       # FFmpeg stitching
├── seo/AGENT.md            # Schema, transcripts, validation
└── youtube/AGENT.md        # Upload, approval workflow
```

## Pipeline Flow

```
ORCHESTRATOR
    ↓
SCRIPT → Generate scripts from NRPG content
    ↓
IMAGE → Generate reference images for consistency
    ↓
VIDEO → Generate 8-second clips with Veo 3.1
    ↓
VOICE → Generate voiceover with ElevenLabs
    ↓
ASSEMBLY → Stitch clips, sync audio, burn subtitles
    ↓
SEO → Generate schema, validate compliance
    ↓
YOUTUBE → Upload unlisted, await approval
    ↓
HUMAN REVIEW → Approve / Reject / Regenerate
    ↓
PUBLISH → Make public, update site
```

## API Stack

| Service | Model | Purpose | Cost |
|---------|-------|---------|------|
| Gemini Pro | gemini-3-pro | Scripts, orchestration | ~$0.01/1K tokens |
| Nano Banana Pro | gemini-3-pro-image | Images, thumbnails | ~$0.15-0.24/image |
| Veo 3.1 Standard | veo-3.1-generate-preview | Video clips | $0.40/second |
| ElevenLabs | eleven_multilingual_v2 | Australian voice | ~$0.30/1K chars |
| YouTube API | v3 | Upload, manage | Free |

## Budget

| Month | Videos | Cost |
|-------|--------|------|
| Jan 2026 | 10 | $200 |
| Feb 2026 | 10 | $200 |
| Mar 2026 | 10 | $200 |
| **Apr 2026** | 10 | $200 | **Soft Launch**
| May 2026 | 10 | $200 |
| Jun 2026 | 10 | $200 |
| Jul 2026 | 10 | $200 |
| **TOTAL** | **70** | **$1,400** |

## Key Dates

- **Soft Launch:** April/May 2026
- **RIA Conference:** August 25-27, 2026 (Star Gold Coast)

## Content Source

NRPG-Onboarding-Framework repository:
- 10 CSE modules
- 12 water damage restoration modules
- 11 business framework documents
- 100+ markdown files total

## Required Environment Variables

```env
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
YOUTUBE_CHANNEL_ID=
```

## Installation

1. Copy `.claude/agents/video/` to your repository
2. Add spec to `specs/video-pipeline-spec.md`
3. Configure environment variables
4. Install FFmpeg if not present

## Usage

The orchestrator coordinates all agents automatically:

```
@video-orchestrator generate next video
```

Or target specific categories:

```
@video-orchestrator generate water-damage video from water damage restoration module 1
```

## Full Specification

See `specs/video-pipeline-spec.md` for complete technical specification including:
- Content calendar (70 videos detailed)
- Database schema
- Messaging guidelines
- Quality standards
- Risk register
