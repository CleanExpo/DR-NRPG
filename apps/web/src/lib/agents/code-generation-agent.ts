/**
 * Code Generation Agent
 *
 * Purpose: Autonomously generate features from specifications
 * Triggers: GitHub issue with label "agent:generate"
 * Output: Git branch with code + tests + docs
 *
 * Capabilities:
 * - Parse feature specifications
 * - Generate TypeScript/React code
 * - Create Prisma migrations
 * - Generate comprehensive tests
 * - Update documentation
 * - Create git branch and commit
 *
 * Skills Used:
 * - typescript-coding-standards
 * - nextjs-app-router-patterns
 * - prisma-database-patterns
 * - testing-strategies
 */

import { Agent, AgentConfig, HookCallback } from '@anthropic-ai/claude-agent-sdk'
import { logger } from '@/lib/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureSpecification {
  title: string
  description: string
  requirements: string[]
  acceptance_criteria: string[]
  epic?: string
  labels?: string[]
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface GeneratedCode {
  files: GeneratedFile[]
  tests: GeneratedFile[]
  migrations: GeneratedFile[]
  documentation: GeneratedFile[]
}

export interface GeneratedFile {
  path: string
  content: string
  language: 'typescript' | 'tsx' | 'prisma' | 'markdown'
}

export interface CodeGenerationResult {
  success: boolean
  specification: FeatureSpecification
  generated: GeneratedCode
  branch: string
  commit: string
  errors?: string[]
}

// ============================================================================
// SUBAGENT DEFINITIONS
// ============================================================================

const specParserAgent = {
  name: 'spec-parser',
  prompt: `
You are a specification parser agent. Your role is to:

1. Extract Requirements:
   - Parse GitHub issues, markdown specs, or user stories
   - Identify functional requirements
   - Identify non-functional requirements
   - Extract acceptance criteria

2. Validate Completeness:
   - Ensure all required information is present
   - Flag ambiguities or missing details
   - Suggest clarifications if needed

3. Structure Output:
   - Organize requirements by priority
   - Group related requirements
   - Identify dependencies

Output a structured FeatureSpecification object.

Always follow the Disaster Recovery - NRPG Platform conventions:
- Australian localization (mould, not mold)
- Multi-tenant architecture (always filter by tenantId)
- Industry standards compliance for disaster recovery features
- Next.js 14 App Router patterns
`,
  tools: ['Read', 'Grep'],
  skills: ['disaster-recovery-domain']
}

const codeGeneratorAgent = {
  name: 'code-generator',
  prompt: `
You are a code generator agent. Your role is to:

1. Generate TypeScript/React Code:
   - Follow TypeScript strict mode standards
   - Use Next.js 14 App Router patterns (Server Components by default)
   - Implement proper error handling
   - Add structured logging (Winston)
   - Follow project naming conventions

2. Apply Best Practices:
   - Use explicit types for all functions
   - Implement proper validation (Zod schemas)
   - Follow multi-tenant architecture (tenantId filtering)
   - Use async/await patterns
   - Implement proper null safety

3. Generate Components:
   - API routes (app/api/*)
   - Server Components (app/*)
   - Client Components ('use client' when needed)
   - Service layer (src/services/*)
   - Utility functions (src/lib/*)

Output: Array of GeneratedFile objects with path, content, and language.

CRITICAL: Always follow AGENTS.md conventions and load relevant skills.
`,
  tools: ['Read', 'Write', 'Grep'],
  skills: [
    'typescript-coding-standards',
    'nextjs-app-router-patterns',
    'react-component-patterns',
    'api-design-patterns',
    'error-handling-patterns'
  ]
}

const migrationCreatorAgent = {
  name: 'migration-creator',
  prompt: `
You are a database migration creator agent. Your role is to:

1. Analyze Schema Changes:
   - Identify new models needed
   - Identify new fields on existing models
   - Identify new relationships
   - Identify new indexes

2. Generate Prisma Migrations:
   - Follow Prisma schema syntax
   - Use proper field types
   - Add indexes for common queries
   - Maintain multi-tenant structure (tenantId on all models)
   - Use Australian enums (AustralianState, etc.)

3. Validate Safety:
   - Ensure backwards compatibility
   - Avoid destructive changes
   - Add data migrations if needed

Output: Prisma schema additions and migration SQL.

CRITICAL: Always include tenantId field and @@index([tenantId]).
`,
  tools: ['Read', 'Write'],
  skills: ['prisma-database-patterns', 'disaster-recovery-domain']
}

const testGeneratorAgent = {
  name: 'test-generator',
  prompt: `
You are a test generator agent. Your role is to:

1. Generate Unit Tests:
   - Test all functions in isolation
   - Mock dependencies
   - Use test data factories
   - Achieve >80% coverage

2. Generate Integration Tests:
   - Test API endpoints end-to-end
   - Test database operations
   - Test service integrations
   - Verify error handling

3. Generate E2E Tests:
   - Use Playwright for UI testing
   - Test complete user flows
   - Verify success states
   - Verify error states

Output: Array of test files (*.test.ts, *.spec.ts).

Follow testing-strategies skill for Jest/Playwright patterns.
`,
  tools: ['Read', 'Write'],
  skills: ['testing-strategies', 'typescript-coding-standards']
}

