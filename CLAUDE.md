# Disaster Recovery — NRPG Platform

## Project Identity
- **Type**: Next.js 15 SaaS platform (pnpm + turbo monorepo; web app in `apps/web/`)
- **Stack**: TypeScript · Prisma · PostgreSQL (Supabase) · Redis · Tailwind CSS
- **Status**: Production Ready — https://disasterrecovery.com.au
- **Locale**: en-AU | DD/MM/YYYY | AUD | AEST/AEDT

---

## Scaffold Structure

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | 27 specialist agents — see Agent Roster below |
| `.claude/blueprints/` | Task blueprints: `feature`, `bugfix`, `migration`, `refactor` |
| `.claude/commands/` | Slash commands: `/verify`, `/minion`, `/audit`, `/ralph`, etc. |
| `.claude/data/` | Design tokens, toolsheds, trusted sources, verified claims |
| `.claude/hooks/` | Pre/post hooks + scripts (auto-runs on events) |
| `.claude/memory/` | CONSTITUTION · compass · current-state · architectural-decisions |
| `.claude/notebooklm/` | NotebookLM notebook registry |
| `.beads/` | Interaction + issue tracking |
| `.skills/` | 40+ reusable skill modules (custom/) |
| `skills/` | Project-specific skills (australian, backend, design, etc.) |
| `docs/` | Internal docs, guides, release notes |
| `scripts/` | Dev, deploy, verify, setup scripts |

---

## Agent Roster

**DO NOT store information here — dispatch to agents.**

### Primary Dispatch
| Need | Agent | Trigger |
|------|-------|---------|
| Codebase questions | `project-intel` | "where is", "how does", "find the" |
| Code/design standards | `standards` | "what colour", "how should", "style guide" |
| External docs/APIs | `research` | "latest docs", "how to integrate", "best practice" |
| Past decisions | `history` | "what did we decide", "previous session" |
| New feature spec | `spec-builder` | "I want to add", "new feature" |

### Specialist Agents
| Domain | Agent |
|--------|-------|
| Frontend (Next.js, React, Tailwind) | `frontend-specialist` |
| Backend (API routes, services) | `backend-specialist` |
| Database (Prisma, PostgreSQL, Supabase) | `database-specialist` |
| Testing & QA | `test-engineer` |
| Bug investigation | `bug-hunter` |
| Code review | `code-reviewer` |
| Refactoring | `refactor-specialist` |
| Security | `security-auditor` |
| Performance | `performance-optimizer` |
| Deployment | `deploy-guardian` |
| Environment / .env | `env-wizard` |
| Documentation | `docs-writer` |
| Browser automation | `playwright-browser` · `browser-qa` |
| SEO / search | `seo-intelligence` · `rank-tracker` |
| Content truth-check | `truth-finder` |
| Independent verification | `verification` |
| Skill meta-tasks | `skill-manager` |
| Chaos/regression | `ralph-wiggum` |
| Multi-agent orchestration | `orchestrator` |

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `/verify` | Run verification suite |
| `/minion` | One-shot Blueprint DAG execution |
| `/audit` | Full codebase audit |
| `/new-feature` | Kick off feature spec interview |
| `/ui-review` | Design standards review |
| `/fix-types` | TypeScript error remediation |
| `/ralph` | Chaos/regression testing |
| `/bootstrap` | Project bootstrap |
| `/skill-manager` | Install/update skills |

---

## Quick Commands
```bash
npm run dev            # Development server
npm run build          # Production build
npm run test           # Run tests
npm run db:push        # Push Prisma schema
npm run db:studio      # Open Prisma Studio
bash scripts/verify.sh # Full verification
pwsh scripts/health-check.ps1  # Health check
```

---

## Architecture Routing

| Domain | Location |
|--------|----------|
| Pages & UI | `apps/web/app/` (Next.js App Router) |
| API routes | `apps/web/app/api/` |
| Components | `apps/web/components/`, `apps/web/src/components/` |
| Database schema | `apps/web/prisma/schema.prisma` |
| Services | `apps/web/lib/` |
| Auth | `apps/web/lib/auth.ts`, `apps/web/src/lib/auth/` + `apps/web/middleware.ts` |
| Styles | `styles/globals.css` + Tailwind |

