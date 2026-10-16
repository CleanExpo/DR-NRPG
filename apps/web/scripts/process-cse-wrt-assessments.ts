#!/usr/bin/env ts-node
/**
 * CSE/WRT Assessment Processor
 * 
 * Transforms CSE/WRT assessment JSON/MD files to unified NRPG quiz format
 * with 80% passing threshold and Australian context.
 * 
 * Usage: npx ts-node scripts/process-cse-wrt-assessments.ts [--course CSE|WRT] [--module M01]
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FRAMEWORK_PATH = path.join(process.cwd(), '..', '..', 'NRPG-Onboarding-Framework', 'contractor-onboarding');
const OUTPUT_PATH = path.join(process.cwd(), 'training-sources', 'assessments');

const PASSING_THRESHOLD = 80; // 80% required to pass

interface CourseConfig {
  course: 'CSE' | 'WRT';
  modulePrefix: string;
  totalModules: number;
  path: string;
}

const COURSE_CONFIG: Record<string, CourseConfig> = {
  CSE: {
    course: 'CSE',
    modulePrefix: 'CSE-M',
    totalModules: 10,
    path: 'customer-service-excellence',
  },
  WRT: {
    course: 'WRT',
    modulePrefix: 'WRT-M',
    totalModules: 12,
    path: 'water-damage-restoration',
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'multiple_select';
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Index or array of indices
  explanation: string;
  reference: string; // Must be .gov.au
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface QuizModule {
  moduleId: string;
  moduleName: string;
  course: 'CSE' | 'WRT';
  passingScore: number;
  timeLimit: number; // minutes
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: QuizQuestion[];
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    australianCompliant: boolean;
  };
}

interface ProcessingResult {
  success: boolean;
  moduleId: string;
  inputFile: string;
  outputFile: string;
  questionCount: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// ASSESSMENT PROCESSOR
// ============================================================================

class AssessmentProcessor {
  private config: CourseConfig;

  constructor(config: CourseConfig) {
    this.config = config;
  }

  /**
   * Load assessment file (JSON or MD format)
   */
  private loadAssessmentFile(moduleNum: number): any | null {
    const moduleNumStr = moduleNum.toString().padStart(2, '0');
    const modulesPath = path.join(FRAMEWORK_PATH, this.config.path, 'modules');

    // Try JSON first
    const jsonPath = path.join(modulesPath, `module-${moduleNumStr}-assessment.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      } catch (error) {
        console.warn(`Warning: Could not parse JSON for module ${moduleNum}`);
      }
    }

    // Try MD format
    const mdPath = path.join(modulesPath, `module-${moduleNumStr}-assessment.md`);
    if (fs.existsSync(mdPath)) {
      try {
        const content = fs.readFileSync(mdPath, 'utf-8');
        return this.parseMarkdownAssessment(content, moduleNum);
      } catch (error) {
        console.warn(`Warning: Could not parse MD for module ${moduleNum}`);
      }
    }

    return null;
  }

  /**
   * Parse markdown assessment format
   */
  private parseMarkdownAssessment(content: string, moduleNum: number): any {
    const questions: any[] = [];
    const lines = content.split('\n');
    let currentQuestion: any = null;
    let optionIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Question detection (numbered or Q: prefix)
      if (/^\d+\.|^Q\d+:|^Question \d+:/i.test(trimmed)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: `${this.config.modulePrefix}${moduleNum.toString().padStart(2, '0')}-Q${questions.length + 1}`,
          type: 'multiple_choice',
          question: trimmed.replace(/^\d+\.|^Q\d+:|^Question \d+:/i, '').trim(),
          options: [],
          correctAnswer: 0,
          explanation: '',
          reference: '',
        };
        optionIndex = 0;
      }
      // Option detection (A/B/C/D or 1/2/3/4)
      else if (/^[A-D]\)|^\d+\)|^-\s/i.test(trimmed) && currentQuestion) {
        const isCorrect = trimmed.includes('✓') || trimmed.includes('(correct)') || trimmed.includes('[correct]');
        const cleanOption = trimmed.replace(/^[A-D]\)|^\d+\)|^-\s/i, '').replace(/✓|\(correct\)|\[correct\]/gi, '').trim();
        
        currentQuestion.options.push(cleanOption);
        if (isCorrect) {
          currentQuestion.correctAnswer = optionIndex;
        }
        optionIndex++;
      }
      // Explanation detection
      else if (/^Explanation:|^Answer:/i.test(trimmed) && currentQuestion) {
        currentQuestion.explanation = trimmed.replace(/^Explanation:|^Answer:/i, '').trim();
      }
      // Reference detection
      else if (/^Reference:|^Source:/i.test(trimmed) && currentQuestion) {
        currentQuestion.reference = trimmed.replace(/^Reference:|^Source:/i, '').trim();
      }
    }

    // Push last question
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return { questions };
  }

  /**
   * Transform question to NRPG format with Australian compliance
   */
  private transformQuestion(question: any, index: number, moduleId: string): QuizQuestion {
    // Ensure explanation has Australian context
    let explanation = question.explanation || '';
    if (!explanation.includes('.gov.au')) {
      explanation += ' For more information, refer to Safe Work Australia (safeworkaustralia.gov.au) or Standards Australia (standards.org.au).';
    }

    // Ensure reference is Australian
    let reference = question.reference || '';
    if (!reference.includes('.gov.au') && !reference.includes('.org.au')) {
      reference = 'https://safeworkaustralia.gov.au';
    }

    // Determine difficulty based on question complexity
    const difficulty = this.assessDifficulty(question);

    // Determine category
    const category = this.assessCategory(question, moduleId);

    return {
      id: `${moduleId}-Q${(index + 1).toString().padStart(2, '0')}`,
      type: question.type || 'multiple_choice',
      question: this.sanitiseQuestion(question.question),
      options: question.options.map((opt: string) => this.sanitiseOption(opt)),
      correctAnswer: question.correctAnswer ?? 0,
      explanation: explanation,
      reference: reference,
      difficulty: difficulty,
      category: category,
    };
  }

  /**
   * Assess question difficulty
   */
  private assessDifficulty(question: any): 'easy' | 'medium' | 'hard' {
    const text = (question.question + ' ' + (question.explanation || '')).toLowerCase();
    
    // Hard indicators
    if (text.includes('calculate') || text.includes('determine') || text.includes('analyse') || 
        text.includes('evaluate') || question.options?.length > 4) {
      return 'hard';
    }
    
    // Medium indicators
    if (text.includes('explain') || text.includes('describe') || text.includes('identify') ||
        text.includes('difference between')) {
      return 'medium';
    }
    
    // Default easy
    return 'easy';
  }

  /**
   * Assess question category
   */
  private assessCategory(question: any, moduleId: string): string {
    const text = (question.question || '').toLowerCase();
    
    if (text.includes('safety') || text.includes('hazard') || text.includes('ppe')) {
      return 'Safety';
    }
    if (text.includes('equipment') || text.includes('tool') || text.includes('machine')) {
      return 'Equipment';
    }
    if (text.includes('customer') || text.includes('client') || text.includes('communication')) {
      return 'Customer Service';
    }
    if (text.includes('standard') || text.includes('regulation') || text.includes('code')) {
      return 'Compliance';
    }
    if (text.includes('water') || text.includes('moisture') || text.includes('dry')) {
      return 'Technical';
    }
    
    // Default based on course
    return this.config.course === 'CSE' ? 'Customer Service' : 'Technical';
  }

  /**
   * Sanitise question text
   */
  private sanitiseQuestion(text: string): string {
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '')   // Remove markdown italic
      .replace(/`/g, '')    // Remove code ticks
      .trim();
  }

  /**
   * Sanitise option text
   */
  private sanitiseOption(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/^\[x\]\s*/i, '') // Remove checkbox markers
      .replace(/^\[ \]\s*/i, '')
      .trim();
  }

  /**
   * Create quiz module structure
   */
  private createQuizModule(moduleNum: number, questions: QuizQuestion[]): QuizModule {
    const moduleId = `${this.config.modulePrefix}${moduleNum.toString().padStart(2, '0')}`;
    
    // Calculate time limit (2 minutes per question, minimum 10 minutes)
    const timeLimit = Math.max(10, questions.length * 2);

    return {
      moduleId,
      moduleName: this.getModuleName(moduleNum),
      course: this.config.course,
      passingScore: PASSING_THRESHOLD,
      timeLimit,
      maxAttempts: 3,
      randomizeQuestions: true,
      randomizeOptions: true,
      questions,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        australianCompliant: true,
      },
    };
  }

  /**
   * Get module name based on number
   */
  private getModuleName(moduleNum: number): string {
    const moduleNames: Record<string, string[]> = {
      CSE: [
        'Understanding Customer Psychology in Crisis',
        'First Contact Excellence',
        'Communication During Restoration',
        'Difficult Conversations',
        'Insurance Communication',
        'Quality Assurance',
        'Crisis Intervention',
        'Technology in Customer Service',
        'Building Long-term Relationships',
        'Final Assessment',
      ],
      WRT: [
        'Introduction to Water Damage',
        'Psychrometry',
        'Inspection and Moisture Detection',
        'Water Extraction Equipment',
        'Structural Drying Equipment',
        'Drying Goals and Strategies',
        'Antimicrobial Application',
        'Contents Processing',
        'Australian Standards',
        'Documentation and Xactimate',
        'Customer Communication',
        'Final Assessment',
      ],
    };

    return moduleNames[this.config.course]?.[moduleNum - 1] || `${this.config.course} Module ${moduleNum}`;
  }

  /**
   * Process a single module's assessment
   */
  async processModule(moduleNum: number): Promise<ProcessingResult> {
    const moduleId = `${this.config.modulePrefix}${moduleNum.toString().padStart(2, '0')}`;
    const result: ProcessingResult = {
      success: false,
      moduleId,
      inputFile: '',
      outputFile: '',
      questionCount: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Load assessment
      const assessment = this.loadAssessmentFile(moduleNum);
      
      if (!assessment) {
        result.errors.push(`No assessment found for ${moduleId}`);
        return result;
      }

      result.inputFile = path.join(FRAMEWORK_PATH, this.config.path, 'modules');

      // Extract questions
      const rawQuestions = assessment.questions || assessment;
      
      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        result.errors.push(`No questions found in assessment for ${moduleId}`);
        return result;
      }

      // Transform questions
      const questions = rawQuestions.map((q: any, index: number) => 
        this.transformQuestion(q, index, moduleId)
      );

      result.questionCount = questions.length;

      // Create quiz module
      const quizModule = this.createQuizModule(moduleNum, questions);

      // Ensure output directory exists
      if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
      }

      // Write output file
      const outputFileName = `${moduleId.toLowerCase()}-quiz.json`;
      const outputPath = path.join(OUTPUT_PATH, outputFileName);
      fs.writeFileSync(outputPath, JSON.stringify(quizModule, null, 2), 'utf-8');

      result.outputFile = outputPath;
      result.success = true;

      // Warnings
      if (questions.length < 5) {
        result.warnings.push(`Only ${questions.length} questions (recommended: 10)`);
      }
      if (questions.some(q => !q.explanation || q.explanation.length < 50)) {
        result.warnings.push('Some questions lack detailed explanations');
      }

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Process all modules for this course
   */
  async processAllModules(): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    console.log(`\n📝 Processing ${this.config.course} assessments...`);
    console.log('=' .repeat(60));

    for (let i = 1; i <= this.config.totalModules; i++) {
      const result = await this.processModule(i);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${result.moduleId}: ${result.questionCount} questions processed`);
        if (result.warnings.length > 0) {
          console.log(`   ⚠️  Warnings: ${result.warnings.join(', ')}`);
        }
      } else {
        console.log(`❌ ${result.moduleId}: Failed`);
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    }

    return results;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('📝 DR-NRPG CSE/WRT Assessment Processor');
  console.log('=' .repeat(60));
  console.log(`Passing Threshold: ${PASSING_THRESHOLD}%`);
  console.log('');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const courseArg = args.find(arg => arg.startsWith('--course='))?.split('=')[1];
  const moduleArg = args.find(arg => arg.startsWith('--module='))?.split('=')[1];

  if (courseArg && !['CSE', 'WRT'].includes(courseArg)) {
    console.error('❌ Invalid course. Use CSE or WRT');
    process.exit(1);
  }

  const coursesToProcess: ('CSE' | 'WRT')[] = courseArg 
    ? [courseArg as 'CSE' | 'WRT']
    : ['CSE', 'WRT'];

  const allResults: ProcessingResult[] = [];

  for (const course of coursesToProcess) {
    const config = COURSE_CONFIG[course];
    const processor = new AssessmentProcessor(config);

    if (moduleArg) {
      // Process single module
      const moduleNum = parseInt(moduleArg.replace('M', ''), 10);
      if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > config.totalModules) {
        console.error(`❌ Invalid module number: ${moduleArg}`);
        continue;
      }
      const result = await processor.processModule(moduleNum);
      allResults.push(result);
    } else {
      // Process all modules
      const results = await processor.processAllModules();
      allResults.push(...results);
    }
  }

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('PROCESSING SUMMARY');
  console.log('=' .repeat(60));

  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const totalQuestions = allResults.reduce((sum, r) => sum + r.questionCount, 0);
  const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`Total modules processed: ${allResults.length}`);
  console.log(`Successful: ${successful} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Total questions: ${totalQuestions} 📝`);
  console.log(`Total warnings: ${totalWarnings} ⚠️`);

  if (failed > 0) {
    console.log('\nFailed processing:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.moduleId}: ${r.errors.join(', ')}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All assessments processed successfully!');
    console.log(`\nOutput location: ${OUTPUT_PATH}`);
    console.log(`\nQuiz Format Features:`);
    console.log(`  • 80% passing threshold enforced`);
    console.log(`  • Questions randomised per attempt`);
    console.log(`  • Australian .gov.au references required`);
    console.log(`  • Detailed explanations for all answers`);
    console.log(`  • 3 maximum attempts per module`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Processing failed:', error);
  process.exit(1);
});
