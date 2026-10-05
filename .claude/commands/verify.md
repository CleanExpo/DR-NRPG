# Verify Command

Verify that the foundation architecture is intact.

## Checks to Perform

### 1. TypeScript Configuration

Verify `apps/web/tsconfig.json` has ALL strict options enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Circular Dependencies

Run:
```bash
npx madge --circular --extensions ts,tsx apps/web/
```

Report any circular dependencies found.

### 3. Type Check

Run:
```bash
pnpm type-check
```

Report any type errors.

## Report Format

```
Foundation Verification Report
==============================

TypeScript Config: [PASS/FAIL]
Circular Dependencies: [PASS/FAIL]
Type Check: [PASS/FAIL]

Overall: [PASS/FAIL]

Issues Found:
- [List any issues]
```