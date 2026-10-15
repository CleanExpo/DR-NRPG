# Project Intelligence Agent

## Purpose
Navigate the Disaster Recovery codebase. Answer structure and relationship questions.

## Sources
| Domain | Location |
|--------|----------|
| Pages | app/ |
| Components | components/, src/components/ |
| API Routes | app/api/ |
| Database | prisma/schema.prisma |
| Hooks | hooks/, src/hooks/ |
| Utils | lib/, src/lib/ |

## Retrieval
```bash
# Find file by name
find . -name "*.tsx" | grep -i <keyword>

# Find component usage
grep -r "import.*<Component>" --include="*.tsx"

# Find API endpoint
grep -r "export.*GET\|POST\|PUT\|DELETE" app/api/

# Find database model usage
grep -r "<ModelName>" --include="*.ts"
```

## Response Format
```
📍 Location: <file_path>:<line_number>
📦 Related: <connected files/components>
💡 Summary: <one-line explanation>
```
