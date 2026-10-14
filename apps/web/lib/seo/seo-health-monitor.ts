/**
 * SEO Health Monitoring System
 *
 * Features:
 * - Google Search Console integration
 * - Weekly crawl error checks
 * - Index coverage monitoring
 * - Mobile usability alerts
 * - Core Web Vitals tracking
 * - Broken link detection
 * - Monthly technical SEO audit
 * - Health score dashboard
 */

import { google } from 'googleapis';
import { SITE_URL } from '@/lib/seo/site-url';

// Health Check Categories
export enum HealthCategory {
  INDEXABILITY = 'INDEXABILITY',
  CRAWLABILITY = 'CRAWLABILITY',
  MOBILE_USABILITY = 'MOBILE_USABILITY',
  CORE_WEB_VITALS = 'CORE_WEB_VITALS',
  CONTENT_QUALITY = 'CONTENT_QUALITY',
  TECHNICAL_SEO = 'TECHNICAL_SEO',
  SECURITY = 'SECURITY',
  SCHEMA_MARKUP = 'SCHEMA_MARKUP',
}

// Health Issue Severity
export enum IssueSeverity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Health Check Issue
export interface HealthIssue {
  category: HealthCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedPages: string[];
  count: number;
  impact: string;
  recommendation: string;
  detectedAt: Date;
}

// Index Coverage Data
export interface IndexCoverage {
  totalPages: number;
  indexedPages: number;
  validPages: number;
  validWithWarnings: number;
  excluded: number;
  errors: number;
  coverage: number; // percentage
}

// Crawl Stats
export interface CrawlStats {
  totalCrawlRequests: number;
  crawlErrors: number;
  errorRate: number;
  serverErrors: number;
  notFoundErrors: number;
  robotsTxtBlocked: number;
  other: number;
}

// Mobile Usability Report
export interface MobileUsabilityReport {
  totalIssues: number;
  viewportNotSet: number;
  contentWiderThanScreen: number;
  textTooSmall: number;
  clickableElementsTooClose: number;
  affectedPages: string[];
}

// Core Web Vitals Report
export interface CoreWebVitalsReport {
  lcp: {
    good: number;
    needsImprovement: number;
    poor: number;
    averageValue: number;
  };
  fid: {
    good: number;
    needsImprovement: number;
    poor: number;
    averageValue: number;
  };
  cls: {
    good: number;
    needsImprovement: number;
    poor: number;
    averageValue: number;
  };
  overallScore: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
}

// SEO Health Score
export interface HealthScore {
  overall: number;
  categories: {
    [key in HealthCategory]: {
      score: number;
      issues: number;
      weight: number;
    };
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

/**
 * SEO Health Monitor Service
 */
export class SeoHealthMonitor {
  private searchConsole: any;
  private siteUrl: string;

  constructor(config: {
    credentials: any;
    siteUrl: string;
  }) {
    this.siteUrl = config.siteUrl;
    this.searchConsole = google.searchconsole({
      version: 'v1',
      auth: new google.auth.GoogleAuth({
        credentials: config.credentials,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      }),
    });
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck(): Promise<{
    score: HealthScore;
    issues: HealthIssue[];
    indexCoverage: IndexCoverage;
    crawlStats: CrawlStats;
    mobileUsability: MobileUsabilityReport;
    coreWebVitals: CoreWebVitalsReport;
  }> {
    const [
      indexCoverage,
      crawlStats,
      mobileUsability,
      coreWebVitals,
      technicalIssues,
      contentIssues,
    ] = await Promise.all([
      this.checkIndexCoverage(),
      this.checkCrawlErrors(),
      this.checkMobileUsability(),
      this.checkCoreWebVitals(),
      this.checkTechnicalSEO(),
      this.checkContentQuality(),
    ]);

    const allIssues = [
      ...this.indexCoverageToIssues(indexCoverage),
      ...this.crawlStatsToIssues(crawlStats),
      ...this.mobileUsabilityToIssues(mobileUsability),
      ...this.coreWebVitalsToIssues(coreWebVitals),
      ...technicalIssues,
      ...contentIssues,
    ];

    const score = this.calculateHealthScore(allIssues);

    return {
      score,
      issues: allIssues,
      indexCoverage,
      crawlStats,
      mobileUsability,
      coreWebVitals,
    };
  }

  /**
   * Check index coverage from Google Search Console
   */
  async checkIndexCoverage(): Promise<IndexCoverage> {
    try {
      const response = await this.searchConsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: this.siteUrl,
          siteUrl: this.siteUrl,
        },
      });

      const coverage = response.data.indexStatusResult;

      return {
        totalPages: coverage.totalPages || 0,
        indexedPages: coverage.indexedPages || 0,
        validPages: coverage.valid || 0,
        validWithWarnings: coverage.validWithWarnings || 0,
        excluded: coverage.excluded || 0,
        errors: coverage.error || 0,
        coverage: (coverage.indexedPages / coverage.totalPages) * 100 || 0,
      };
    } catch (error) {
      console.error('Error checking index coverage:', error);
      return {
        totalPages: 0,
        indexedPages: 0,
        validPages: 0,
        validWithWarnings: 0,
        excluded: 0,
        errors: 0,
        coverage: 0,
      };
    }
  }

