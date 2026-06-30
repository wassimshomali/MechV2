# Agent Playbook

Instructions for autonomous Cursor Cloud Agents (and any AI developer) working on MoMech.

**Read these files at the start of every session:**
1. [NORTH_STAR.md](./NORTH_STAR.md)
2. [ROADMAP.md](./ROADMAP.md)
3. This file

---

## Your role

You are a background development agent for a Montreal-based founder building garage ERP software. The founder:
- Writes code but delegates implementation to you
- Handles pilot garage connections, Twilio/email accounts, legal, and sales
- Tests features on real hardware when asked
- Reviews and merges PRs

You should be able to work **autonomously for full sessions** without asking the founder questions unless truly blocked.

---

## Session startup checklist

```
1. git checkout main && git pull
2. git checkout -b cursor/<task-slug>-53f4   (or continue existing PR branch)
3. Read NORTH_STAR.md + ROADMAP.md
4. Identify next unchecked P0 task in earliest incomplete phase
5. Skip any [FOUNDER] tasks
6. npm install (if needed)
7. Implement task
8. npm test && npm run lint && npm run build:css:once
9. git commit, git push, create/update PR
10. Update ROADMAP.md checkboxes in your commit
11. Write PR description: what you did, what's next, any [FOUNDER] blockers
```

---

## Branch naming

```
cursor/<short-description>-53f4
```

Examples:
- `cursor/i18n-french-ui-53f4`
- `cursor/quebec-gst-qst-53f4`
- `cursor/invoice-pdf-fr-53f4`

Always push with: `git push -u origin <branch-name>`

---

## What you CAN do autonomously

- Implement any unchecked ROADMAP item not marked `[FOUNDER]`
- Fix bugs discovered during testing
- Add tests for new features
- Update documentation
- Refactor within scope of current task
- Update seed data for Montreal locale
- Add migrations for schema changes
- Update `config/app.js` defaults for Quebec

---

## What you CANNOT do (founder required)

| Task | Why | What to do instead |
|------|-----|-------------------|
| Create Twilio/SendGrid/AWS accounts | Needs billing & credentials | Add env var placeholders in `.env.example`; document in FOUNDER_TASKS |
| Legal text (privacy policy, ToS) | Needs lawyer or founder review | Create `docs/templates/` with outline; mark `[FOUNDER]` |
| Pilot garage feedback | Human relationship | Create/update `PILOT_FEEDBACK.md` template |
| Production secrets | Security | Use `.env.example` only; never commit secrets |
| Pricing changes | Business decision | Follow NORTH_STAR.md locked pricing unless founder updates it |
| Pivot to full SaaS | Architecture decision | Follow local-first architecture in NORTH_STAR |

When blocked: **skip the task, note it in PR, move to next P0.**

---

## Implementation standards

### Code
- Match existing patterns (see `server/routes/clients.js`, `src/components/clients/clientList.js`)
- Minimal scope — only change what's needed for the current ROADMAP item
- CommonJS in `server/` and `config/`; ESM in `src/`
- All new user-facing strings through i18n (once A1 is done); until then, use French directly with `// TODO: i18n` comment

### Database
- New schema changes via migration files: `server/database/migrations/00X_description.sql`
- Seeds in `server/database/seeds/` — tracked, don't duplicate on restart
- Test DB separate from dev DB (see `tests/integration/api.test.js`)

### API
- REST under `/api/v1`
- camelCase in JSON requests; snake_case in SQLite
- Use `objectToSnakeCase` / `objectToCamelCase` helpers
- Document new endpoints in `docs/api.md`

### Frontend
- Components in `src/components/<module>/`
- Services in `src/services/`
- Shared helpers in `src/utils/`
- Use `DataTable` for lists, `Form` for forms
- Use `pageHelpers.js` for headers, badges, detail cards

### i18n (after A1 is implemented)
- Never hardcode user-facing strings in components
- Keys: `module.component.string` (e.g. `clients.form.firstName`)
- Primary locale: `fr-CA`

### Tests
- Add integration tests for new API endpoints
- Run `npm test` before every commit
- Tests use isolated DB at `database/test-momech.db`

---

## Commit messages

```
<type>: <description>

Types: feat, fix, docs, test, refactor, chore

Examples:
feat: add GST/QST tax calculation to invoices
feat(i18n): extract client form strings to fr-CA locale
docs: update ROADMAP A3 checkboxes
fix: correct QST calculation to apply on subtotal + GST
```

---

## PR template

```markdown
## Summary
[1-2 sentences: what this PR does]

## ROADMAP items completed
- [x] A3: Quebec sales tax (GST + QST)

## How to test
1. npm install
2. npm run dev
3. [specific steps]

## Screenshots / notes
[if UI changes]

## Next steps (for next agent session)
- A4: Quebec invoice PDF

## Founder action needed
- [ ] None
OR
- [ ] Validate tax calculation with comptable (see MONTREAL_REQUIREMENTS.md §3)
```

---

## Priority decision tree

```
Start
  │
  ├─ Is Phase A complete? ──NO──► Do next P0 in Phase A (A1→A2→A3→A4...)
  │
  └─ YES
       │
       ├─ Is Phase B complete? ──NO──► Do next P0 in Phase B (B1→B4→B7...)
       │
       └─ YES
            │
            └─► Ask founder before starting Phase C
```

Within a phase, if a P0 is blocked by `[FOUNDER]`, do the next P0. If all P0s blocked, do P1 items.

---

## Key file map

```
docs/
├── NORTH_STAR.md           ← Vision (read first)
├── ROADMAP.md              ← What to build (update checkboxes)
├── MONTREAL_REQUIREMENTS.md← How to build for Quebec
├── AGENT_PLAYBOOK.md       ← This file
├── FOUNDER_TASKS.md        ← Human-only tasks
├── BUSINESS_AND_GTM.md     ← Pricing & sales
└── api.md                  ← API reference

config/app.js               ← App defaults (update for Montreal)
server/database/migrations/ ← Schema changes
server/database/seeds/      ← Sample data
server/routes/              ← API handlers
src/components/             ← UI pages
src/services/               ← API client layer
src/i18n/                   ← (create in A1) translations
tests/integration/          ← API tests
```

---

## Common pitfalls to avoid

1. **Don't pivot to multi-tenant SaaS** — local-first until Phase C
2. **Don't use USD or US tax defaults** — always CAD + GST/QST
3. **Don't hardcode English** after i18n is implemented
4. **Don't commit secrets, db files, or node_modules**
5. **Don't skip tests** — CI will fail
6. **Don't mark ROADMAP items done** unless acceptance criteria in ROADMAP/MONTREAL_REQUIREMENTS are met
7. **Don't ask founder "what should I do next?"** — read ROADMAP
8. **Don't implement Phase C features** without explicit founder approval

---

## Updating documentation

When you complete ROADMAP items:
1. Check boxes in `ROADMAP.md`
2. Update "Current codebase status" table in `NORTH_STAR.md` if significant
3. Add new API endpoints to `docs/api.md`
4. Update `README.md` only if user-facing setup changes

---

## Emergency: app won't start

```bash
rm -f database/momech.db database/momech.db-*
npm install
npm start
# Server runs migrations + seeds on fresh DB
```

If tests fail after migration: check migration SQL syntax, foreign keys, and seed order.

---

*Last updated: 2026-06-30*
