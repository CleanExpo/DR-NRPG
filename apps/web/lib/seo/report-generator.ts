// @ts-nocheck

/**
 * Automated Reporting System
 *
 * Features:
 * - Daily briefs (top opportunities, ranking changes)
 * - Weekly reports (traffic, rankings, backlinks)
 * - Monthly reports (comprehensive analysis)
 * - Executive dashboards
 * - Email delivery system
 */

import { rankTracker } from './rank-tracker';
import { seoHealthMonitor } from './seo-health-monitor';
import { analyticsTracker } from './analytics-tracker';
// import { backlinkAuditor } from "./backlink-auditor";
import { sendMailOrThrow } from '@/lib/email/mailtrap';

// Report Type
export enum ReportType {
  DAILY_BRIEF = 'DAILY_BRIEF',
  WEEKLY_REPORT = 'WEEKLY_REPORT',
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  EXECUTIVE_DASHBOARD = 'EXECUTIVE_DASHBOARD',
  CUSTOM = 'CUSTOM',
}

// Report Format
export enum ReportFormat {
  HTML = 'HTML',
  PDF = 'PDF',
  JSON = 'JSON',
  CSV = 'CSV',
}

// Daily Brief Data
export interface DailyBrief {
  date: Date;
  summary: {
    rankingChanges: number;
    newOpportunities: number;
    criticalIssues: number;
    conversions: number;
  };
  highlights: {
    topGainers: Array<{ keyword: string; change: number }>;
    topDecliners: Array<{ keyword: string; change: number }>;
    opportunities: Array<{ keyword: string; potential: number }>;
    criticalAlerts: Array<{ title: string; severity: string }>;
  };
  quickStats: {
    avgPosition: number;
    top10Keywords: number;
    organicTraffic: number;
    conversions: number;
  };
}

// Weekly Report Data
export interface WeeklyReport {
  week: { start: Date; end: Date };
  rankings: {
    summary: any;
    topGainers: any[];
    topDecliners: any[];
    opportunities: any[];
  };
  traffic: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    conversions: number;
    conversionRate: number;
  };
  backlinks: {
    newBacklinks: number;
    lostBacklinks: number;
    totalBacklinks: number;
    domainRating: number;
    topNewBacklinks: any[];
  };
  health: {
    score: number;
    criticalIssues: any[];
    warnings: any[];
  };
  recommendations: string[];
}

// Monthly Report Data
export interface MonthlyReport {
  month: { start: Date; end: Date };
  executiveSummary: {
    keyAchievements: string[];
    challenges: string[];
    recommendations: string[];
  };
  performance: {
    rankings: any;
    traffic: any;
    conversions: any;
    roi: any;
  };
  deepDive: {
    contentPerformance: any[];
    technicalSEO: any;
    linkBuilding: any;
    competitorAnalysis: any;
  };
  goals: {
    previous: any[];
    achieved: any[];
    upcoming: any[];
  };
}

// Report Delivery Options
export interface DeliveryOptions {
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  schedule?: 'immediate' | 'daily' | 'weekly' | 'monthly';
  format?: ReportFormat;
}

/**
 * Report Generator Service
 */
export class ReportGenerator {
  // DR-964: reports are delivered through the Mailtrap mail module, not SMTP.

