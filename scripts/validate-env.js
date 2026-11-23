#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 *
 * Validates that all required environment variables are set and have valid formats.
 * Run this script before deployment to catch configuration issues early.
 *
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate:env
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Environment variable definitions
const envVars = {
  // Core - Always required
  core: {
    required: true,
    vars: {
      DATABASE_URL: {
        required: true,
        pattern: /^postgresql:\/\/.+/,
        description: 'PostgreSQL connection string',
      },
      NEXTAUTH_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'NextAuth base URL',
      },
      NEXTAUTH_SECRET: {
        required: true,
        minLength: 32,
        description: 'NextAuth secret for session encryption',
      },
      NEXT_PUBLIC_SITE_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Public site URL',
      },
    },
  },

  // Database
  database: {
    required: false,
    vars: {
      DIRECT_URL: {
        required: false,
        pattern: /^postgresql:\/\/.+/,
        description: 'Direct database URL (for migrations)',
      },
    },
  },

  // Authentication
  auth: {
    required: false,
    vars: {
      JWT_SECRET: {
        required: false,
        minLength: 32,
        description: 'JWT secret for token signing',
      },
      GITHUB_ID: {
        required: false,
        description: 'GitHub OAuth Client ID',
      },
      GITHUB_SECRET: {
        required: false,
        minLength: 20,
        description: 'GitHub OAuth Client Secret',
      },
      GOOGLE_ID: {
        required: false,
        pattern: /\.apps\.googleusercontent\.com$/,
        description: 'Google OAuth Client ID',
      },
      GOOGLE_SECRET: {
        required: false,
        minLength: 20,
        description: 'Google OAuth Client Secret',
      },
    },
  },

  // Payments (Stripe)
  payments: {
    required: false,
    vars: {
      STRIPE_SECRET_KEY: {
        required: false,
        pattern: /^sk_(test|live)_/,
        description: 'Stripe secret key',
        warning: 'Ensure you are using the correct environment (test vs live)',
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        required: false,
        pattern: /^pk_(test|live)_/,
        description: 'Stripe publishable key',
      },
      STRIPE_WEBHOOK_SECRET: {
        required: false,
        pattern: /^whsec_/,
        description: 'Stripe webhook signing secret',
      },
    },
  },

  // Email
  email: {
    required: false,
    vars: {
      EMAIL_FROM: {
        required: false,
        pattern: /^.+@.+\..+$/,
        description: 'From email address',
      },
      SENDGRID_API_KEY: {
        required: false,
        pattern: /^SG\./,
        description: 'SendGrid API key',
      },
    },
  },

  // CMS (Sanity)
  cms: {
    required: false,
    vars: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: {
        required: false,
        description: 'Sanity project ID',
      },
      NEXT_PUBLIC_SANITY_DATASET: {
        required: false,
        description: 'Sanity dataset name',
      },
      SANITY_API_TOKEN: {
        required: false,
        pattern: /^sk/,
        description: 'Sanity API token',
      },
    },
  },

  // Search (Algolia)
  search: {
    required: false,
    vars: {
      NEXT_PUBLIC_ALGOLIA_APP_ID: {
        required: false,
        description: 'Algolia application ID',
      },
      NEXT_PUBLIC_ALGOLIA_API_KEY: {
        required: false,
        description: 'Algolia search API key',
      },
      ALGOLIA_ADMIN_API_KEY: {
        required: false,
        description: 'Algolia admin API key',
      },
    },
  },

  // Security
  security: {
    required: false,
    vars: {
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: {
        required: false,
        description: 'hCaptcha site key',
      },
      HCAPTCHA_SECRET: {
        required: false,
        pattern: /^0x/,
        description: 'hCaptcha secret key (canonical name; HCAPTCHA_SECRET_KEY is read only as a deprecated fallback)',
      },
    },
  },

  // Analytics
  analytics: {
    required: false,
    vars: {
      NEXT_PUBLIC_GA4_ID: {
        required: false,
        pattern: /^G-/,
        description: 'Google Analytics 4 measurement ID',
      },
    },
  },

  // Redis
  redis: {
    required: false,
    vars: {
      REDIS_URL: {
        required: false,
        pattern: /^redis:\/\//,
        description: 'Redis connection URL',
      },
    },
  },

  // AI
  ai: {
    required: false,
    vars: {
      GEMINI_API_KEY: {
        required: false,
        description: 'Google Gemini API key',
      },
      OPENAI_API_KEY: {
        required: false,
        pattern: /^sk-/,
        description: 'OpenAI API key',
      },
    },
  },
};

