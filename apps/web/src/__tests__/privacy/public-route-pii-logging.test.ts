/**
 * @jest-environment node
 *
 * Wave 1: unauthenticated public routes must not write personal information
 * (name, email, phone, IP address) to server logs. Logs are retained by the
 * host and are not covered by the platform's privacy controls.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_ROUTE_DIRS = ['app/api/public', 'app/api/landing', 'app/api/newsletter'];

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return routeFiles(full);
    return name === 'route.ts' ? [full] : [];
  });
}

// Identifiers that carry personal information. String literals are stripped
// first so a message such as 'Failed to send email' is not flagged.
const PII_IDENTIFIER = /\b(email|phone|mobile|firstName|lastName|fullName|ipAddress)\b|\.name\b/;

function piiInConsoleCalls(source: string): string[] {
  const calls = source.match(/console\.(log|info|warn|error|debug)\(([\s\S]*?)\);/g) ?? [];
  return calls.filter((call) => {
    const withoutStrings = call.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, "''");
    return PII_IDENTIFIER.test(withoutStrings);
  });
}

describe('public routes do not log personal information', () => {
  const files = PUBLIC_ROUTE_DIRS.flatMap((dir) => routeFiles(path.join(ROOT, dir)));

  it('finds the public routes', () => {
    expect(files.map((f) => path.relative(ROOT, f))).toEqual(
      expect.arrayContaining([
        'app/api/public/claims/submit/route.ts',
        'app/api/public/client-feedback/route.ts',
        'app/api/newsletter/subscribe/route.ts',
        'app/api/landing/waitlist/route.ts',
      ])
    );
  });

  it.each(PUBLIC_ROUTE_DIRS.flatMap((dir) => routeFiles(path.join(ROOT, dir))).map((f) => path.relative(ROOT, f)))(
    '%s',
    (file) => {
      expect(piiInConsoleCalls(readFileSync(path.join(ROOT, file), 'utf8'))).toEqual([]);
    }
  );

  it('detector flags a name/email log and ignores message text (positive control)', () => {
    expect(
      piiInConsoleCalls("console.log('Client:', validatedData.step2.name, validatedData.step2.email);")
    ).toHaveLength(1);
    expect(piiInConsoleCalls("console.log('Conversion', {\n  id: s.id,\n  email: s.email,\n});")).toHaveLength(1);
    expect(piiInConsoleCalls("console.error('Failed to send email:', error);")).toEqual([]);
  });
});
