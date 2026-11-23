#!/usr/bin/env ts-node
/**
 * Training Module Index Generator
 * 
 * Generates a unified index of all 46 training modules (24 NRPG + 10 CSE + 12 WRT)
 * with certification pathway mappings and metadata.
 * 
 * Usage: npx ts-node scripts/generate-training-index.ts
 */

import * as fs from 'fs';
import * as path from 'path';
// DR-893: the generated index must carry the SAME threshold grading enforces.
import { NRPG_QUIZ_PASSING_SCORE } from '../lib/training/training-policy';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OUTPUT_PATH = path.join(process.cwd(), 'training-sources', 'generated');
const FRAMEWORK_PATH = path.join(process.cwd(), '..', '..', 'NRPG-Onboarding-Framework', 'contractor-onboarding');

// Module counts
const MODULE_COUNTS = {
  NRPG: 24,
  CSE: 10,
  WRT: 12,
};

// Certification requirements
const CERTIFICATION_PATHS = {
  BRONZE: {
    name: 'Bronze Certification',
    description: 'Entry-level certification for all contractors',
    modules: [
      'NRP-001', 'NRP-002', 'NRP-003',
      'NRP-021', 'NRP-022', 'NRP-023', 'NRP-024',
      'CSE-M01', 'CSE-M02',
    ],
    totalModules: 10,
    estimatedHours: 12,
  },
  SILVER: {
    name: 'Silver Certification',
    description: 'Professional certification with specialisation',
    modules: [
      // Bronze modules plus:
      'NRP-004', 'NRP-005',
      'CSE-M03', 'CSE-M04', 'CSE-M05',
      'WRT-M01', 'WRT-M02',
    ],
    totalModules: 17,
    estimatedHours: 28,
    prerequisites: ['BRONZE'],
  },
  GOLD: {
    name: 'Gold Certification',
    description: 'Master-level certification',
    modules: [
      // Silver modules plus:
      'NRP-006', 'NRP-007',
      'CSE-M06', 'CSE-M07', 'CSE-M08',
      'WRT-M03', 'WRT-M04', 'WRT-M05',
    ],
    totalModules: 24,
    estimatedHours: 48,
    prerequisites: ['SILVER'],
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface ModuleMetadata {
  moduleId: string;
  course: 'NRPG' | 'CSE' | 'WRT';
  moduleNumber: number;
  title: string;
  description: string;
  duration: string; // e.g., "45 min"
  durationMinutes: number;
  passingScore: number;
  cecCredits: number;
  prerequisites: string[];
  certificationLevel: ('BRONZE' | 'SILVER' | 'GOLD')[];
  hasAssessment: boolean;
  hasExercises: boolean;
  hasResources: boolean;
  sourcePath: string;
  assessmentPath: string | null;
  lastUpdated: string;
  version: string;
}

interface CourseInfo {
  courseId: 'NRPG' | 'CSE' | 'WRT';
  courseName: string;
  description: string;
  totalModules: number;
  totalHours: number;
  passingScore: number;
  modules: ModuleMetadata[];
}

interface TrainingIndex {
  generatedAt: string;
  version: string;
  totalModules: number;
  courses: CourseInfo[];
  certificationPaths: typeof CERTIFICATION_PATHS;
  metadata: {
    lastUpdated: string;
    schemaVersion: string;
    australianCompliant: boolean;
  };
}

// ============================================================================
// MODULE METADATA
// ============================================================================

const NRPG_MODULE_NAMES: Record<string, { title: string; description: string; duration: string; cecCredits: number }> = {
  'NRP-001': { title: 'Introduction to DR-NRPG', description: 'Platform overview and onboarding', duration: '30 min', cecCredits: 1 },
  'NRP-002': { title: 'Safety Fundamentals', description: 'Workplace health and safety basics', duration: '60 min', cecCredits: 2 },
  'NRP-003': { title: 'Equipment Basics', description: 'Introduction to restoration equipment', duration: '60 min', cecCredits: 2 },
  'NRP-004': { title: 'Advanced Safety', description: 'Complex safety scenarios', duration: '60 min', cecCredits: 2 },
  'NRP-005': { title: 'Equipment Mastery', description: 'Advanced equipment techniques', duration: '90 min', cecCredits: 3 },
  'NRP-006': { title: 'Project Management', description: 'Managing restoration projects', duration: '90 min', cecCredits: 3 },
  'NRP-007': { title: 'Quality Assurance', description: 'Quality control and standards', duration: '60 min', cecCredits: 2 },
  'NRP-021': { title: 'Platform Operations Guide', description: 'DR-NRPG platform workflow', duration: '60 min', cecCredits: 1 },
  'NRP-022': { title: 'CEC Credits System', description: 'Continual education requirements', duration: '45 min', cecCredits: 1 },
  'NRP-023': { title: 'Association Memberships', description: 'Industry associations and benefits', duration: '45 min', cecCredits: 1 },
  'NRP-024': { title: 'Members Gatherings', description: 'Networking and professional development', duration: '45 min', cecCredits: 1 },
};

const CSE_MODULE_NAMES: Record<string, { title: string; description: string; duration: string; cecCredits: number }> = {
  'CSE-M01': { title: 'Understanding Customer Psychology', description: 'Customer behaviour in crisis', duration: '45 min', cecCredits: 2 },
  'CSE-M02': { title: 'First Contact Excellence', description: 'Initial customer interactions', duration: '60 min', cecCredits: 2 },
  'CSE-M03': { title: 'Communication During Restoration', description: 'Ongoing customer communication', duration: '60 min', cecCredits: 2 },
  'CSE-M04': { title: 'Difficult Conversations', description: 'Handling challenging situations', duration: '60 min', cecCredits: 2 },
  'CSE-M05': { title: 'Insurance Communication', description: 'Working with insurers and adjusters', duration: '60 min', cecCredits: 2 },
  'CSE-M06': { title: 'Quality Assurance', description: 'Service quality standards', duration: '60 min', cecCredits: 2 },
  'CSE-M07': { title: 'Crisis Intervention', description: 'Managing crisis situations', duration: '60 min', cecCredits: 2 },
  'CSE-M08': { title: 'Technology in Customer Service', description: 'Digital tools and platforms', duration: '45 min', cecCredits: 1 },
  'CSE-M09': { title: 'Building Long-term Relationships', description: 'Customer retention strategies', duration: '45 min', cecCredits: 1 },
  'CSE-M10': { title: 'Final Assessment', description: 'CSE certification assessment', duration: '90 min', cecCredits: 3 },
};

const WRT_MODULE_NAMES: Record<string, { title: string; description: string; duration: string; cecCredits: number }> = {
  'WRT-M01': { title: 'Introduction to Water Damage', description: 'Water damage fundamentals', duration: '120 min', cecCredits: 3 },
  'WRT-M02': { title: 'Psychrometry', description: 'Science of drying', duration: '120 min', cecCredits: 3 },
  'WRT-M03': { title: 'Inspection and Moisture Detection', description: 'Assessment techniques', duration: '120 min', cecCredits: 3 },
  'WRT-M04': { title: 'Water Extraction Equipment', description: 'Extraction tools and methods', duration: '120 min', cecCredits: 3 },
  'WRT-M05': { title: 'Structural Drying Equipment', description: 'Drying systems and setup', duration: '120 min', cecCredits: 3 },
  'WRT-M06': { title: 'Drying Goals and Strategies', description: 'Planning drying projects', duration: '120 min', cecCredits: 3 },
  'WRT-M07': { title: 'Antimicrobial Application', description: 'Mould prevention and treatment', duration: '90 min', cecCredits: 2 },
  'WRT-M08': { title: 'Contents Processing', description: 'Restoring personal property', duration: '90 min', cecCredits: 2 },
  'WRT-M09': { title: 'Australian Standards', description: 'AS/NZS compliance requirements', duration: '90 min', cecCredits: 2 },
  'WRT-M10': { title: 'Documentation and Xactimate', description: 'Estimating and reporting', duration: '120 min', cecCredits: 3 },
  'WRT-M11': { title: 'Customer Communication', description: 'Client management during restoration', duration: '60 min', cecCredits: 2 },
  'WRT-M12': { title: 'Final Assessment', description: 'Water damage restoration assessment', duration: '120 min', cecCredits: 3 },
};

// ============================================================================
// INDEX GENERATOR
// ============================================================================

class TrainingIndexGenerator {
  /**
   * Generate metadata for a single module
   */
  private generateModuleMetadata(
    moduleId: string,
    course: 'NRPG' | 'CSE' | 'WRT',
    moduleNumber: number
  ): ModuleMetadata {
    const moduleNames = course === 'NRPG' ? NRPG_MODULE_NAMES :
                       course === 'CSE' ? CSE_MODULE_NAMES :
                       WRT_MODULE_NAMES;
    
    const moduleInfo = moduleNames[moduleId] || {
      title: `${course} Module ${moduleNumber}`,
      description: 'Module description pending',
      duration: '60 min',
      cecCredits: 1,
    };

    // Determine certification levels
    const certificationLevel: ('BRONZE' | 'SILVER' | 'GOLD')[] = [];
    if (CERTIFICATION_PATHS.BRONZE.modules.includes(moduleId)) certificationLevel.push('BRONZE');
    if (CERTIFICATION_PATHS.SILVER.modules.includes(moduleId)) certificationLevel.push('SILVER');
    if (CERTIFICATION_PATHS.GOLD.modules.includes(moduleId)) certificationLevel.push('GOLD');

    // Determine prerequisites
    const prerequisites: string[] = [];
    if (moduleNumber > 1) {
      const prevModule = `${course === 'NRPG' ? 'NRP' : course}-${course === 'NRPG' ? (moduleNumber - 1).toString().padStart(3, '0') : 'M' + (moduleNumber - 1).toString().padStart(2, '0')}`;
      prerequisites.push(prevModule);
    }

    // Parse duration
    const durationMatch = moduleInfo.duration.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 60;

    return {
      moduleId,
      course,
      moduleNumber,
      title: moduleInfo.title,
      description: moduleInfo.description,
      duration: moduleInfo.duration,
      durationMinutes,
      passingScore: NRPG_QUIZ_PASSING_SCORE,
      cecCredits: moduleInfo.cecCredits,
      prerequisites,
      certificationLevel,
      hasAssessment: true,
      hasExercises: true,
      hasResources: true,
      sourcePath: `training-sources/modules/${moduleId.toLowerCase()}.html`,
      assessmentPath: `training-sources/assessments/${moduleId.toLowerCase()}-quiz.json`,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Generate course info
   */
  private generateCourseInfo(course: 'NRPG' | 'CSE' | 'WRT'): CourseInfo {
    const moduleNames = course === 'NRPG' ? NRPG_MODULE_NAMES :
                       course === 'CSE' ? CSE_MODULE_NAMES :
                       WRT_MODULE_NAMES;
    
    const moduleCount = MODULE_COUNTS[course];
    const modules: ModuleMetadata[] = [];

    for (let i = 1; i <= moduleCount; i++) {
      const moduleId = course === 'NRPG' 
        ? `NRP-${i.toString().padStart(3, '0')}`
        : `${course}-M${i.toString().padStart(2, '0')}`;
      
      modules.push(this.generateModuleMetadata(moduleId, course, i));
    }

    const totalHours = modules.reduce((sum, m) => sum + m.durationMinutes, 0) / 60;

    return {
      courseId: course,
      courseName: course === 'NRPG' ? 'NRPG Core Certification' :
                  course === 'CSE' ? 'Customer Service Excellence' :
                  'Water Damage Restoration Training',
      description: course === 'NRPG' ? 'Core platform and business skills' :
                   course === 'CSE' ? 'Customer service and communication' :
                   'Technical water damage restoration',
      totalModules: moduleCount,
      totalHours: Math.round(totalHours),
      passingScore: NRPG_QUIZ_PASSING_SCORE,
      modules,
    };
  }

  /**
   * Generate complete training index
   */
  generateIndex(): TrainingIndex {
    const courses: CourseInfo[] = [
      this.generateCourseInfo('NRPG'),
      this.generateCourseInfo('CSE'),
      this.generateCourseInfo('WRT'),
    ];

    const totalModules = courses.reduce((sum, c) => sum + c.totalModules, 0);

    return {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      totalModules,
      courses,
      certificationPaths: CERTIFICATION_PATHS,
      metadata: {
        lastUpdated: new Date().toISOString(),
        schemaVersion: '1.0.0',
        australianCompliant: true,
      },
    };
  }

  /**
   * Save index to file
   */
  saveIndex(index: TrainingIndex): void {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    const outputFile = path.join(OUTPUT_PATH, 'training-index.json');
    fs.writeFileSync(outputFile, JSON.stringify(index, null, 2), 'utf-8');

    console.log(`✅ Training index saved to: ${outputFile}`);
    console.log(`   Total modules: ${index.totalModules}`);
    console.log(`   Courses: ${index.courses.map(c => c.courseId).join(', ')}`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('📚 DR-NRPG Training Index Generator');
  console.log('=' .repeat(60));

  const generator = new TrainingIndexGenerator();
  const index = generator.generateIndex();
  generator.saveIndex(index);

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('INDEX SUMMARY');
  console.log('=' .repeat(60));

  index.courses.forEach(course => {
    console.log(`\n${course.courseId}: ${course.courseName}`);
    console.log(`  Modules: ${course.totalModules}`);
    console.log(`  Hours: ${course.totalHours}`);
    console.log(`  Passing Score: ${course.passingScore}%`);
  });

  console.log('\n' + '=' .repeat(60));
  console.log('CERTIFICATION PATHS');
  console.log('=' .repeat(60));

  Object.entries(index.certificationPaths).forEach(([level, path]) => {
    console.log(`\n${path.name} (${level})`);
    console.log(`  Description: ${path.description}`);
    console.log(`  Modules: ${path.totalModules}`);
    console.log(`  Hours: ${path.estimatedHours}`);
    if (path.prerequisites) {
      console.log(`  Prerequisites: ${path.prerequisites.join(', ')}`);
    }
  });

  console.log('\n✅ Index generation complete!');
}

main();
