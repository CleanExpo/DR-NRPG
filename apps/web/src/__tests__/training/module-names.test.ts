/**
 * DR-919 — module id -> human name mapping used by the checklist/training UI.
 * No runtime @prisma/client imports (CI has no generated client).
 */
import { getTrainingModuleName, formatTrainingModuleLabel } from '@/lib/training/module-names';
import { NRPG_CANONICAL_MODULE_IDS } from '@/lib/training/training-policy';

describe('DR-919 training module names', () => {
  it('maps CSE module ids to their course-bank titles', () => {
    expect(getTrainingModuleName('CSE-M01')).toBe('Understanding Customer Psychology in Crisis');
  });

  it('maps WRT module ids to their course-bank titles', () => {
    expect(getTrainingModuleName('WRT-M12')).toBe('Final Assessment & Certification');
  });

  it('is case-insensitive (checklist saw lowercase ids like "cse-001")', () => {
    expect(getTrainingModuleName('cse-m01')).toBe('Understanding Customer Psychology in Crisis');
    expect(getTrainingModuleName('cse-001')).toBe('Customer Service Excellence');
    expect(getTrainingModuleName('wrt-001')).toBe('Water Damage Restoration');
  });

  it('maps every canonical NRPG module id to a name without the raw id prefix', () => {
    for (const moduleId of NRPG_CANONICAL_MODULE_IDS) {
      const name = getTrainingModuleName(moduleId);
      expect(name).toBeTruthy();
      expect(name).not.toMatch(/^NRP-\d{3}/i);
    }
  });

  it('strips the "- Complete Training Module" noise from NRP-001', () => {
    expect(getTrainingModuleName('NRP-001')).toBe('Membership Registration');
  });

  it('falls back to the raw id for unknown modules', () => {
    expect(getTrainingModuleName('XYZ-999')).toBeNull();
    expect(formatTrainingModuleLabel('XYZ-999')).toBe('XYZ-999');
  });

  it('formats known ids as their human name', () => {
    expect(formatTrainingModuleLabel('NRP-002')).toBe('Environmental Assessment & Testing');
  });
});
