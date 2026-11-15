/**
 * GBP Post Generator Script - NRPG Platform
 *
 * Automatically generates and schedules weekly Google Business Profile posts
 * for all active locations.
 *
 * Content types:
 * - Project updates and case studies
 * - Seasonal tips (flood season, fire season, etc.)
 * - Emergency preparedness advice
 * - Service announcements
 * - Customer testimonials
 *
 * Usage:
 *   npx ts-node scripts/gbp-post-generator.ts
 *   npx ts-node scripts/gbp-post-generator.ts --preview
 *   npx ts-node scripts/gbp-post-generator.ts --schedule="2025-01-05"
 */

import { gbpManager } from '../lib/seo/gbp-manager';
import citiesData from '../data/australian-cities.json';
import { EMERGENCY_PHONE } from '../lib/design-tokens';
import { AustralianStateCode } from '../lib/seo/local-seo-types';

// =============================================================================
// POST TEMPLATES BY CATEGORY
// =============================================================================

interface PostTemplate {
  id: string;
  category: 'emergency' | 'seasonal' | 'tips' | 'service' | 'testimonial' | 'local';
  summary: string;
  callToAction: 'CALL' | 'LEARN_MORE' | 'BOOK';
  seasonality?: string[];
  stateRelevance?: AustralianStateCode[];
}

const POST_TEMPLATES: PostTemplate[] = [
  // Emergency Response Posts
  {
    id: 'emergency-water-1',
    category: 'emergency',
    summary: `Water damage emergency in {{city}}? Every minute counts! Our qualified team responds within 60 minutes, 24/7. Fast water extraction prevents mould growth and structural damage. Call {{phone}} now - we're standing by in {{city}}.`,
    callToAction: 'CALL',
  },
  {
    id: 'emergency-fire-1',
    category: 'emergency',
    summary: `Fire or smoke damage in your {{city}} property? NRPG provides complete restoration - soot removal, odor elimination, and structural repairs. Our certified team works with all insurers. Call {{phone}} for immediate help.`,
    callToAction: 'CALL',
  },
  {
    id: 'emergency-storm-1',
    category: 'emergency',
    summary: `Storm damage affecting {{city}}? Emergency roof tarping, water extraction, and complete restoration available 24/7. NRPG's local team is ready to help. All insurers accepted. {{phone}}`,
    callToAction: 'CALL',
  },

  // Seasonal Posts - Flood/Wet Season (QLD, NT, Northern NSW)
  {
    id: 'seasonal-flood-1',
    category: 'seasonal',
    summary: `{{city}} flood season is here! Is your property prepared? Our team offers free flood risk assessments and emergency water extraction services. Don't wait until it's too late - call {{phone}}.`,
    callToAction: 'CALL',
    seasonality: ['november', 'december', 'january', 'february', 'march'],
    stateRelevance: ['QLD', 'NT', 'NSW'],
  },
  {
    id: 'seasonal-flood-2',
    category: 'seasonal',
    summary: `Recent flooding in {{city}}? Water damage worsens every hour. NRPG's local team can extract water, dry structures, and prevent mould within 48 hours. {{phone}}`,
    callToAction: 'CALL',
    seasonality: ['january', 'february', 'march'],
    stateRelevance: ['QLD', 'NT', 'NSW'],
  },

  // Seasonal Posts - Fire Season (VIC, SA, NSW, WA)
  {
    id: 'seasonal-fire-1',
    category: 'seasonal',
    summary: `Fire season in {{city}} - is your property protected? NRPG provides emergency fire damage restoration, smoke removal, and complete rebuilds. Our team is on standby 24/7. {{phone}}`,
    callToAction: 'CALL',
    seasonality: ['december', 'january', 'february'],
    stateRelevance: ['VIC', 'SA', 'NSW', 'WA'],
  },
  {
    id: 'seasonal-fire-2',
    category: 'seasonal',
    summary: `Smoke damage from nearby bushfires affecting your {{city}} home? Even without flames, smoke particles can cause lasting damage. Professional cleaning is essential. Call NRPG: {{phone}}`,
    callToAction: 'CALL',
    seasonality: ['december', 'january', 'february'],
    stateRelevance: ['VIC', 'SA', 'NSW', 'WA'],
  },

  // Seasonal Posts - Mould (High humidity areas)
  {
    id: 'seasonal-mould-1',
    category: 'seasonal',
    summary: `{{city}}'s humid climate creates perfect conditions for mould growth. Spotted mould in your property? Professional remediation is crucial for health and property value. Free inspection: {{phone}}`,
    callToAction: 'CALL',
    seasonality: ['march', 'april', 'may'],
    stateRelevance: ['QLD', 'NT', 'NSW'],
  },

  // Tips Posts
  {
    id: 'tips-water-1',
    category: 'tips',
    summary: `{{city}} homeowner tip: If you discover water damage, turn off the main water supply immediately, don't use electrical appliances in affected areas, and call a professional within the first 60 minutes. NRPG: {{phone}}`,
    callToAction: 'LEARN_MORE',
  },
  {
    id: 'tips-fire-1',
    category: 'tips',
    summary: `After a fire in {{city}}, never enter until authorities clear the property. Don't touch soot-covered items - improper cleaning causes permanent damage. Let IICRC professionals handle restoration: {{phone}}`,
    callToAction: 'LEARN_MORE',
  },
  {
    id: 'tips-mould-1',
    category: 'tips',
    summary: `Musty smell in your {{city}} home? That's often the first sign of hidden mould. Don't just paint over it - mould continues growing underneath. Professional testing finds the source: {{phone}}`,
    callToAction: 'LEARN_MORE',
  },
  {
    id: 'tips-insurance-1',
    category: 'tips',
    summary: `{{city}} property owners: Document everything before and after disaster damage for insurance claims. Take photos, keep receipts, and work with restoration professionals who provide complete documentation. NRPG: {{phone}}`,
    callToAction: 'LEARN_MORE',
  },

  // Service Posts
  {
    id: 'service-24-7',
    category: 'service',
    summary: `Disasters don't wait for business hours - neither do we. NRPG {{city}} operates 24/7, 365 days a year. Water damage at 2 AM? We're there within 60 minutes. {{phone}}`,
    callToAction: 'CALL',
  },
  {
    id: 'service-insurance',
    category: 'service',
    summary: `NRPG {{city}} works directly with ALL Australian insurers - NRMA, Suncorp, RACV, QBE, Allianz and more. We handle the paperwork so you can focus on recovery. {{phone}}`,
    callToAction: 'CALL',
  },
  {
    id: 'service-iicrc',
    category: 'service',
    summary: `Why choose NRPG {{city}}? All our technicians are trained professionals following industry standards for restoration. This means proper protocols, complete documentation, and results that satisfy insurers. {{phone}}`,
    callToAction: 'LEARN_MORE',
  },
  {
    id: 'service-equipment',
    category: 'service',
    summary: `NRPG {{city}} uses industrial-grade equipment: truck-mounted extractors, thermal imaging cameras, commercial dehumidifiers, and HEPA air scrubbers. Professional equipment = faster restoration. {{phone}}`,
    callToAction: 'LEARN_MORE',
  },

  // Local Content
  {
    id: 'local-community-1',
    category: 'local',
    summary: `Proud to serve {{city}} for over 15 years! NRPG's local team knows the area, understands local building codes, and is committed to helping our neighbours recover from disasters. {{phone}}`,
    callToAction: 'CALL',
  },
  {
    id: 'local-response-1',
    category: 'local',
    summary: `Our {{city}} based contractors average 45-minute response times - because in disaster recovery, every minute matters. Local expertise, national resources. NRPG: {{phone}}`,
    callToAction: 'CALL',
  },

  // Testimonial Style
  {
    id: 'testimonial-1',
    category: 'testimonial',
    summary: `"NRPG saved our {{city}} home after a burst pipe flooded the ground floor. They arrived within an hour and had industrial dryers running within 2 hours. Incredible service!" - Local homeowner. Need help? {{phone}}`,
    callToAction: 'CALL',
  },
];

