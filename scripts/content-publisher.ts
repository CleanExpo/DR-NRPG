/**
 * Content Publisher CLI Tool
 * Main interface for generating, validating, scheduling, and publishing articles
 *
 * Usage:
 *   npx ts-node scripts/content-publisher.ts --action generate --template service-pillar --service "Water Damage"
 *   npx ts-node scripts/content-publisher.ts --action batch --file data/content/month-1-articles.json
 *   npx ts-node scripts/content-publisher.ts --action verify --id article-123
 *   npx ts-node scripts/content-publisher.ts --action schedule --id article-123 --date "2026-02-01"
 *   npx ts-node scripts/content-publisher.ts --action publish --id article-123
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { prisma } from '../lib/db/prisma';
import { generateArticle, generateBatch, generateSlug } from '../lib/content/ai-content-generator';
import { validateArticle, generateValidationReport } from '../lib/content/quality-validator';
import { GeneratedArticle, TemplateInput } from '../lib/content/templates/types';

type Action = 'generate' | 'batch' | 'verify' | 'schedule' | 'publish' | 'list';

interface CLIOptions {
  action: Action;
  template?: 'service-pillar' | 'emergency-guide' | 'city-service' | 'faq';
  service?: string;
  city?: string;
  file?: string;
  id?: string;
  date?: string;
  status?: string;
  limit?: number;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: Partial<CLIOptions> = { action: 'generate' };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1]?.startsWith('--') ? undefined : args[i + 1];

      switch (key) {
        case 'action':
          options.action = value as Action;
          i++;
          break;
        case 'template':
          options.template = value as any;
          i++;
          break;
        case 'service':
          options.service = value;
          i++;
          break;
        case 'city':
          options.city = value;
          i++;
          break;
        case 'file':
          options.file = value;
          i++;
          break;
        case 'id':
          options.id = value;
          i++;
          break;
        case 'date':
          options.date = value;
          i++;
          break;
        case 'status':
          options.status = value;
          i++;
          break;
        case 'limit':
          options.limit = parseInt(value || '10');
          i++;
          break;
      }
    }
  }

  return options as CLIOptions;
}

/**
 * Generate single article
 */
async function handleGenerate(options: CLIOptions) {
  if (!options.service && !options.city) {
    console.error('Error: --service or --city required');
    process.exit(1);
  }

  const template = options.template || 'service-pillar';

  console.log(`\n📝 Generating ${template} article...`);
  console.log(`Service: ${options.service || options.city}\n`);

  const input: TemplateInput = {
    serviceName: options.service,
    cityName: options.city,
    tone: 'professional',
    targetAudience: 'mixed',
    authorName: 'Phil McGurk',
    authorCredentials: [
      'Senior water damage restorer',
      'Senior fire and smoke restorer',
      '15+ years disaster recovery experience',
      'Founder of NRPG network (500+ contractors)'
    ],
    includePricing: true
  };

  try {
    const article = await generateArticle(input, template);

    // Validate article
    const validation = validateArticle(article);

    // Display summary
    console.log('✅ Article Generated Successfully\n');
    console.log(`Title: ${article.title}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`Word Count: ${article.wordCount}`);
    console.log(`Read Time: ${article.estimatedReadTime} min`);
    console.log(`Quality Score: ${validation.qualityScore}/100\n`);

    // Display validation report
    console.log(generateValidationReport(validation));

    // Save to draft
    console.log('\n💾 Saving to database as DRAFT...');

    const dbArticle = await prisma.blogPost.create({
      data: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        htmlContent: article.htmlContent || '',
        status: 'DRAFT',
        metaTitle: article.seo.title,
        metaDescription: article.seo.metaDescription,
        keywords: article.seo.keywords.join(','),
        viewCount: 0,
        authorId: undefined // Will be set by author assignment
      }
    });

    console.log(`✅ Saved with ID: ${dbArticle.id}\n`);
    console.log('Next steps:');
    console.log(`1. Review content: npx ts-node scripts/content-publisher.ts --action verify --id ${dbArticle.id}`);
    console.log(`2. Schedule: npx ts-node scripts/content-publisher.ts --action schedule --id ${dbArticle.id} --date "2026-02-01"`);
    console.log(`3. Publish: npx ts-node scripts/content-publisher.ts --action publish --id ${dbArticle.id}`);
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

/**
 * Generate batch articles
 */
async function handleBatch(options: CLIOptions) {
  if (!options.file) {
    console.error('Error: --file required');
    process.exit(1);
  }

  try {
    const fileContent = await fs.readFile(options.file, 'utf-8');
    const inputs: TemplateInput[] = JSON.parse(fileContent);

    console.log(`\n📚 Generating ${inputs.length} articles in batch mode...\n`);

    const startTime = Date.now();

    const template = options.template || 'service-pillar';
    const results = await generateBatch(inputs, template);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Batch generation complete\n`);
    console.log(`Generated: ${results.articles.length}/${inputs.length}`);
    console.log(`Failed: ${results.errors.length}`);
    console.log(`Duration: ${duration}s\n`);

    // Save all articles
    console.log('💾 Saving articles to database...');

    for (const article of results.articles) {
      const validation = validateArticle(article);

      await prisma.blogPost.create({
        data: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          htmlContent: article.htmlContent || '',
          status: 'DRAFT',
          metaTitle: article.seo.title,
          metaDescription: article.seo.metaDescription,
          keywords: article.seo.keywords.join(','),
          viewCount: 0
        }
      });

      const statusIcon = validation.qualityScore >= 80 ? '✅' : '⚠️';
      console.log(`${statusIcon} ${article.title} (Score: ${validation.qualityScore}/100)`);
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:\n');
      results.errors.forEach(err => {
        console.log(`- ${err.input.serviceName || err.input.cityName}: ${err.error}`);
      });
    }

    console.log(`\n✅ All ${results.articles.length} articles saved as DRAFT`);
  } catch (error) {
    console.error('❌ Batch generation failed:', error);
    process.exit(1);
  }
}

