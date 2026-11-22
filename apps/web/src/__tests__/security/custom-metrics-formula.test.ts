/**
 * DR-946: custom metric formulas are user-authored text (see
 * components/analytics/custom-metrics-builder.tsx). They used to be run with
 * `new Function`, which executes any JavaScript. These tests pin the arithmetic
 * behaviour and prove a formula can no longer run code.
 */
import { CustomMetricsBuilder } from '@/lib/analytics/custom-metrics';

function calc(formula: string, vars: Record<string, number> = {}) {
  const builder = new CustomMetricsBuilder();
  builder.on('metric:error', () => undefined);
  const metric = builder.createMetric('m', formula, new Map());
  return builder.calculateMetric(metric.id, vars);
}

describe('CustomMetricsBuilder formula evaluation', () => {
  it.each<[string, Record<string, number>, number]>([
    ['revenue / jobs', { revenue: 1000, jobs: 4 }, 250],
    ['(a + b) * 2 - c % 3', { a: 1, b: 2, c: 5 }, 4],
    ['-a + +b', { a: 3, b: 10 }, 7],
    ['a - b', { a: 1, b: -5 }, 6],
    ['2 ** 3 ** 2', {}, 512],
    ['(-2) ** 2', {}, 4],
    ['Math.round(Math.max(a, b, 2.4) * 10) / 10', { a: 1.26, b: 0.5 }, 2.4],
    ['Math.PI * r * r', { r: 2 }, Math.PI * 4],
    ['1.5e3 + .5', {}, 1500.5],
    ['count_2 * 2', { count_2: 21 }, 42],
  ])('evaluates %s', (formula, vars, expected) => {
    expect(calc(formula, vars)?.value).toBeCloseTo(expected, 10);
  });

  it('keeps Infinity for division by zero, as before', () => {
    expect(calc('a / b', { a: 1, b: 0 })?.value).toBe(Infinity);
  });

  it('rejects NaN results', () => {
    expect(calc('a - a', { a: Infinity })).toBeNull();
  });

  const marker = '__dr946_pwned';
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[marker];
  });

  it.each([
    `(globalThis.${marker} = 1, 1)`,
    `Math.constructor.constructor("globalThis.${marker} = 1")() || 1`,
    `(() => { globalThis.${marker} = 1; return 1 })()`,
    `process.exit(1)`,
    `require("child_process")`,
    `this`,
    `Math.__proto__`,
    `a; globalThis.${marker} = 1`,
    `"1" + 1`,
    `[1][0]`,
    `1 ^ 2`,
    `-2 ** 2`,
    `Math.max`,
    ``,
    `(1 + 2`,
    `unknownVar + 1`,
  ])('refuses to run %p', (formula) => {
    expect(calc(formula, { a: 1 })).toBeNull();
    expect((globalThis as Record<string, unknown>)[marker]).toBeUndefined();
  });
});
