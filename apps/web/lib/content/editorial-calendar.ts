import { BlogCategory } from '@prisma/client';

export interface MonthlyTheme {
  month: string;
  theme: string;
  focus: string[];
  seasonalContext: string;
}

export interface ArticleIdea {
  title: string;
  category: BlogCategory;
  keywords: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedWordCount: number;
  targetPublishDate?: string;
}

export interface QuarterPlan {
  quarter: string;
  goals: string[];
  keyTopics: string[];
  articles: ArticleIdea[];
}

/**
 * Editorial Calendar for NRPG Content Marketing
 * 12-month content plan aligned with Australian disaster seasons
 */
export class EditorialCalendar {
  /**
   * Get yearly content plan
   */
  getYearlyPlan(year: number = 2025) {
    return {
      year,
      overview: {
        totalArticles: 100,
        articlesPerCategory: {
          EMERGENCY_GUIDE: 25,
          INSURANCE_CLAIM: 25,
          PREVENTION: 25,
          INDUSTRY_INSIGHT: 25,
        },
        publicationFrequency: '2-3 articles per week',
        goals: [
          'Establish thought leadership in disaster recovery',
          'Drive 100,000+ organic monthly visitors',
          'Build comprehensive knowledge base for all stakeholders',
          'Support contractor network with industry insights',
        ],
      },
      quarters: [
        this.getQ1Plan(year),
        this.getQ2Plan(year),
        this.getQ3Plan(year),
        this.getQ4Plan(year),
      ],
    };
  }