/**
 * Load environment variables from .env.local
 */
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log(`${colors.yellow}⚠ Warning: .env.local not found${colors.reset}`);
    console.log(`${colors.cyan}Using environment variables from system${colors.reset}\n`);
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes

      // Only set if not already in environment
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

/**
 * Validate a single environment variable
 */
function validateVar(name, config) {
  const value = process.env[name];
  const errors = [];
  const warnings = [];

  // Check if required variable is missing
  if (config.required && !value) {
    errors.push(`Missing required variable: ${name}`);
    return { errors, warnings, valid: false };
  }

  // If variable is not set and not required, skip validation
  if (!value) {
    return { errors, warnings, valid: true };
  }

  // Validate pattern
  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`Invalid format for ${name}`);
  }

  // Validate minimum length
  if (config.minLength && value.length < config.minLength) {
    errors.push(`${name} must be at least ${config.minLength} characters`);
  }

  // Check for common issues
  if (value === 'your-secret-here' || value.includes('your_') || value.includes('change-in-production')) {
    warnings.push(`${name} appears to be a placeholder value`);
  }

  // Add custom warnings
  if (config.warning && value) {
    warnings.push(`${name}: ${config.warning}`);
  }

  return {
    errors,
    warnings,
    valid: errors.length === 0,
  };
}

/**
 * Validate all environment variables
 */
function validateAll() {
  console.log(`${colors.cyan}🔍 Validating Environment Variables${colors.reset}\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let categoriesChecked = 0;

  Object.entries(envVars).forEach(([category, config]) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    console.log(`${colors.blue}━━━ ${categoryName} ━━━${colors.reset}`);

    let categoryErrors = 0;
    let categoryWarnings = 0;

    Object.entries(config.vars).forEach(([name, varConfig]) => {
      const result = validateVar(name, varConfig);

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`${colors.red}✗ ${error}${colors.reset}`);
          categoryErrors++;
        });
      } else if (process.env[name]) {
        console.log(`${colors.green}✓ ${name}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}○ ${name} (optional, not set)${colors.reset}`);
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`  ${colors.yellow}⚠ ${warning}${colors.reset}`);
          categoryWarnings++;
        });
      }
    });

    totalErrors += categoryErrors;
    totalWarnings += categoryWarnings;
    categoriesChecked++;

    console.log(); // Empty line between categories
  });

  // Summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`Categories checked: ${categoriesChecked}`);
  console.log(`Errors: ${totalErrors > 0 ? colors.red : colors.green}${totalErrors}${colors.reset}`);
  console.log(`Warnings: ${totalWarnings > 0 ? colors.yellow : colors.green}${totalWarnings}${colors.reset}`);

  // Environment detection
  const env = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV;
  console.log(`\nEnvironment: ${colors.cyan}${vercelEnv || env}${colors.reset}`);

  // Final result
  if (totalErrors > 0) {
    console.log(`\n${colors.red}❌ Validation failed with ${totalErrors} error(s)${colors.reset}`);
    console.log(`${colors.yellow}Please fix the errors above before deploying${colors.reset}\n`);
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`\n${colors.yellow}⚠ Validation passed with ${totalWarnings} warning(s)${colors.reset}`);
    console.log(`${colors.yellow}Review warnings above - they may indicate configuration issues${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ All environment variables validated successfully!${colors.reset}\n`);
    process.exit(0);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
${colors.cyan}Environment Variables Validation Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/validate-env.js
  npm run validate:env

${colors.yellow}Description:${colors.reset}
  Validates that all required environment variables are set and properly formatted.
  Checks .env.local file and system environment variables.

${colors.yellow}Exit Codes:${colors.reset}
  0 - All validations passed
  1 - Validation errors found

${colors.yellow}Examples:${colors.reset}
  # Validate before deployment
  npm run validate:env && npm run build

  # Run in CI/CD pipeline
  node scripts/validate-env.js

${colors.yellow}Documentation:${colors.reset}
  See docs/ENV_QUICK_START.md for setup instructions
  See docs/VERCEL_ENV_SETUP.md for deployment configuration
`);
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  displayHelp();
} else {
  loadEnvFile();
  validateAll();
}