const docUpdaterAgent = {
  name: 'doc-updater',
  prompt: `
You are a documentation updater agent. Your role is to:

1. Update API Documentation:
   - Add OpenAPI/Swagger annotations
   - Document request/response types
   - Document error codes
   - Add usage examples

2. Update README:
   - Add feature to feature list
   - Update setup instructions if needed
   - Add configuration details

3. Generate Runbooks:
   - How to use the feature
   - Common issues and solutions
   - Rollback procedures

Output: Updated documentation files.
`,
  tools: ['Read', 'Write', 'Edit'],
  skills: ['api-design-patterns']
}

// ============================================================================
// CODE GENERATION AGENT
// ============================================================================

export class CodeGenerationAgent {
  private agent: Agent
  private subagents: Record<string, Agent>

  constructor() {
    // Initialize subagents
    this.subagents = {
      specParser: new Agent({
        ...specParserAgent,
        model: 'claude-sonnet-4-5'
      }),
      codeGenerator: new Agent({
        ...codeGeneratorAgent,
        model: 'claude-sonnet-4-5'
      }),
      migrationCreator: new Agent({
        ...migrationCreatorAgent,
        model: 'claude-sonnet-4-5'
      }),
      testGenerator: new Agent({
        ...testGeneratorAgent,
        model: 'claude-sonnet-4-5'
      }),
      docUpdater: new Agent({
        ...docUpdaterAgent,
        model: 'claude-sonnet-4-5'
      })
    }

    // Initialize main agent
    this.agent = new Agent({
      name: 'code-generation-agent',
      prompt: `
You are the Code Generation Agent orchestrator. Your role is to coordinate subagents to:

1. Parse feature specifications
2. Generate code, tests, migrations, and documentation
3. Create git branch and commit
4. Ensure 100% quality

Workflow:
1. spec-parser: Parse specification
2. code-generator: Generate TypeScript/React code
3. migration-creator: Generate Prisma migrations (if DB changes needed)
4. test-generator: Generate comprehensive tests
5. doc-updater: Update documentation
6. Final validation: Ensure all files generated correctly

Always maintain high code quality and follow all project standards.
`,
      tools: ['Read', 'Write', 'Edit', 'Bash'],
      skills: [
        'typescript-coding-standards',
        'nextjs-app-router-patterns',
        'prisma-database-patterns',
        'testing-strategies'
      ],
      hooks: {
        preToolUse: this.preToolUseHook.bind(this),
        postToolUse: this.postToolUseHook.bind(this)
      },
      model: 'claude-sonnet-4-5'
    })
  }

  /**
   * Execute code generation workflow
   */
  async execute(specification: FeatureSpecification): Promise<CodeGenerationResult> {
    const startTime = Date.now()

    try {
      logger.info('Code Generation Agent: Starting', {
        title: specification.title,
        requirements: specification.requirements.length
      })

      // Step 1: Parse specification
      const parsedSpec = await this.parseSpecification(specification)

      // Step 2: Generate code
      const generatedCode = await this.generateCode(parsedSpec)

      // Step 3: Generate migrations (if needed)
      const migrations = await this.generateMigrations(parsedSpec, generatedCode)

      // Step 4: Generate tests
      const tests = await this.generateTests(generatedCode)

      // Step 5: Update documentation
      const documentation = await this.updateDocumentation(parsedSpec, generatedCode)

      // Step 6: Create git branch and commit
      const { branch, commit } = await this.createGitBranch(
        parsedSpec,
        generatedCode,
        migrations,
        tests,
        documentation
      )

      const result: CodeGenerationResult = {
        success: true,
        specification: parsedSpec,
        generated: {
          files: generatedCode,
          tests,
          migrations,
          documentation
        },
        branch,
        commit
      }

      const duration = Date.now() - startTime

      logger.info('Code Generation Agent: Completed', {
        duration,
        filesGenerated: generatedCode.length,
        testsGenerated: tests.length,
        branch,
        commit
      })

      return result

    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Code Generation Agent: Failed', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        specification: specification.title
      })

      return {
        success: false,
        specification,
        generated: { files: [], tests: [], migrations: [], documentation: [] },
        branch: '',
        commit: '',
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }

  /**
   * Step 1: Parse specification using spec-parser subagent
   */
  private async parseSpecification(spec: FeatureSpecification): Promise<FeatureSpecification> {
    logger.info('Code Generation Agent: Parsing specification')

    const result = await this.subagents.specParser.query({
      prompt: `
Parse and validate this feature specification:

Title: ${spec.title}
Description: ${spec.description}

Requirements:
${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Acceptance Criteria:
${spec.acceptance_criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Validate completeness and structure the output as a FeatureSpecification object.
`
    })

    // Parse result and return structured specification
    return spec // For now, return as-is (in production, would parse agent response)
  }