  /**
   * Q1 (January-March): Summer Storm Season
   */
  private getQ1Plan(year: number): QuarterPlan {
    return {
      quarter: 'Q1 - Summer Storm Season',
      goals: [
        'Address summer storm and flood preparation',
        'Build emergency response content library',
        'Target bushfire recovery (post-December)',
      ],
      keyTopics: [
        'Flood damage',
        'Storm damage',
        'Water extraction',
        'Bushfire recovery',
        'Heat-related property damage',
      ],
      articles: [
        // January - Bushfire Recovery
        {
          title: 'Bushfire Damage Assessment: Complete Recovery Guide',
          category: 'EMERGENCY_GUIDE',
          keywords: ['bushfire damage', 'fire recovery', 'smoke damage'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-01-05`,
        },
        {
          title: 'Filing Insurance Claims for Bushfire Damage',
          category: 'INSURANCE_CLAIM',
          keywords: ['bushfire insurance', 'fire damage claim'],
          priority: 'high',
          estimatedWordCount: 1800,
          targetPublishDate: `${year}-01-10`,
        },
        {
          title: 'Smoke Damage Restoration: What You Need to Know',
          category: 'EMERGENCY_GUIDE',
          keywords: ['smoke damage', 'odour removal', 'air quality'],
          priority: 'medium',
          estimatedWordCount: 1500,
          targetPublishDate: `${year}-01-15`,
        },

        // January - Storm Preparation
        {
          title: 'Summer Storm Preparation Checklist for Australian Homes',
          category: 'PREVENTION',
          keywords: ['storm preparation', 'property protection', 'summer storms'],
          priority: 'high',
          estimatedWordCount: 1600,
          targetPublishDate: `${year}-01-20`,
        },
        {
          title: 'Protecting Your Property from Flash Flooding',
          category: 'PREVENTION',
          keywords: ['flood prevention', 'flash flood', 'water damage prevention'],
          priority: 'high',
          estimatedWordCount: 1800,
          targetPublishDate: `${year}-01-25`,
        },

        // February - Water Damage Focus
        {
          title: 'Water Damage Emergency Response: First 24 Hours',
          category: 'EMERGENCY_GUIDE',
          keywords: ['water damage', 'emergency response', 'flood damage'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-02-01`,
        },
        {
          title: 'Mould Prevention After Water Damage',
          category: 'PREVENTION',
          keywords: ['mould prevention', 'water damage', 'humidity control'],
          priority: 'high',
          estimatedWordCount: 1700,
          targetPublishDate: `${year}-02-05`,
        },
        {
          title: 'Water Extraction Methods: Professional vs DIY',
          category: 'INDUSTRY_INSIGHT',
          keywords: ['water extraction', 'professional restoration', 'equipment'],
          priority: 'medium',
          estimatedWordCount: 1600,
          targetPublishDate: `${year}-02-10`,
        },

        // March - Insurance Focus
        {
          title: 'Understanding Your Home Insurance: Flood Coverage Guide',
          category: 'INSURANCE_CLAIM',
          keywords: ['flood insurance', 'coverage', 'policy guide'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-03-01`,
        },
        {
          title: 'Maximizing Your Insurance Claim for Water Damage',
          category: 'INSURANCE_CLAIM',
          keywords: ['insurance claim', 'water damage', 'documentation'],
          priority: 'high',
          estimatedWordCount: 1900,
          targetPublishDate: `${year}-03-10`,
        },
      ],
    };
  }

  /**
   * Q2 (April-June): Autumn & Early Winter
   */
  private getQ2Plan(year: number): QuarterPlan {
    return {
      quarter: 'Q2 - Autumn Preparation',
      goals: [
        'Focus on preventative maintenance',
        'Prepare for winter weather',
        'Commercial property content',
      ],
      keyTopics: [
        'Preventative maintenance',
        'Gutter cleaning',
        'Roof maintenance',
        'Commercial restoration',
        'Strata management',
      ],
      articles: [
        // April - Preventative Maintenance
        {
          title: 'Autumn Property Maintenance Checklist',
          category: 'PREVENTION',
          keywords: ['autumn maintenance', 'property care', 'seasonal checklist'],
          priority: 'high',
          estimatedWordCount: 1700,
          targetPublishDate: `${year}-04-01`,
        },
        {
          title: 'Gutter Cleaning and Maintenance: Prevent Water Damage',
          category: 'PREVENTION',
          keywords: ['gutter cleaning', 'water damage prevention', 'maintenance'],
          priority: 'high',
          estimatedWordCount: 1500,
          targetPublishDate: `${year}-04-08`,
        },
        {
          title: 'Commercial Property Disaster Preparedness Guide',
          category: 'EMERGENCY_GUIDE',
          keywords: ['commercial property', 'business continuity', 'disaster plan'],
          priority: 'medium',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-04-15`,
        },

        // May - Winter Preparation
        {
          title: 'Winter Weather Preparation for Australian Properties',
          category: 'PREVENTION',
          keywords: ['winter preparation', 'cold weather', 'property protection'],
          priority: 'medium',
          estimatedWordCount: 1600,
          targetPublishDate: `${year}-05-01`,
        },
        {
          title: 'Roof Maintenance and Inspection Guide',
          category: 'PREVENTION',
          keywords: ['roof maintenance', 'inspection', 'leak prevention'],
          priority: 'high',
          estimatedWordCount: 1800,
          targetPublishDate: `${year}-05-08`,
        },

        // June - Commercial & Strata Focus
        {
          title: 'Strata Manager\'s Guide to Disaster Recovery',
          category: 'INDUSTRY_INSIGHT',
          keywords: ['strata management', 'building management', 'disaster recovery'],
          priority: 'medium',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-06-01`,
        },
        {
          title: 'Commercial Insurance Claims: What Businesses Need to Know',
          category: 'INSURANCE_CLAIM',
          keywords: ['commercial insurance', 'business claims', 'coverage'],
          priority: 'medium',
          estimatedWordCount: 1900,
          targetPublishDate: `${year}-06-10`,
        },
      ],
    };
  }

  /**
   * Q3 (July-September): Winter & Early Spring
   */
  private getQ3Plan(year: number): QuarterPlan {
    return {
      quarter: 'Q3 - Winter Recovery & Spring Preparation',
      goals: [
        'Address winter-related damage',
        'Prepare for spring storms',
        'Contractor empowerment focus',
      ],
      keyTopics: [
        'Winter damage',
        'Heating system issues',
        'Condensation and mould',
        'Spring cleaning',
        'Contractor training',
      ],
      articles: [
        // July - Winter Issues
        {
          title: 'Common Winter Property Damage and Solutions',
          category: 'EMERGENCY_GUIDE',
          keywords: ['winter damage', 'cold weather', 'property issues'],
          priority: 'medium',
          estimatedWordCount: 1700,
          targetPublishDate: `${year}-07-01`,
        },
        {
          title: 'Condensation and Mould: Prevention and Treatment',
          category: 'PREVENTION',
          keywords: ['condensation', 'mould', 'humidity', 'winter'],
          priority: 'high',
          estimatedWordCount: 1800,
          targetPublishDate: `${year}-07-10`,
        },

        // August - Contractor Focus
        {
          title: 'Certification Guide for Australian Contractors',
          category: 'INDUSTRY_INSIGHT',
          keywords: ['restoration certification', 'contractor certification', 'professional development'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-08-01`,
        },
        {
          title: 'Growing Your Restoration Business with NRPG',
          category: 'INDUSTRY_INSIGHT',
          keywords: ['contractor growth', 'business development', 'lead generation'],
          priority: 'high',
          estimatedWordCount: 1900,
          targetPublishDate: `${year}-08-10`,
        },

        // September - Spring Preparation
        {
          title: 'Spring Storm Preparation: Are You Ready?',
          category: 'PREVENTION',
          keywords: ['spring storms', 'preparation', 'severe weather'],
          priority: 'high',
          estimatedWordCount: 1600,
          targetPublishDate: `${year}-09-01`,
        },
        {
          title: 'Spring Property Inspection Checklist',
          category: 'PREVENTION',
          keywords: ['spring inspection', 'property maintenance', 'checklist'],
          priority: 'medium',
          estimatedWordCount: 1500,
          targetPublishDate: `${year}-09-10`,
        },
      ],
    };
  }

  /**
   * Q4 (October-December): Spring & Bushfire Season
   */
  private getQ4Plan(year: number): QuarterPlan {
    return {
      quarter: 'Q4 - Spring Storms & Bushfire Season',
      goals: [
        'Address spring storm season',
        'Bushfire preparation content',
        'Year-end review and planning',
      ],
      keyTopics: [
        'Severe storms',
        'Hail damage',
        'Bushfire preparation',
        'Emergency planning',
        'Year-end maintenance',
      ],
      articles: [
        // October - Severe Weather
        {
          title: 'Severe Storm Emergency Response Guide',
          category: 'EMERGENCY_GUIDE',
          keywords: ['severe storms', 'emergency response', 'property damage'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-10-01`,
        },
        {
          title: 'Hail Damage Assessment and Insurance Claims',
          category: 'INSURANCE_CLAIM',
          keywords: ['hail damage', 'insurance claim', 'roof damage'],
          priority: 'high',
          estimatedWordCount: 1800,
          targetPublishDate: `${year}-10-10`,
        },

        // November - Bushfire Preparation
        {
          title: 'Bushfire Preparation: Protecting Your Property',
          category: 'PREVENTION',
          keywords: ['bushfire preparation', 'fire safety', 'property protection'],
          priority: 'high',
          estimatedWordCount: 2000,
          targetPublishDate: `${year}-11-01`,
        },
        {
          title: 'Creating a Family Emergency Evacuation Plan',
          category: 'EMERGENCY_GUIDE',
          keywords: ['evacuation plan', 'emergency planning', 'family safety'],
          priority: 'high',
          estimatedWordCount: 1700,
          targetPublishDate: `${year}-11-10`,
        },
        {
          title: 'Bushfire Insurance: What You Need to Know',
          category: 'INSURANCE_CLAIM',
          keywords: ['bushfire insurance', 'fire coverage', 'policy review'],
          priority: 'high',
          estimatedWordCount: 1900,
          targetPublishDate: `${year}-11-20`,
        },

        // December - Year-End & Summer Prep
        {
          title: 'Year-End Property Maintenance Checklist',
          category: 'PREVENTION',
          keywords: ['year-end maintenance', 'property checklist', 'annual review'],
          priority: 'medium',
          estimatedWordCount: 1600,
          targetPublishDate: `${year}-12-01`,
        },
        {
          title: 'Summer Holiday Property Protection Tips',
          category: 'PREVENTION',
          keywords: ['holiday protection', 'vacant property', 'summer safety'],
          priority: 'medium',
          estimatedWordCount: 1500,
          targetPublishDate: `${year}-12-10`,
        },
      ],
    };
  }

  /**
   * Get monthly theme for a specific month
   */
  getMonthlyTheme(month: number, year: number = 2025): MonthlyTheme {
    const themes: Record<number, MonthlyTheme> = {
      1: {
        month: 'January',
        theme: 'Bushfire Recovery & Summer Storm Prep',
        focus: ['Bushfire damage', 'Storm preparation', 'Emergency response'],
        seasonalContext: 'Peak bushfire season, summer storms beginning',
      },
      2: {
        month: 'February',
        theme: 'Water Damage Focus',
        focus: ['Flood response', 'Water extraction', 'Mould prevention'],
        seasonalContext: 'Continued summer weather, increased rainfall',
      },
      3: {
        month: 'March',
        theme: 'Insurance Claims Month',
        focus: ['Claim filing', 'Documentation', 'Coverage understanding'],
        seasonalContext: 'End of summer, storm season winding down',
      },
      4: {
        month: 'April',
        theme: 'Autumn Maintenance',
        focus: ['Preventative care', 'Gutter cleaning', 'Commercial properties'],
        seasonalContext: 'Autumn begins, maintenance season',
      },
      5: {
        month: 'May',
        theme: 'Winter Preparation',
        focus: ['Cold weather prep', 'Roof maintenance', 'Heating systems'],
        seasonalContext: 'Late autumn, winter approaching',
      },
      6: {
        month: 'June',
        theme: 'Commercial & Strata Focus',
        focus: ['Business continuity', 'Strata management', 'Commercial insurance'],
        seasonalContext: 'Winter begins, focus on building management',
      },
      7: {
        month: 'July',
        theme: 'Winter Issues',
        focus: ['Cold damage', 'Condensation', 'Mould', 'Indoor air quality'],
        seasonalContext: 'Mid-winter, moisture and condensation issues',
      },
      8: {
        month: 'August',
        theme: 'Contractor Empowerment',
        focus: ['Certifications', 'Business growth', 'Industry insights'],
        seasonalContext: 'Late winter, contractor development focus',
      },
      9: {
        month: 'September',
        theme: 'Spring Preparation',
        focus: ['Storm prep', 'Spring cleaning', 'Property inspection'],
        seasonalContext: 'Spring begins, severe weather preparation',
      },
      10: {
        month: 'October',
        theme: 'Severe Weather Season',
        focus: ['Storm response', 'Hail damage', 'Emergency services'],
        seasonalContext: 'Peak spring storm season',
      },
      11: {
        month: 'November',
        theme: 'Bushfire Preparation',
        focus: ['Fire safety', 'Evacuation planning', 'Property protection'],
        seasonalContext: 'Bushfire season begins, critical preparation period',
      },
      12: {
        month: 'December',
        theme: 'Year-End Review & Summer Prep',
        focus: ['Annual maintenance', 'Holiday protection', 'Emergency planning'],
        seasonalContext: 'Summer begins, holiday season, bushfire risks',
      },
    };

    return themes[month];
  }

  /**
   * Get content gaps analysis
   */
  analyzeContentGaps(existingArticles: Array<{ category: BlogCategory; keywords: string[] }>) {
    const gaps: Record<BlogCategory, string[]> = {
      EMERGENCY_GUIDE: [
        'Cyclone response guide',
        'Lightning strike damage',
        'Sewer backup emergency',
        'Vandalism cleanup',
        'Hoarding cleanup',
      ],
      INSURANCE_CLAIM: [
        'Denied claim appeals process',
        'Public adjuster vs contractor',
        'Documentation best practices',
        'Depreciation in claims',
        'Replacement cost vs actual cash value',
      ],
      PREVENTION: [
        'Air quality improvement',
        'Dehumidifier selection guide',
        'Water leak detection systems',
        'Smart home flood sensors',
        'Fireproofing your home',
      ],
      INDUSTRY_INSIGHT: [
        'Restoration equipment guide',
        'Marketing for restoration contractors',
        'Customer service excellence',
        'Project management tools',
        'Pricing strategies for contractors',
      ],
      CASE_STUDY: [],
      RESOURCE: [],
    };

    return gaps;
  }

  /**
   * Get recommended publishing schedule
   */
  getPublishingSchedule() {
    return {
      frequency: '2-3 articles per week',
      optimalDays: ['Tuesday', 'Thursday', 'Saturday'],
      optimalTimes: ['9:00 AM AEST', '2:00 PM AEST'],
      seasonalAdjustments: [
        {
          season: 'Bushfire Season (Nov-Feb)',
          frequency: '3-4 articles per week',
          focus: 'Emergency response and recovery content',
        },
        {
          season: 'Storm Season (Sep-Mar)',
          frequency: '3 articles per week',
          focus: 'Storm preparation and water damage content',
        },
        {
          season: 'Low Season (Apr-Aug)',
          frequency: '2 articles per week',
          focus: 'Preventative maintenance and contractor insights',
        },
      ],
    };
  }
}

// Export singleton instance
export const editorialCalendar = new EditorialCalendar();