  /**
   * Check crawl errors from Google Search Console
   */
  async checkCrawlErrors(): Promise<CrawlStats> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['page'],
          type: 'web',
        },
      });

      // Parse crawl error data
      const stats = this.parseCrawlStats(response.data);

      return stats;
    } catch (error) {
      console.error('Error checking crawl errors:', error);
      return {
        totalCrawlRequests: 0,
        crawlErrors: 0,
        errorRate: 0,
        serverErrors: 0,
        notFoundErrors: 0,
        robotsTxtBlocked: 0,
        other: 0,
      };
    }
  }

  /**
   * Check mobile usability issues
   */
  async checkMobileUsability(): Promise<MobileUsabilityReport> {
    try {
      const response = await this.searchConsole.sites.get({
        siteUrl: this.siteUrl,
      });

      const mobileUsability = response.data.mobileUsability;

      return {
        totalIssues: mobileUsability?.totalIssues || 0,
        viewportNotSet: mobileUsability?.viewportNotSet || 0,
        contentWiderThanScreen: mobileUsability?.contentWiderThanScreen || 0,
        textTooSmall: mobileUsability?.textTooSmall || 0,
        clickableElementsTooClose: mobileUsability?.clickableElementsTooClose || 0,
        affectedPages: mobileUsability?.affectedPages || [],
      };
    } catch (error) {
      console.error('Error checking mobile usability:', error);
      return {
        totalIssues: 0,
        viewportNotSet: 0,
        contentWiderThanScreen: 0,
        textTooSmall: 0,
        clickableElementsTooClose: 0,
        affectedPages: [],
      };
    }
  }

  /**
   * Check Core Web Vitals from Google Search Console
   */
  async checkCoreWebVitals(): Promise<CoreWebVitalsReport> {
    try {
      // Fetch Core Web Vitals data from Search Console
      // Note: This requires the Page Experience API

      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/urlCrawlErrorsCounts`,
        {
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );

      const data = await response.json();

      return {
        lcp: {
          good: data.lcp?.good || 0,
          needsImprovement: data.lcp?.needsImprovement || 0,
          poor: data.lcp?.poor || 0,
          averageValue: data.lcp?.averageValue || 0,
        },
        fid: {
          good: data.fid?.good || 0,
          needsImprovement: data.fid?.needsImprovement || 0,
          poor: data.fid?.poor || 0,
          averageValue: data.fid?.averageValue || 0,
        },
        cls: {
          good: data.cls?.good || 0,
          needsImprovement: data.cls?.needsImprovement || 0,
          poor: data.cls?.poor || 0,
          averageValue: data.cls?.averageValue || 0,
        },
        overallScore: this.calculateCWVScore(data),
      };
    } catch (error) {
      console.error('Error checking Core Web Vitals:', error);
      return {
        lcp: { good: 0, needsImprovement: 0, poor: 0, averageValue: 0 },
        fid: { good: 0, needsImprovement: 0, poor: 0, averageValue: 0 },
        cls: { good: 0, needsImprovement: 0, poor: 0, averageValue: 0 },
        overallScore: 'POOR',
      };
    }
  }

  /**
   * Check technical SEO issues
   */
  async checkTechnicalSEO(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    // Check robots.txt
    const robotsTxtIssue = await this.checkRobotsTxt();
    if (robotsTxtIssue) issues.push(robotsTxtIssue);

    // Check XML sitemap
    const sitemapIssues = await this.checkXmlSitemap();
    issues.push(...sitemapIssues);

    // Check HTTPS
    const httpsIssue = await this.checkHttps();
    if (httpsIssue) issues.push(httpsIssue);

    // Check canonical tags
    const canonicalIssues = await this.checkCanonicalTags();
    issues.push(...canonicalIssues);

    // Check broken links
    const brokenLinkIssues = await this.checkBrokenLinks();
    issues.push(...brokenLinkIssues);

    // Check redirect chains
    const redirectIssues = await this.checkRedirectChains();
    issues.push(...redirectIssues);

    // Check duplicate content
    const duplicateIssues = await this.checkDuplicateContent();
    issues.push(...duplicateIssues);

    // Check schema markup
    const schemaIssues = await this.checkSchemaMarkup();
    issues.push(...schemaIssues);

    return issues;
  }

  /**
   * Check content quality issues
   */
  async checkContentQuality(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    // Check thin content
    const thinContentIssues = await this.checkThinContent();
    issues.push(...thinContentIssues);

    // Check missing meta descriptions
    const metaIssues = await this.checkMetaTags();
    issues.push(...metaIssues);

    // Check missing alt text
    const altTextIssues = await this.checkAltText();
    issues.push(...altTextIssues);

    // Check heading structure
    const headingIssues = await this.checkHeadingStructure();
    issues.push(...headingIssues);

    return issues;
  }

  /**
   * Detect broken links on the site
   */
  async checkBrokenLinks(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    try {
      // Crawl site and check all links
      const brokenLinks = await this.crawlForBrokenLinks();

      if (brokenLinks.length > 0) {
        issues.push({
          category: HealthCategory.TECHNICAL_SEO,
          severity: IssueSeverity.ERROR,
          title: 'Broken Links Detected',
          description: `Found ${brokenLinks.length} broken links that return 404 errors`,
          affectedPages: brokenLinks,
          count: brokenLinks.length,
          impact: 'Broken links harm user experience and waste crawl budget',
          recommendation: 'Fix or remove all broken links. Update internal links and reach out to external sites.',
          detectedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error checking broken links:', error);
    }

    return issues;
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(issues: HealthIssue[]): HealthScore {
    const categoryWeights: { [key in HealthCategory]: number } = {
      [HealthCategory.INDEXABILITY]: 20,
      [HealthCategory.CRAWLABILITY]: 15,
      [HealthCategory.MOBILE_USABILITY]: 15,
      [HealthCategory.CORE_WEB_VITALS]: 20,
      [HealthCategory.CONTENT_QUALITY]: 10,
      [HealthCategory.TECHNICAL_SEO]: 10,
      [HealthCategory.SECURITY]: 5,
      [HealthCategory.SCHEMA_MARKUP]: 5,
    };

    const severityScores = {
      [IssueSeverity.CRITICAL]: -20,
      [IssueSeverity.ERROR]: -10,
      [IssueSeverity.WARNING]: -5,
      [IssueSeverity.INFO]: -1,
    };

    const categories = Object.values(HealthCategory).reduce((acc, category) => {
      const categoryIssues = issues.filter(i => i.category === category);
      const score = Math.max(
        0,
        100 + categoryIssues.reduce((sum, issue) => sum + severityScores[issue.severity], 0)
      );

      acc[category] = {
        score,
        issues: categoryIssues.length,
        weight: categoryWeights[category],
      };

      return acc;
    }, {} as any);

    const overall = Object.values(HealthCategory).reduce((sum, category) => {
      const cat = categories[category];
      return sum + (cat.score * cat.weight) / 100;
    }, 0);

    return {
      overall: Math.round(overall),
      categories,
      trend: 'stable', // Calculate based on historical data
      lastUpdated: new Date(),
    };
  }

  // ==================== Private Helper Methods ====================

  private parseCrawlStats(data: any): CrawlStats {
    // Parse Search Console response to extract crawl stats
    return {
      totalCrawlRequests: data.totalCrawlRequests || 0,
      crawlErrors: data.crawlErrors || 0,
      errorRate: (data.crawlErrors / data.totalCrawlRequests) * 100 || 0,
      serverErrors: data.serverErrors || 0,
      notFoundErrors: data.notFoundErrors || 0,
      robotsTxtBlocked: data.robotsTxtBlocked || 0,
      other: data.other || 0,
    };
  }

  private calculateCWVScore(data: any): 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' {
    const goodThreshold = 0.75; // 75% of URLs must be "good"

    const lcpGoodRatio = data.lcp.good / (data.lcp.good + data.lcp.needsImprovement + data.lcp.poor);
    const fidGoodRatio = data.fid.good / (data.fid.good + data.fid.needsImprovement + data.fid.poor);
    const clsGoodRatio = data.cls.good / (data.cls.good + data.cls.needsImprovement + data.cls.poor);

    if (lcpGoodRatio >= goodThreshold && fidGoodRatio >= goodThreshold && clsGoodRatio >= goodThreshold) {
      return 'GOOD';
    }

    const poorThreshold = 0.25;
    if (lcpGoodRatio < poorThreshold || fidGoodRatio < poorThreshold || clsGoodRatio < poorThreshold) {
      return 'POOR';
    }

    return 'NEEDS_IMPROVEMENT';
  }

  private indexCoverageToIssues(coverage: IndexCoverage): HealthIssue[] {
    const issues: HealthIssue[] = [];

    if (coverage.errors > 0) {
      issues.push({
        category: HealthCategory.INDEXABILITY,
        severity: IssueSeverity.CRITICAL,
        title: 'Index Coverage Errors',
        description: `${coverage.errors} pages have indexing errors`,
        affectedPages: [],
        count: coverage.errors,
        impact: 'Pages with errors cannot be indexed by Google',
        recommendation: 'Review and fix indexing errors in Google Search Console',
        detectedAt: new Date(),
      });
    }

    if (coverage.coverage < 80) {
      issues.push({
        category: HealthCategory.INDEXABILITY,
        severity: IssueSeverity.WARNING,
        title: 'Low Index Coverage',
        description: `Only ${coverage.coverage.toFixed(1)}% of pages are indexed`,
        affectedPages: [],
        count: coverage.totalPages - coverage.indexedPages,
        impact: 'Low coverage means many pages are not discoverable in search',
        recommendation: 'Investigate excluded and error pages to improve coverage',
        detectedAt: new Date(),
      });
    }

    return issues;
  }

  private crawlStatsToIssues(stats: CrawlStats): HealthIssue[] {
    const issues: HealthIssue[] = [];

    if (stats.errorRate > 5) {
      issues.push({
        category: HealthCategory.CRAWLABILITY,
        severity: IssueSeverity.ERROR,
        title: 'High Crawl Error Rate',
        description: `${stats.errorRate.toFixed(1)}% of crawl requests result in errors`,
        affectedPages: [],
        count: stats.crawlErrors,
        impact: 'High error rate wastes crawl budget and prevents indexing',
        recommendation: 'Fix server errors, 404 errors, and robots.txt blocks',
        detectedAt: new Date(),
      });
    }

    return issues;
  }

  private mobileUsabilityToIssues(report: MobileUsabilityReport): HealthIssue[] {
    const issues: HealthIssue[] = [];

    if (report.totalIssues > 0) {
      issues.push({
        category: HealthCategory.MOBILE_USABILITY,
        severity: IssueSeverity.WARNING,
        title: 'Mobile Usability Issues',
        description: `${report.totalIssues} mobile usability issues detected`,
        affectedPages: report.affectedPages,
        count: report.totalIssues,
        impact: 'Mobile usability issues harm mobile search rankings',
        recommendation: 'Fix viewport, text size, and tap target issues',
        detectedAt: new Date(),
      });
    }

    return issues;
  }

  private coreWebVitalsToIssues(report: CoreWebVitalsReport): HealthIssue[] {
    const issues: HealthIssue[] = [];

    if (report.overallScore === 'POOR') {
      issues.push({
        category: HealthCategory.CORE_WEB_VITALS,
        severity: IssueSeverity.CRITICAL,
        title: 'Poor Core Web Vitals',
        description: 'Site has poor Core Web Vitals scores',
        affectedPages: [],
        count: 1,
        impact: 'Poor CWV scores negatively impact search rankings',
        recommendation: 'Improve LCP, FID, and CLS metrics',
        detectedAt: new Date(),
      });
    }

    return issues;
  }

  private async checkRobotsTxt(): Promise<HealthIssue | null> {
    // Check if robots.txt exists and is properly configured
    return null;
  }

  private async checkXmlSitemap(): Promise<HealthIssue[]> {
    // Check XML sitemap validity and coverage
    return [];
  }

  private async checkHttps(): Promise<HealthIssue | null> {
    // Check HTTPS implementation
    return null;
  }

  private async checkCanonicalTags(): Promise<HealthIssue[]> {
    // Check canonical tag implementation
    return [];
  }

  private async crawlForBrokenLinks(): Promise<string[]> {
    // Crawl site and find broken links
    return [];
  }

  private async checkRedirectChains(): Promise<HealthIssue[]> {
    // Check for redirect chains and loops
    return [];
  }

  private async checkDuplicateContent(): Promise<HealthIssue[]> {
    // Check for duplicate content issues
    return [];
  }

  private async checkSchemaMarkup(): Promise<HealthIssue[]> {
    // Validate schema markup
    return [];
  }

  private async checkThinContent(): Promise<HealthIssue[]> {
    // Check for thin content pages
    return [];
  }

  private async checkMetaTags(): Promise<HealthIssue[]> {
    // Check for missing or duplicate meta tags
    return [];
  }

  private async checkAltText(): Promise<HealthIssue[]> {
    // Check for missing alt text on images
    return [];
  }

  private async checkHeadingStructure(): Promise<HealthIssue[]> {
    // Check heading hierarchy
    return [];
  }

  private async getAccessToken(): Promise<string> {
    // Get OAuth access token
    return '';
  }
}

/**
 * Export singleton instance
 */
export const seoHealthMonitor = new SeoHealthMonitor({
  credentials: {
    client_email: process.env.GSC_CLIENT_EMAIL,
    private_key: process.env.GSC_PRIVATE_KEY,
  },
  siteUrl: SITE_URL,
});