  /**
   * Generate daily brief
   */
  async generateDailyBrief(): Promise<DailyBrief> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    try {
      // Get ranking changes
      const rankingAlerts = await rankTracker.detectRankingChanges(3);

      // Get opportunities
      const opportunities = await rankTracker.identifyOpportunities();

      // Get health issues
      const healthCheck = await seoHealthMonitor.runHealthCheck();
      const criticalIssues = healthCheck.issues.filter(i => i.severity === 'CRITICAL');

      // Get conversion data
      const analytics = await analyticsTracker.generateReport(yesterday, today);

      // Get current stats
      const currentRankings = await rankTracker.trackAllKeywords();
      const avgPosition = currentRankings.reduce((sum, r) => sum + (r.position || 0), 0) / currentRankings.length;
      const top10Keywords = currentRankings.filter(r => r.position && r.position <= 10).length;

      return {
        date: today,
        summary: {
          rankingChanges: rankingAlerts.length,
          newOpportunities: opportunities.length,
          criticalIssues: criticalIssues.length,
          conversions: analytics.overview.conversions,
        },
        highlights: {
          topGainers: rankingAlerts
            .filter(a => a.change > 0)
            .slice(0, 5)
            .map(a => ({ keyword: a.keyword, change: a.change })),
          topDecliners: rankingAlerts
            .filter(a => a.change < 0)
            .slice(0, 5)
            .map(a => ({ keyword: a.keyword, change: a.change })),
          opportunities: opportunities
            .slice(0, 5)
            .map(o => ({ keyword: o.keyword, potential: o.estimatedTraffic })),
          criticalAlerts: criticalIssues
            .slice(0, 5)
            .map(i => ({ title: i.title, severity: i.severity })),
        },
        quickStats: {
          avgPosition,
          top10Keywords,
          organicTraffic: analytics.overview.sessions,
          conversions: analytics.overview.conversions,
        },
      };
    } catch (error) {
      console.error('Error generating daily brief:', error);
      throw error;
    }
  }

  /**
   * Generate weekly report
   */
  async generateWeeklyReport(): Promise<WeeklyReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      const [rankingReport, analyticsReport, healthCheck] = await Promise.all([
        rankTracker.generateWeeklyReport(),
        analyticsTracker.generateReport(startDate, endDate),
        seoHealthMonitor.runHealthCheck(),
      ]);

      // Get backlink data (assuming backlinkAuditor exists)
      const backlinkData = {
        newBacklinks: 0,
        lostBacklinks: 0,
        totalBacklinks: 0,
        domainRating: 0,
        topNewBacklinks: [],
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        rankings: rankingReport,
        analytics: analyticsReport,
        health: healthCheck,
      });

      return {
        week: { start: startDate, end: endDate },
        rankings: {
          summary: rankingReport.summary,
          topGainers: rankingReport.topGainers,
          topDecliners: rankingReport.topDecliners,
          opportunities: rankingReport.opportunities,
        },
        traffic: {
          sessions: analyticsReport.overview.sessions,
          users: analyticsReport.overview.users,
          pageviews: analyticsReport.overview.pageviews,
          bounceRate: analyticsReport.overview.bounceRate,
          conversions: analyticsReport.overview.conversions,
          conversionRate: analyticsReport.overview.conversionRate,
        },
        backlinks: backlinkData,
        health: {
          score: healthCheck.score.overall,
          criticalIssues: healthCheck.issues.filter(i => i.severity === 'CRITICAL'),
          warnings: healthCheck.issues.filter(i => i.severity === 'WARNING'),
        },
        recommendations,
      };
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport(): Promise<MonthlyReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    try {
      const [rankingReport, analyticsReport, healthCheck, roi] = await Promise.all([
        rankTracker.generateWeeklyReport(), // Use weekly for monthly too
        analyticsTracker.generateReport(startDate, endDate),
        seoHealthMonitor.runHealthCheck(),
        analyticsTracker.calculateSeoROI(startDate, endDate),
      ]);

      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary({
        rankings: rankingReport,
        analytics: analyticsReport,
        health: healthCheck,
        roi,
      });

      // Content performance analysis
      const contentPerformance = await this.analyzeContentPerformance(startDate, endDate);

      // Competitor analysis
      const competitorAnalysis = await this.analyzeCompetitors(startDate, endDate);

      return {
        month: { start: startDate, end: endDate },
        executiveSummary,
        performance: {
          rankings: rankingReport.summary,
          traffic: analyticsReport.overview,
          conversions: {
            total: analyticsReport.overview.conversions,
            rate: analyticsReport.overview.conversionRate,
            funnel: analyticsReport.conversionFunnel,
          },
          roi,
        },
        deepDive: {
          contentPerformance,
          technicalSEO: {
            score: healthCheck.score.overall,
            issues: healthCheck.issues,
            indexCoverage: healthCheck.indexCoverage,
            coreWebVitals: healthCheck.coreWebVitals,
          },
          linkBuilding: {
            // Add backlink analysis
          },
          competitorAnalysis,
        },
        goals: {
          previous: await this.getPreviousGoals(),
          achieved: await this.getAchievedGoals(),
          upcoming: await this.getUpcomingGoals(),
        },
      };
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Generate executive dashboard
   */
  async generateExecutiveDashboard(): Promise<{
    kpis: {
      name: string;
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
      target?: number;
    }[];
    charts: {
      type: 'line' | 'bar' | 'pie';
      title: string;
      data: any;
    }[];
    alerts: any[];
    recommendations: string[];
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = startDate;
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const [currentAnalytics, previousAnalytics, healthCheck, roi] = await Promise.all([
        analyticsTracker.generateReport(startDate, endDate),
        analyticsTracker.generateReport(previousPeriodStart, previousPeriodEnd),
        seoHealthMonitor.runHealthCheck(),
        analyticsTracker.calculateSeoROI(startDate, endDate),
      ]);

      // Calculate KPIs
      const kpis = [
        {
          name: 'Organic Traffic',
          value: currentAnalytics.overview.sessions,
          change: this.calculateChange(currentAnalytics.overview.sessions, previousAnalytics.overview.sessions),
          trend: this.getTrend(currentAnalytics.overview.sessions, previousAnalytics.overview.sessions),
          target: 10000,
        },
        {
          name: 'Conversions',
          value: currentAnalytics.overview.conversions,
          change: this.calculateChange(currentAnalytics.overview.conversions, previousAnalytics.overview.conversions),
          trend: this.getTrend(currentAnalytics.overview.conversions, previousAnalytics.overview.conversions),
          target: 100,
        },
        {
          name: 'Conversion Rate',
          value: currentAnalytics.overview.conversionRate,
          change: this.calculateChange(currentAnalytics.overview.conversionRate, previousAnalytics.overview.conversionRate),
          trend: this.getTrend(currentAnalytics.overview.conversionRate, previousAnalytics.overview.conversionRate),
          target: 5,
        },
        {
          name: 'SEO ROI',
          value: roi.roi,
          change: 0, // Need previous period ROI
          trend: 'stable',
          target: 300,
        },
        {
          name: 'SEO Health Score',
          value: healthCheck.score.overall,
          change: 0, // Need previous health score
          trend: healthCheck.score.trend,
        },
      ];

      // Prepare chart data
      const charts = [
        {
          type: 'line' as const,
          title: 'Organic Traffic Trend',
          data: await this.getTrafficTrendData(startDate, endDate),
        },
        {
          type: 'bar' as const,
          title: 'Top Traffic Sources',
          data: currentAnalytics.trafficSources.slice(0, 5),
        },
        {
          type: 'pie' as const,
          title: 'Conversion Funnel',
          data: currentAnalytics.conversionFunnel,
        },
      ];

      // Get alerts
      const alerts = healthCheck.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR');

      // Generate recommendations
      const recommendations = this.generateExecutiveRecommendations({
        kpis,
        analytics: currentAnalytics,
        health: healthCheck,
        roi,
      });

      return {
        kpis,
        charts,
        alerts,
        recommendations,
      };
    } catch (error) {
      console.error('Error generating executive dashboard:', error);
      throw error;
    }
  }

  /**
   * Deliver report via email
   */
  async deliverReport(
    report: any,
    type: ReportType,
    options: DeliveryOptions
  ): Promise<void> {
    try {
      // Generate HTML email
      const html = await this.generateEmailHtml(report, type);

      // Send email
      // Throws MailNotConfiguredError / MailSendError, so the catch below
      // rethrows and the caller never believes an undelivered report was sent.
      await sendMailOrThrow({
        to: options.recipients,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject || this.getDefaultSubject(type),
        html,
        attachments: options.format === ReportFormat.PDF ? [
          {
            filename: `${type}_${new Date().toISOString().split('T')[0]}.pdf`,
            content: await this.generatePdfReport(report, type),
            type: 'application/pdf',
          },
        ] : [],
      });

      console.log(`Report delivered successfully to ${options.recipients.length} recipients`);
    } catch (error) {
      console.error('Error delivering report:', error);
      throw error;
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Generate recommendations based on data
   */
  private generateRecommendations(data: {
    rankings: any;
    analytics: any;
    health: any;
  }): string[] {
    const recommendations: string[] = [];

    // Ranking recommendations
    if (data.rankings.summary.positionChange < 0) {
      recommendations.push('Focus on improving rankings for declining keywords');
    }

    if (data.rankings.opportunities.length > 0) {
      recommendations.push(`Prioritize ${data.rankings.opportunities.length} identified ranking opportunities`);
    }

    // Traffic recommendations
    if (data.analytics.overview.bounceRate > 60) {
      recommendations.push('High bounce rate detected - improve landing page content and UX');
    }

    if (data.analytics.overview.conversionRate < 2) {
      recommendations.push('Low conversion rate - optimize CTAs and conversion funnel');
    }

    // Health recommendations
    if (data.health.score.overall < 70) {
      recommendations.push('SEO health score is below target - address critical technical issues');
    }

    return recommendations;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(data: any): {
    keyAchievements: string[];
    challenges: string[];
    recommendations: string[];
  } {
    const achievements: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    // Analyze achievements
    if (data.rankings.summary.positionChange > 0) {
      achievements.push(`Average ranking improved by ${data.rankings.summary.positionChange.toFixed(1)} positions`);
    }

    if (data.roi.roi > 100) {
      achievements.push(`SEO ROI at ${data.roi.roi.toFixed(0)}% - exceeding targets`);
    }

    // Analyze challenges
    if (data.health.score.overall < 70) {
      challenges.push('Technical SEO health below target');
    }

    if (data.analytics.overview.conversionRate < 2) {
      challenges.push('Conversion rate below industry benchmark');
    }

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(data));

    return {
      keyAchievements: achievements,
      challenges,
      recommendations,
    };
  }

  /**
   * Analyze content performance
   */
  private async analyzeContentPerformance(startDate: Date, endDate: Date): Promise<any[]> {
    // Analyze which content performs best
    return [];
  }

  /**
   * Analyze competitors
   */
  private async analyzeCompetitors(startDate: Date, endDate: Date): Promise<any> {
    // Competitor ranking and traffic analysis
    return {};
  }

  /**
   * Get previous goals
   */
  private async getPreviousGoals(): Promise<any[]> {
    return [];
  }

  /**
   * Get achieved goals
   */
  private async getAchievedGoals(): Promise<any[]> {
    return [];
  }

  /**
   * Get upcoming goals
   */
  private async getUpcomingGoals(): Promise<any[]> {
    return [];
  }

  /**
   * Calculate percentage change
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Determine trend direction
   */
  private getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const change = this.calculateChange(current, previous);
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  /**
   * Get traffic trend data for charts
   */
  private async getTrafficTrendData(startDate: Date, endDate: Date): Promise<any> {
    return [];
  }

  /**
   * Generate executive recommendations
   */
  private generateExecutiveRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    // Analyze KPIs
    data.kpis.forEach((kpi: any) => {
      if (kpi.target && kpi.value < kpi.target * 0.8) {
        recommendations.push(`${kpi.name} is ${((kpi.target - kpi.value) / kpi.target * 100).toFixed(0)}% below target - requires immediate attention`);
      }
    });

    return recommendations;
  }

  /**
   * Generate HTML email
   */
  private async generateEmailHtml(report: any, type: ReportType): Promise<string> {
    // Generate HTML email template
    // Use a templating engine like Handlebars or build HTML string
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .metric { display: inline-block; margin: 10px; padding: 10px; background: #f5f5f5; }
            .metric-value { font-size: 24px; font-weight: bold; }
            .metric-label { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.getReportTitle(type)}</h1>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
            <!-- Report content goes here -->
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate PDF report
   */
  private async generatePdfReport(report: any, type: ReportType): Promise<Buffer> {
    // Generate PDF using library like puppeteer or pdfkit
    return Buffer.from('');
  }

  /**
   * Get default email subject
   */
  private getDefaultSubject(type: ReportType): string {
    const date = new Date().toLocaleDateString();
    switch (type) {
      case ReportType.DAILY_BRIEF:
        return `SEO Daily Brief - ${date}`;
      case ReportType.WEEKLY_REPORT:
        return `SEO Weekly Report - ${date}`;
      case ReportType.MONTHLY_REPORT:
        return `SEO Monthly Report - ${date}`;
      case ReportType.EXECUTIVE_DASHBOARD:
        return `SEO Executive Dashboard - ${date}`;
      default:
        return `SEO Report - ${date}`;
    }
  }

  /**
   * Get report title
   */
  private getReportTitle(type: ReportType): string {
    switch (type) {
      case ReportType.DAILY_BRIEF:
        return 'Daily SEO Brief';
      case ReportType.WEEKLY_REPORT:
        return 'Weekly SEO Report';
      case ReportType.MONTHLY_REPORT:
        return 'Monthly SEO Report';
      case ReportType.EXECUTIVE_DASHBOARD:
        return 'Executive Dashboard';
      default:
        return 'SEO Report';
    }
  }
}

/**
 * Export singleton instance
 */
export const reportGenerator = new ReportGenerator();