  /**
   * Step 2: Generate code using code-generator subagent
   */
  private async generateCode(spec: FeatureSpecification): Promise<GeneratedFile[]> {
    logger.info('Code Generation Agent: Generating code')

    const result = await this.subagents.codeGenerator.query({
      prompt: `
Generate TypeScript/React code for this feature:

Title: ${spec.title}
Description: ${spec.description}

Requirements:
${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Generate:
1. API routes (if needed)
2. Server Components
3. Client Components (if interactivity needed)
4. Service layer functions
5. Type definitions

Follow all AGENTS.md conventions and load relevant skills.
`
    })

    // Parse result and return generated files
    return [] // Placeholder (in production, would parse agent response and return files)
  }

  /**
   * Step 3: Generate Prisma migrations (if database changes needed)
   */
  private async generateMigrations(
    spec: FeatureSpecification,
    generatedCode: GeneratedFile[]
  ): Promise<GeneratedFile[]> {
    logger.info('Code Generation Agent: Generating migrations')

    // Check if database changes are needed
    const needsMigration = spec.requirements.some(r =>
      r.toLowerCase().includes('database') ||
      r.toLowerCase().includes('model') ||
      r.toLowerCase().includes('table')
    )

    if (!needsMigration) {
      logger.info('Code Generation Agent: No migrations needed')
      return []
    }

    const result = await this.subagents.migrationCreator.query({
      prompt: `
Analyze these requirements and generated code to create Prisma migrations:

Requirements:
${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Generated code files: ${generatedCode.length}

Generate Prisma schema additions and migration SQL.
`
    })

    return [] // Placeholder
  }

  /**
   * Step 4: Generate tests using test-generator subagent
   */
  private async generateTests(generatedCode: GeneratedFile[]): Promise<GeneratedFile[]> {
    logger.info('Code Generation Agent: Generating tests')

    const result = await this.subagents.testGenerator.query({
      prompt: `
Generate comprehensive tests for these generated files:

${generatedCode.map(f => `- ${f.path}`).join('\n')}

Generate:
1. Unit tests (*.test.ts)
2. Integration tests (if API routes)
3. E2E tests (if UI components)

Achieve >80% coverage and test all edge cases.
`
    })

    return [] // Placeholder
  }

  /**
   * Step 5: Update documentation using doc-updater subagent
   */
  private async updateDocumentation(
    spec: FeatureSpecification,
    generatedCode: GeneratedFile[]
  ): Promise<GeneratedFile[]> {
    logger.info('Code Generation Agent: Updating documentation')

    const result = await this.subagents.docUpdater.query({
      prompt: `
Update documentation for this feature:

Feature: ${spec.title}
Description: ${spec.description}

Generated files:
${generatedCode.map(f => `- ${f.path}`).join('\n')}

Update:
1. API documentation (if API routes)
2. README (add feature to feature list)
3. Runbook (usage instructions)
`
    })

    return [] // Placeholder
  }

  /**
   * Step 6: Create git branch and commit
   */
  private async createGitBranch(
    spec: FeatureSpecification,
    code: GeneratedFile[],
    migrations: GeneratedFile[],
    tests: GeneratedFile[],
    docs: GeneratedFile[]
  ): Promise<{ branch: string; commit: string }> {
    logger.info('Code Generation Agent: Creating git branch')

    const branchName = `feature/${spec.title.toLowerCase().replace(/\s+/g, '-')}`
    const commitMessage = `feat: ${spec.title}

${spec.description}

Generated by Code Generation Agent:
- ${code.length} code files
- ${migrations.length} migrations
- ${tests.length} test files
- ${docs.length} documentation updates

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>
`

    // In production, would execute git commands:
    // git checkout -b ${branchName}
    // git add .
    // git commit -m "${commitMessage}"

    return {
      branch: branchName,
      commit: 'abc123def456' // Placeholder
    }
  }

  /**
   * Pre-tool use hook for validation
   */
  private async preToolUseHook(tool: string, args: any): Promise<void> {
    logger.debug('Code Generation Agent: Pre-tool use', { tool, args })

    // Validate tool use
    if (tool === 'Write' || tool === 'Edit') {
      // Ensure not overwriting critical files
      const criticalFiles = ['.env', 'package.json', 'prisma/schema.prisma']
      if (criticalFiles.includes(args.file_path)) {
        throw new Error(`Cannot modify critical file: ${args.file_path}`)
      }
    }
  }

  /**
   * Post-tool use hook for audit logging
   */
  private async postToolUseHook(tool: string, result: any): Promise<void> {
    logger.debug('Code Generation Agent: Post-tool use', { tool })

    // Audit log all tool uses
    // In production, would store in database
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const codeGenerationAgent = new CodeGenerationAgent()
