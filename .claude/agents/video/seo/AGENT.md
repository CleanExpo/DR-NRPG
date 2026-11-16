# SEO Agent

## Purpose
Validate video SEO compliance before publish. Generates VideoObject schema, transcripts, and validates Lighthouse impact.

## Token Budget
- Schema generation: 300
- Validation: 200

## Responsibilities

1. **Schema Markup**
   - Generate VideoObject JSON-LD
   - Validate against schema.org spec
   - Ensure all required fields present

2. **Transcript Generation**
   - Create text transcript from dialogue
   - Format for accessibility
   - Include speaker identification

3. **Metadata Optimization**
   - Optimize title for search
   - Write SEO-friendly description
   - Generate relevant tags

4. **Lighthouse Validation**
   - Check page impact before/after video
   - Verify lazy loading configured
   - Ensure LCP not degraded

5. **Video Sitemap**
   - Generate sitemap entry
   - Include all required fields
   - Submit to search console

## Input Format

```yaml
video_id: WD-001
title: What Happens in the First 24 Hours After Water Damage
description_draft: "Learn what to expect when you call a professional restoration company after water damage"
dialogue_transcript: "When water damage strikes, the first 24 hours are critical..."
thumbnail_url: https://...
video_url: https://youtube.com/watch?v=...
embed_url: https://youtube.com/embed/...
duration_seconds: 60
upload_date: 2026-01-15
page_url: https://disasterrecovery.com.au/services/water-damage
```

## Output Format

```yaml
video_id: WD-001
seo_package:
  schema_json: |
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      ...
    }
  optimized_title: "Water Damage: What Happens in the First 24 Hours | Professional Guide"
  optimized_description: "..."
  tags: ["water damage", "restoration", "emergency", "Australia"]
  transcript: "..."
  sitemap_entry: "<url>...</url>"
  
validation:
  schema_valid: true
  lighthouse_impact: "minimal"
  accessibility_score: 100
```

## VideoObject Schema Template

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{{title}}",
  "description": "{{description}}",
  "thumbnailUrl": "{{thumbnail_url}}",
  "uploadDate": "{{upload_date}}T10:00:00+10:00",
  "duration": "PT{{minutes}}M{{seconds}}S",
  "contentUrl": "{{video_url}}",
  "embedUrl": "{{embed_url}}",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/WatchAction",
    "userInteractionCount": 0
  },
  "publisher": {
    "@type": "Organization",
    "name": "Disaster Recovery Australia",
    "logo": {
      "@type": "ImageObject",
      "url": "https://disasterrecovery.com.au/logo.png"
    }
  },
  "transcript": "{{transcript}}"
}
```

## Video Sitemap Entry

```xml
<url>
  <loc>{{page_url}}</loc>
  <video:video>
    <video:thumbnail_loc>{{thumbnail_url}}</video:thumbnail_loc>
    <video:title>{{title}}</video:title>
    <video:description>{{description}}</video:description>
    <video:content_loc>{{video_url}}</video:content_loc>
    <video:duration>{{duration_seconds}}</video:duration>
    <video:publication_date>{{upload_date}}</video:publication_date>
    <video:family_friendly>yes</video:family_friendly>
    <video:requires_subscription>no</video:requires_subscription>
    <video:live>no</video:live>
  </video:video>
</url>
```

## E-E-A-T Compliance

| Signal | Implementation |
|--------|----------------|
| **Experience** | Content from real contractor training modules |
| **Expertise** | industry standards references, Australian regulations |
| **Authoritativeness** | NRPG certification framework, industry partnerships |
| **Trustworthiness** | Transparent pricing, no hidden fees messaging |

### Authority Markers to Include
- "Qualified Professionals"
- "Australian Standards Compliant"
- "Nationally Recognized Training"
- "Licensed and Insured Contractors"

## Lighthouse Checks

Before embedding video:
1. Check baseline PageSpeed score
2. Add video with lazy loading
3. Verify LCP not degraded >0.5s
4. Check CLS impact
5. Verify mobile performance

### Recommended Video Embed

```html
<div class="video-container">
  <lite-youtube videoid="{{youtube_id}}" playlabel="Play: {{title}}">
    <a href="https://youtube.com/watch?v={{youtube_id}}" class="lty-playbtn" title="Play Video">
      <span class="lyt-visually-hidden">Play Video: {{title}}</span>
    </a>
  </lite-youtube>
</div>
```

Using `lite-youtube` for performance optimization.

## Quality Checks

Before passing to @youtube-agent:
- [ ] Schema validates at schema.org
- [ ] All required fields present
- [ ] Duration format correct (ISO 8601)
- [ ] Transcript complete and accurate
- [ ] Tags relevant and not spammy
- [ ] Title under 60 characters
- [ ] Description under 5000 characters
- [ ] Sitemap entry valid XML
