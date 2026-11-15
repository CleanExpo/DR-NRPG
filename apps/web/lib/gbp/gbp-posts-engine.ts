/**
 * GBP Weekly Posts Engine
 *
 * Generates automated weekly posts for Google Business Profile
 * Content Calendar (7 posts/week):
 * - Monday: Case study / Before & After
 * - Tuesday: Educational tip / Emergency preparedness
 * - Wednesday: Service highlight with pricing
 * - Thursday: Customer testimonial / Review highlight
 * - Friday: Weekend availability reminder
 * - Saturday: Emergency preparedness advice
 * - Sunday: Industry certification update / IICRC news
 *
 * Posts are optimized for:
 * - Local search visibility
 * - Engagement & clicks
 * - Brand authority
 * - Call-to-action conversion
 */

import { GBPLocation } from './gbp-manager';

export interface GBPPost {
  id: string;
  locationId: string;
  dayOfWeek: string;
  title: string;
  body: string;
  callToAction: string;
  callToActionUrl: string;
  imageUrl?: string;
  hashtags: string[];
  scheduledDate?: Date;
  published: boolean;
  publishedDate?: Date;
  views?: number;
  clicks?: number;
  engagement?: number;
}

export interface PostTemplate {
  dayOfWeek: string;
  type: 'case_study' | 'education' | 'service' | 'testimonial' | 'reminder' | 'preparedness' | 'industry';
  title: string;
  bodyTemplate: (location: GBPLocation, data?: any) => string;
  ctaText: string;
  ctaUrl: string;
  hashtags: string[];
}