/**
 * Verify article quality
 */
async function handleVerify(options: CLIOptions) {
  if (!options.id) {
    console.error('Error: --id required');
    process.exit(1);
  }

  try {
    const article = await prisma.blogPost.findUnique({
      where: { id: options.id }
    });

    if (!article) {
      console.error(`Article not found: ${options.id}`);
      process.exit(1);
    }

    // Create GeneratedArticle format for validation
    const generatedArticle: GeneratedArticle = {
      title: article.title,
      slug: article.slug,
      templateType: 'service-pillar',
      content: article.content,
      sections: [],
      faqs: [],
      wordCount: article.content.split(/\s+/).length,
      estimatedReadTime: Math.ceil(article.content.split(/\s+/).length / 200),
      seo: {
        title: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords.split(',').filter(Boolean),
        primaryKeyword: article.keywords.split(',')[0] || '',
        secondaryKeywords: article.keywords.split(',').slice(1),
        slug: article.slug,
        internalLinks: [],
        schema: { type: 'Article' }
      },
      authorName: 'Phil McGurk',
      status: article.status as any
    };

    const validation = validateArticle(generatedArticle);

    console.log(`\n📋 Verification Report: ${article.title}\n`);
    console.log(generateValidationReport(validation));

    if (!validation.passed) {
      console.log('\n⚠️  Article needs revision before publishing');
    } else {
      console.log('\n✅ Article ready for scheduling');
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

/**
 * Schedule article for publishing
 */
async function handleSchedule(options: CLIOptions) {
  if (!options.id || !options.date) {
    console.error('Error: --id and --date required');
    process.exit(1);
  }

  try {
    const scheduledFor = new Date(options.date);

    if (isNaN(scheduledFor.getTime())) {
      console.error(`Invalid date format: ${options.date}`);
      process.exit(1);
    }

    const article = await prisma.blogPost.update({
      where: { id: options.id },
      data: {
        status: 'SCHEDULED',
        scheduledFor
      }
    });

    console.log(`\n✅ Article Scheduled\n`);
    console.log(`Title: ${article.title}`);
    console.log(`Status: SCHEDULED`);
    console.log(`Publish Date: ${scheduledFor.toISOString()}`);
  } catch (error) {
    console.error('❌ Scheduling failed:', error);
    process.exit(1);
  }
}

/**
 * Publish article immediately
 */
async function handlePublish(options: CLIOptions) {
  if (!options.id) {
    console.error('Error: --id required');
    process.exit(1);
  }

  try {
    const article = await prisma.blogPost.update({
      where: { id: options.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    console.log(`\n✅ Article Published\n`);
    console.log(`Title: ${article.title}`);
    console.log(`URL: https://disasterrecovery.com.au${article.slug}`);
    console.log(`Published: ${article.publishedAt?.toISOString()}`);
  } catch (error) {
    console.error('❌ Publishing failed:', error);
    process.exit(1);
  }
}

/**
 * List articles by status
 */
async function handleList(options: CLIOptions) {
  try {
    const status = options.status || 'DRAFT';
    const limit = options.limit || 10;

    const articles = await prisma.blogPost.findMany({
      where: { status: status as any },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📚 Articles (${status}): ${articles.length}\n`);

    articles.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Words: ${article.content.split(/\s+/).length}`);
      console.log(`   Created: ${article.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ List failed:', error);
    process.exit(1);
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const options = parseArgs();

  console.log('\n🚀 NRPG Content Publisher CLI\n');

  switch (options.action) {
    case 'generate':
      await handleGenerate(options);
      break;
    case 'batch':
      await handleBatch(options);
      break;
    case 'verify':
      await handleVerify(options);
      break;
    case 'schedule':
      await handleSchedule(options);
      break;
    case 'publish':
      await handlePublish(options);
      break;
    case 'list':
      await handleList(options);
      break;
    default:
      console.error(`Unknown action: ${options.action}`);
      process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
