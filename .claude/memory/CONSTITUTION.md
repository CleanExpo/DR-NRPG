# CONSTITUTION — Disaster Recovery NRPG Platform
> Immutable rules. Survives compaction. Re-read if context feels wrong.

## Project Identity
- **Stack**: Next.js 15 (`apps/web/app/`) + Prisma + PostgreSQL (Supabase) + Redis + Tailwind CSS
- **Live**: https://disasterrecovery.com.au
- **Locale**: en-AU | Dates: DD/MM/YYYY | Currency: AUD | Timezone: AEST/AEDT
- **Design**: OLED Black `#050505` | Scientific Luxury | Framer Motion only | `rounded-sm`

## Architecture Routing
| Domain | Location | Agent |
|--------|----------|-------|
| Frontend (Next.js App Router) | `apps/web/app/` | frontend-specialist |
| API Routes | `apps/web/app/api/` | backend-specialist |
| Services & Utilities | `apps/web/lib/` | backend-specialist |
| Database (Prisma + Supabase) | `apps/web/prisma/schema.prisma` | database-specialist |
| Auth | `apps/web/lib/auth.ts` + `apps/web/middleware.ts` | backend-specialist |
| Components | `apps/web/components/` | frontend-specialist |
| Styles | `styles/globals.css` | frontend-specialist |
| Tests | `tests/` + `playwright.config.ts` | test-engineer |

## 5 Critical Rules

1. **Retrieval-First** — Query memory → skills → grep BEFORE loading docs inline.
2. **No cross-layer imports** — Components never import from `lib/server/`. API routes use services, not repos directly.
3. **Subagent isolation** — All heavy implementation dispatched to subagents. Orchestrator stays lean.
4. **State on disk** — Decisions written to `.claude/memory/architectural-decisions.md`. Never assume from training data.
5. **Design system** — Scientific Luxury enforced. No generic Tailwind defaults. No `rounded-lg`. No linear easing.

## Orchestrator Token Budget
- **Orchestrator**: Hard cap 80,000 tokens. Delegate file reads to subagents.
- **Subagents**: Fresh context per invocation. Load only relevant files/skills.
- **Compass**: 100 tokens injected before every message (UserPromptSubmit hook).

## Project-Specific Rules
- **NO PHONE NUMBERS** — Email only: `support@disasterrecovery.com.au`
- **Contractors are independent** — Platform facilitates matching only, never employment
- **Australian English** — colour, mould, organisation, licence, centre (enforced by `standards` agent)
- **No self-verification** — All work routed to `verification` agent, never the author

## Drift Recovery Procedure
If context feels wrong or rules are being violated:
```bash
cat .claude/memory/CONSTITUTION.md           # Re-read immutable rules
cat .claude/memory/current-state.md          # Check last saved state
cat .claude/memory/architectural-decisions.md  # Review logged decisions
```
Then re-read `skills/verification/verification-first.skill.md` and resume.

## Spectral Colours (Design)
- Cyan `#00F5FF` (active) | Emerald `#00FF88` (success) | Amber `#FFB800` (warning)
- Red `#FF4444` (error) | Magenta `#FF00FF` (escalation)
- Primary brand: Teal `#0d9488` | Secondary: Gray-900 `#111827`

## Default Auth Credentials (Dev Only)
`admin@local.dev` / `admin123` — Never use in production.
