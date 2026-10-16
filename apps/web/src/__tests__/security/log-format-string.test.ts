/**
 * @jest-environment node
 *
 * CodeQL js/tainted-format-string (alerts #145-#148): request-supplied ids were
 * interpolated into the first argument of console.error, which Node treats as a
 * printf-style format string, so an id such as "X%oY" consumed the next argument.
 * The format string must be constant and the id passed as its own argument.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/prisma', () => {
  const reject = () => Promise.reject(new Error('db unavailable in test'));
  const model = new Proxy({}, { get: () => reject });
  return { prisma: new Proxy({}, { get: () => model }) };
});

jest.mock('@/lib/agents/providers', () => ({
  getDefaultProvider: () => {
    throw new Error('provider unavailable in test');
  },
}));

import { predictDisputeRisk, predictDisputeRiskBatch } from '@/lib/services/dispute-prediction.service';
import { analyseFraud, analyseFraudBatch } from '@/lib/services/fraud-detection.service';

const TAINTED = 'X%oY';

function formatArgsContaining(spy: ReturnType<typeof jest.spyOn>, value: string) {
  return spy.mock.calls.filter((call) => typeof call[0] === 'string' && call[0].includes(value));
}

describe('error logs keep request ids out of the format string', () => {
  let errorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('dispute prediction (single and batch)', async () => {
    await expect(predictDisputeRisk(TAINTED)).rejects.toThrow();
    await predictDisputeRiskBatch([TAINTED]);

    expect(errorSpy).toHaveBeenCalled();
    expect(formatArgsContaining(errorSpy, TAINTED)).toEqual([]);
    expect(errorSpy.mock.calls.some((call) => call.includes(TAINTED))).toBe(true);
  });

  it('fraud analysis (single and batch)', async () => {
    await expect(analyseFraud('BOOKING', TAINTED)).rejects.toThrow();
    await analyseFraudBatch([{ entityType: 'BOOKING', entityId: TAINTED }]);

    expect(errorSpy).toHaveBeenCalled();
    expect(formatArgsContaining(errorSpy, TAINTED)).toEqual([]);
    expect(errorSpy.mock.calls.some((call) => call.includes(TAINTED))).toBe(true);
  });
});