---

## Critical Rules

1. **NO PHONE, NO ADDRESS, NO EMAIL DISPLAYED** — The platform is fully AI-automated online. Never display phone numbers, email addresses, street addresses, or business locations anywhere in the UI. All contact/support is handled via the online contact form and AI chat. This applies to all public pages, dashboards, footers, headers, CTAs, and schema visible to users.
2. **Australian English** — colour, mould, organisation, licence, centre
3. **Contractors are independent** — Platform facilitates matching only
4. **Retrieval-First** — Query memory → skills → grep BEFORE loading docs inline
5. **No self-verification** — All work verified by `verification` agent, never the author
6. **State on disk** — Decisions written to `.claude/memory/architectural-decisions.md`
7. **Design system** — Scientific Luxury enforced. OLED black `#050505`. No generic Tailwind defaults.

---

## OMX Workflow Protocols (DR-324)

> Ports patterns from oh-my-codex into Claude-native workflow. Applies to all BUILD tasks.

### Pre-BUILD Clarification Gate (`dr-clarify`)

Before ANY build enters "Approved", all 6 gates must be green:

| Gate | Pass Condition |
|------|----------------|
| G1 Content | No "TBD", "pending", or "to be confirmed" sections |
| G2 Legal | Pre-conditions confirmed by named person (not "pending review") |
| G3 Data Sources | Every stat has Tier 1–3 source + direct URL |
| G4 Geo/Supplier | Named supplier confirmed per geography |
| G5 Owner | Specific named individual — not "the team" |
| G6 Execution Date | Specific DD/MM/YYYY — not "next session" |

Failed gate → Status: `Blocked: Clarification Required`. Do not plan.

### BUILD Execution Protocol (`dr-execute`)

After a BUILD is approved + security-cleared:
- Status → **ACTIVE EXECUTION**
- Next session: must present completion evidence (URL live / TypeScript passes / PR merged)
- No evidence after 2 sessions → **P0 EXECUTION BLOCKER** (named dev + commit SHA + 24-hour deadline)
- No re-planning of ACTIVE builds — only: Complete | Blocked (specific reason) | Scope-Changed (new ID)

### RALPLAN-DR Block (P0/P1 BUILDs — `dr-execute`)

Every P0/P1 BUILD plan must include a RALPLAN-DR summary block before execution:

```markdown
## RALPLAN-DR: [BUILD-XXX]
### Principles (3–5)
### Decision Drivers (top 3)
### Options Evaluated (≥2 with pros/cons)
### Selected Approach + Rationale
### Antithesis (strongest argument against this approach)
### Test Acceptance Criteria (how we know it's done)
### Pre-mortem (3 scenarios where this fails — P0/security builds only)
```

A plan without a RALPLAN-DR block is not approved for P0/P1 BUILDs.

### Parallel Lanes (`$team`)

Every BUILD with ≥2 independent tasks must define explicit execution lanes. Never build sequentially what can build in parallel.

### Session Continuity

Read `docs/boardroom-state.json` first at boardroom session start (5 seconds). Write it at session end.

---

## Drift Recovery

If context feels wrong, re-read in order:
```bash
cat .claude/memory/CONSTITUTION.md
cat .claude/memory/current-state.md
cat .claude/memory/architectural-decisions.md
```

---

## Karpathy-Inspired Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Sub-agent doctrine (persistent specialists)

Multi-round agent work follows the global `persistent-subagents` skill: keep ONE warm,
named specialist per domain per session and feed follow-ups via SendMessage resume —
never re-spawn for a second task in the same domain. The main thread coordinates only;
noisy collection (grep sweeps, web fan-outs, bulk reads) goes to throwaway children,
which return distilled verdicts. Standing specialist domains for this repo:
`frontend-nrpg-platform`, `payments-stripe-nrpg`, `ci-infra-nrpg`. Name = `<type>-<durable-mission>`, frozen at spawn, must still be true on
resume #8. Retire a specialist near ~300k context with a written handoff; domain
change = fresh agent, always.