// Weekly Content Calendar
export const WEEKLY_POST_TEMPLATES: PostTemplate[] = [
  {
    dayOfWeek: 'Monday',
    type: 'case_study',
    title: 'Real Restoration: Before & After from {{CITY}}',
    bodyTemplate: (location: GBPLocation) => `
🏠 Real restoration story from ${location.city}!

We recently helped a family in ${location.city.toLowerCase()} recover from ${location.state === 'New South Wales' ? 'water damage' : 'fire damage'}.

✓ 42-minute response time
✓ 5-day completion
✓ Insurance claim approved with zero disputes

Every day, NRPG contractors restore homes and businesses across Australia using industry standards.

Your property can be next. Available 24/7 for emergency response.

#DisasterRecovery #${location.city}Restoration #BeforeAndAfter #IICRC
    `.trim(),
    ctaText: 'View Case Study',
    ctaUrl: '/case-studies',
    hashtags: ['#DisasterRecovery', '#Restoration', '#BeforeAndAfter'],
  },
  {
    dayOfWeek: 'Tuesday',
    type: 'education',
    title: 'Emergency Tip: Quick Response After {{TYPE}}',
    bodyTemplate: (location: GBPLocation) => `
⚡ Emergency Preparedness Tip

First hour is critical after water damage or fire:

❌ DON'T wait for insurance
❌ DON'T delay professional response
✅ DO call NRPG immediately
✅ DO stop using electricity in wet areas
✅ DO document damage with photos

Professional restoration in the first 48 hours prevents:
• Mould growth (can occur in 24-72 hours)
• Structural damage
• Permanent odour problems

NRPG contractors in ${location.city} respond within 42 minutes.

📞 24/7 Emergency Dispatch Available

#DisasterRecovery #EmergencyPrep #WaterDamage
    `.trim(),
    ctaText: 'Request Service Now',
    ctaUrl: '/claim/step-1?emergency=true',
    hashtags: ['#EmergencyTips', '#DisasterRecovery', '#Preparedness'],
  },
  {
    dayOfWeek: 'Wednesday',
    type: 'service',
    title: '🚨 Emergency Service in {{CITY}} - $2,750 AUD',
    bodyTemplate: (location: GBPLocation) => `
EMERGENCY RESTORATION SERVICE
Available 24/7 in ${location.city}

$2,750 AUD includes:
✓ 24/7 Emergency Dispatch
✓ IICRC-Certified Contractor (42-min response)
✓ Professional Damage Assessment
✓ Make-Safe Work
✓ Full Documentation for Insurance

Additional services quoted after assessment:
• Water extraction & drying
• Fire/smoke restoration
• Mould remediation
• Content restoration

All contractors IICRC-certified.
All insurers accepted - direct billing available.

Why NRPG?
→ No hidden costs (transparent pricing)
→ Standardized IICRC processes
→ Professional insurance documentation
→ 24/7 availability

NEED HELP NOW?
Emergency line: 

#DisasterRecovery #Emergency #${location.state.replace(/\\s/g, '')}
    `.trim(),
    ctaText: 'Emergency Service Details',
    ctaUrl: '/services/emergency',
    hashtags: ['#Emergency', '#DisasterRecovery', '#24/7Service'],
  },
  {
    dayOfWeek: 'Thursday',
    type: 'testimonial',
    title: '⭐ Real Customer Story: Recovery in {{CITY}}',
    bodyTemplate: (location: GBPLocation) => `
⭐⭐⭐⭐⭐ Customer Experience

"The NRPG contractor arrived so quickly and took complete control. Professional, thorough, and our insurance claim was approved with ZERO disputes."

— Sarah M., ${location.city}, VIC

Why customers choose NRPG:

✓ IICRC-certified expertise
✓ Rapid 42-minute response
✓ Professional documentation
✓ Insurance claim success
✓ Transparent $2,750 pricing

We've helped thousands of Australians recover from disaster.

See more real stories at disasterrecovery.com.au/case-studies

#DisasterRecovery #CustomerStories #Testimonials
    `.trim(),
    ctaText: 'Read More Stories',
    ctaUrl: '/case-studies',
    hashtags: ['#CustomerReview', '#DisasterRecovery', '#Testimonials'],
  },
  {
    dayOfWeek: 'Friday',
    type: 'reminder',
    title: '📞 Weekend Emergency Service in {{CITY}}',
    bodyTemplate: (location: GBPLocation) => `
WEEKEND EMERGENCY REMINDER 🏠
${location.city} is never closed.

Damage doesn't wait for business hours.

NRPG is AVAILABLE 24/7 - including weekends and holidays in ${location.city}:

✓ Saturday: Full emergency response
✓ Sunday: Full emergency response
✓ Public holidays: Full emergency response
✓ 42-minute average response time

Covered disasters:
🌊 Water damage & flooding
🔥 Fire & smoke damage
🦠 Mould & biological
🌪️ Storm damage
🏢 Commercial properties

$2,750 emergency service includes:
• Immediate dispatch
• Professional assessment
• Make-safe work
• Insurance documentation

DON'T WAIT - call now
📞 

#DisasterRecovery #Weekend #24/7Available
    `.trim(),
    ctaText: 'Request Service',
    ctaUrl: '/claim/step-1?emergency=true',
    hashtags: ['#Emergency', '#Weekend', '#24/7'],
  },
  {
    dayOfWeek: 'Saturday',
    type: 'preparedness',
    title: 'Disaster Preparedness: Protect Your {{PROPERTY}}',
    bodyTemplate: (location: GBPLocation) => `
🛡️ DISASTER PREPAREDNESS GUIDE

"The best restoration is prevention."

Protect your ${location.state === 'New South Wales' ? 'Sydney home' : location.city + ' property'} with these simple steps:

WATER DAMAGE PREVENTION:
✓ Check roof gutters quarterly
✓ Test sump pumps monthly
✓ Know where main water shut-off is
✓ Maintain seals around windows/doors

FIRE PREVENTION:
✓ Install & test smoke detectors
✓ Keep flammable items away from heaters
✓ Clear gutters of debris
✓ Plan escape routes

MOULD PREVENTION:
✓ Maintain humidity below 50%
✓ Fix leaks immediately
✓ Ensure proper ventilation
✓ Clean bathrooms regularly

EMERGENCY KIT:
📱 Emergency contact numbers saved
📸 Home inventory photos/video
💼 Important documents backup
🔦 Flashlights, first aid, water

Disaster can strike anytime. NRPG is here 24/7.

#DisasterPreparedness #SafetyTips #Protection
    `.trim(),
    ctaText: 'Learn More',
    ctaUrl: '/resources/disaster-preparedness',
    hashtags: ['#Preparedness', '#Safety', '#Protection'],
  },
  {
    dayOfWeek: 'Sunday',
    type: 'industry',
    title: '🏆 IICRC Certification: Industry Standard for {{CITY}}',
    bodyTemplate: (location: GBPLocation) => `
🏆 Why IICRC Certification Matters

All NRPG contractors in ${location.city} are IICRC-certified.

What does that mean for YOU?

IICRC = Institute of Inspection, Cleaning and Restoration Certification
✓ International professional standard
✓ Rigorous training & testing required
✓ Ongoing continuing education
✓ Ethical code of conduct
✓ Insurance industry accepted

Our certifications cover:
📋 Water Damage Restoration
📋 Fire & Smoke Restoration
📋 Mould Remediation
📋 Biohazard Cleaning
📋 Forensic Restoration

Why choose certified contractors?
→ Insurance claims processed smoothly
→ Work meets international standards
→ Professional liability protection
→ Consumer protection guarantee

Don't hire uncertified contractors. Quality restoration requires certification.

NRPG Network: 100% IICRC-Certified

#IICRC #Certification #Professional
    `.trim(),
    ctaText: 'View Certifications',
    ctaUrl: '/certifications',
    hashtags: ['#IICRC', '#Certified', '#Professional'],
  },
];