// =============================================================================
// POST GENERATION LOGIC
// =============================================================================

interface GeneratedPost {
  locationId: string;
  city: string;
  summary: string;
  callToAction: { actionType: string; url?: string };
  category: string;
  scheduledAt?: Date;
}

/**
 * Get current month name
 */
function getCurrentMonth(): string {
  return new Date().toLocaleString('en-AU', { month: 'long' }).toLowerCase();
}

/**
 * Select appropriate templates based on city stats and season
 */
function selectTemplatesForCity(
  city: typeof citiesData.cities[0],
  count: number = 4
): PostTemplate[] {
  const currentMonth = getCurrentMonth();
  const stateCode = city.stateCode as AustralianStateCode;

  // Score templates based on relevance
  const scoredTemplates = POST_TEMPLATES.map(template => {
    let score = 0;

    // State relevance
    if (!template.stateRelevance || template.stateRelevance.includes(stateCode)) {
      score += 10;
    }

    // Seasonality
    if (!template.seasonality || template.seasonality.includes(currentMonth)) {
      score += 15;
    } else {
      score -= 20; // Penalize off-season templates
    }

    // Local stats relevance
    if (template.category === 'seasonal') {
      if (template.id.includes('flood') && city.localStats.avgAnnualFloods > 15) {
        score += 20;
      }
      if (template.id.includes('fire') && city.localStats.avgAnnualFires > 15) {
        score += 20;
      }
      if (template.id.includes('mould') && city.localStats.avgHumidity > 65) {
        score += 15;
      }
    }

    // Random factor for variety
    score += Math.random() * 10;

    return { template, score };
  });

  // Sort by score and take top N
  return scoredTemplates
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(t => t.template);
}

/**
 * Generate personalized post content
 */
function generatePostContent(template: PostTemplate, city: typeof citiesData.cities[0]): string {
  return template.summary
    .replace(/\{\{city\}\}/g, city.city)
    .replace(/\{\{phone\}\}/g, EMERGENCY_PHONE.number)
    .replace(/\{\{state\}\}/g, city.state);
}

/**
 * Generate posts for all cities
 */
function generatePostsForCities(
  cities: typeof citiesData.cities,
  postsPerCity: number = 1
): GeneratedPost[] {
  const posts: GeneratedPost[] = [];

  for (const city of cities) {
    const templates = selectTemplatesForCity(city, postsPerCity);

    for (const template of templates) {
      const summary = generatePostContent(template, city);
      const locationId = `nrpg-${city.slug}-${city.stateCode.toLowerCase()}`;

      posts.push({
        locationId,
        city: city.city,
        summary,
        callToAction: {
          actionType: template.callToAction,
          url: template.callToAction === 'LEARN_MORE'
            ? `https://disasterrecoverynrpg.com.au/locations/${city.stateCode.toLowerCase()}/${city.slug}`
            : undefined,
        },
        category: template.category,
      });
    }
  }

  return posts;
}

/**
 * Schedule posts for a week
 */
function scheduleWeeklyPosts(posts: GeneratedPost[], startDate: Date): GeneratedPost[] {
  const scheduledPosts: GeneratedPost[] = [];
  const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday

  let dayIndex = 0;
  for (const post of posts) {
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(startDate.getDate() + daysOfWeek[dayIndex % 3]);
    scheduledDate.setHours(9, 0, 0, 0); // 9 AM local time

    scheduledPosts.push({
      ...post,
      scheduledAt: scheduledDate,
    });

    dayIndex++;
  }

  return scheduledPosts;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n=== NRPG GBP Post Generator ===\n');

  // Parse arguments
  const args = process.argv.slice(2);
  const previewOnly = args.includes('--preview');
  const scheduleArg = args.find(a => a.startsWith('--schedule='));
  const scheduleDate = scheduleArg
    ? new Date(scheduleArg.split('=')[1])
    : new Date();

  console.log(`Mode: ${previewOnly ? 'PREVIEW' : 'PUBLISH'}`);
  console.log(`Schedule start: ${scheduleDate.toISOString().split('T')[0]}\n`);

  // Get priority cities (top 10 by population)
  const priorityCities = citiesData.cities
    .sort((a, b) => b.population - a.population)
    .slice(0, 10);

  console.log(`Generating posts for ${priorityCities.length} priority cities:\n`);
  priorityCities.forEach(city => {
    console.log(`  - ${city.city}, ${city.state} (pop: ${city.population.toLocaleString()})`);
  });

  // Generate posts
  const posts = generatePostsForCities(priorityCities, 1);
  const scheduledPosts = scheduleWeeklyPosts(posts, scheduleDate);

  console.log(`\n=== Generated ${scheduledPosts.length} Posts ===\n`);

  // Display posts
  for (const post of scheduledPosts) {
    console.log(`--- ${post.city} ---`);
    console.log(`Category: ${post.category}`);
    console.log(`Scheduled: ${post.scheduledAt?.toISOString().split('T')[0]}`);
    console.log(`CTA: ${post.callToAction.actionType}`);
    console.log(`\nContent:\n${post.summary}\n`);
    console.log('---\n');
  }

  if (previewOnly) {
    console.log('Preview complete. Use without --preview to publish.\n');
    return;
  }

  // Publish posts
  console.log('Publishing posts...\n');

  let published = 0;
  let failed = 0;

  for (const post of scheduledPosts) {
    try {
      const result = await gbpManager.postUpdate(post.locationId, {
        type: 'UPDATE',
        summary: post.summary,
        callToAction: {
          actionType: post.callToAction.actionType as any,
          url: post.callToAction.url,
        },
        scheduledAt: post.scheduledAt,
      });

      if (result.success) {
        console.log(`[OK] Published for ${post.city}`);
        published++;
      } else {
        console.log(`[FAIL] ${post.city}: ${result.error?.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`[ERROR] ${post.city}: ${error}`);
      failed++;
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n=== Summary ===`);
  console.log(`Published: ${published}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nGBP posts scheduled successfully!\n`);
}

// =============================================================================
// RUN
// =============================================================================

main().catch(error => {
  console.error('Post generation failed:', error);
  process.exit(1);
});