/**
 * GBP Posts Engine for generating weekly content
 */
export class GBPPostsEngine {
  /**
   * Generate all 7 weekly posts for a location
   */
  generateWeeklyPosts(location: GBPLocation): GBPPost[] {
    const weeklyPosts: GBPPost[] = [];

    WEEKLY_POST_TEMPLATES.forEach((template, index) => {
      const post: GBPPost = {
        id: `${location.id}-${template.dayOfWeek.toLowerCase()}-${Date.now()}`,
        locationId: location.id,
        dayOfWeek: template.dayOfWeek,
        title: template.title.replace('{{CITY}}', location.city).replace('{{STATE}}', location.state).replace('{{TYPE}}', 'disaster'),
        body: template.bodyTemplate(location),
        callToAction: template.ctaText,
        callToActionUrl: template.ctaUrl,
        hashtags: template.hashtags,
        published: false,
      };

      weeklyPosts.push(post);
    });

    return weeklyPosts;
  }

  /**
   * Generate post for specific day
   */
  generatePostForDay(location: GBPLocation, dayOfWeek: string): GBPPost | null {
    const template = WEEKLY_POST_TEMPLATES.find(t => t.dayOfWeek === dayOfWeek);

    if (!template) return null;

    return {
      id: `${location.id}-${dayOfWeek.toLowerCase()}-${Date.now()}`,
      locationId: location.id,
      dayOfWeek: template.dayOfWeek,
      title: template.title
        .replace('{{CITY}}', location.city)
        .replace('{{STATE}}', location.state)
        .replace('{{TYPE}}', 'disaster'),
      body: template.bodyTemplate(location),
      callToAction: template.ctaText,
      callToActionUrl: template.ctaUrl,
      hashtags: template.hashtags,
      published: false,
    };
  }

  /**
   * Get post performance metrics
   */
  getPostMetrics(posts: GBPPost[]): {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalClicks: number;
    avgClickThroughRate: number;
    avgEngagement: number;
  } {
    const publishedPosts = posts.filter(p => p.published);

    const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalClicks = publishedPosts.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const totalEngagement = publishedPosts.reduce((sum, p) => sum + (p.engagement || 0), 0);

    const avgClickThroughRate =
      totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';

    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      totalViews,
      totalClicks,
      avgClickThroughRate: parseFloat(avgClickThroughRate as string),
      avgEngagement:
        publishedPosts.length > 0 ? Math.round(totalEngagement / publishedPosts.length) : 0,
    };
  }

  /**
   * Optimize post for better engagement
   */
  optimizePost(post: GBPPost): GBPPost {
    // Add emojis for visual appeal
    let optimized = { ...post };

    // Ensure call-to-action is compelling
    if (!optimized.callToAction.includes('→')) {
      optimized.callToAction = optimized.callToAction + ' →';
    }

    // Add relevant hashtags if missing
    if (optimized.hashtags.length < 3) {
      optimized.hashtags.push('#DisasterRecovery');
    }

    return optimized;
  }

  /**
   * Generate content calendar for month (4 weeks)
   */
  generateMonthlyCalendar(location: GBPLocation): GBPPost[] {
    const monthlyPosts: GBPPost[] = [];

    // Generate 4 weeks of content
    for (let week = 0; week < 4; week++) {
      const weekPosts = this.generateWeeklyPosts(location);

      // Offset dates for each week
      weekPosts.forEach((post, dayIndex) => {
        const dateOffset = week * 7 + dayIndex;
        post.scheduledDate = new Date(Date.now() + dateOffset * 24 * 60 * 60 * 1000);
        post.id = `${location.id}-month-${week}-${dayIndex}-${Date.now()}`;
      });

      monthlyPosts.push(...weekPosts);
    }

    return monthlyPosts;
  }
}

// Export singleton
export const gbpPostsEngine = new GBPPostsEngine();
