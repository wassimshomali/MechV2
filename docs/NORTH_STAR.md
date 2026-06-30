# MoMech North Star

**Product:** MoMech — ERP/CRM for small independent garages  
**Market:** Montreal & Quebec, Canada  
**Founder:** Montreal-based programmer  
**Vision:** French-first, Quebec-compliant, local-first garage software that small shops can trust with their data.

> This document is the single source of truth for product direction. All development, agent tasks, and prioritization should align with this file. When in doubt, read this first.

---

## One-sentence mission

Build the simplest, most trustworthy garage management software for Montreal mechanics — in their language, with their taxes, on their terms.

---

## What we are building

MoMech is **not** a generic US ERP port. It is:

- **Montreal-native** — French UI, Quebec taxes, Canadian locale
- **Local-first** — runs on a shop PC, works offline, data stays at the garage
- **Honest software** — fair pricing, no vendor lock-in theatrics, human support
- **Right-sized** — built for 1–5 bay independent garages, not dealership chains

### What we are NOT building (yet)

- Multi-national enterprise features
- Full accounting replacement (QuickBooks/Sage integration instead)
- Mobile native apps (responsive web first)
- Full SaaS multi-tenant platform (Phase C at earliest)

---

## Target customer

| Attribute | Profile |
|-----------|---------|
| Location | Montreal, Laval, South Shore, Quebec |
| Size | 1–5 bays, 1–8 employees |
| Language | French primary; bilingual acceptable |
| Tech comfort | Low to medium — needs install help |
| Pain points | Paper/spreadsheets, lost invoices, no client history, tax headaches |
| Budget | $80–150/mo or $800–1,500/year |

### Competitive positioning

We compete on **simplicity + local trust + Quebec compliance**, not feature count.

Known alternatives: Shop-Ware, AutoLeap, Mitchell, Garage Hive, paper + Excel.

**Our edge:** French-first, GST/QST built-in, data stays local, founder installs and answers the phone.

---

## Architecture direction (locked)

```
┌─────────────────────────────────────────┐
│  Garage (Montreal)                      │
│  ┌───────────────────────────────────┐  │
│  │ MoMech (local Node.js + SQLite)   │  │
│  │ Works 100% offline day-to-day     │  │
│  └──────────────┬────────────────────┘  │
│                 │ optional nightly       │
└─────────────────┼────────────────────────┘
                  ▼
        Cloud services (Canada region)
        • Licence validation
        • Encrypted backups
        • Update distribution
        • (future) SMS/email relay
```

**Do not pivot to full cloud SaaS until Phase C** unless explicitly requested by the founder.

---

## Business model (locked)

**Hybrid local-first + annual licence:**

| Component | Price range (CAD) | Notes |
|-----------|-------------------|-------|
| Setup & install | $750 – $1,200 one-time | Data import, training, config |
| Annual licence | $900 – $1,400/year | Updates, tax table updates, basic support |
| Optional backup | $15 – $30/mo | Encrypted cloud backup |
| Optional support | $50 – $100/mo | Phone/remote priority support |

Alternative positioning: **$99–149/mo all-in** (subscription framing for marketing).

---

## Current codebase status

As of the last agent session, MoMech has:

| Area | Status |
|------|--------|
| Backend API | ✅ Functional (clients, vehicles, appointments, inventory, financial, work orders, services, dashboard) |
| Frontend SPA | ✅ Functional list/form/detail pages for all modules |
| Database | ✅ SQLite, migrations, seed data |
| Auth | ⚠️ Optional, disabled by default (single-user) |
| i18n / French | ❌ Not started |
| Quebec taxes (GST/QST) | ❌ Flat 8% USD tax only |
| CAD locale | ❌ USD, miles, US formats |
| Licensing | ❌ Not started |
| Backups | ❌ Config exists, no UI/automation |
| Multi-tenant | ❌ Not planned until Phase C |
| Production packaging | ⚠️ Manual npm build |

See [ROADMAP.md](./ROADMAP.md) for what to build next.

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [NORTH_STAR.md](./NORTH_STAR.md) | This file — vision and locked decisions |
| [ROADMAP.md](./ROADMAP.md) | Phased development plan with checkboxes |
| [MONTREAL_REQUIREMENTS.md](./MONTREAL_REQUIREMENTS.md) | Quebec localization, legal, tax, locale specs |
| [BUSINESS_AND_GTM.md](./BUSINESS_AND_GTM.md) | Go-to-market, pricing, sales process |
| [AGENT_PLAYBOOK.md](./AGENT_PLAYBOOK.md) | How autonomous agents should work on this repo |
| [FOUNDER_TASKS.md](./FOUNDER_TASKS.md) | What the human founder does (pilots, Twilio, etc.) |
| [api.md](./api.md) | API endpoint reference |

---

## Guiding principles for all development

1. **French is not optional** — every user-facing string must eventually go through i18n.
2. **Quebec tax is not a config tweak** — GST and QST are separate line items with their own rules.
3. **Local-first** — never require internet for core shop operations.
4. **Small diffs** — match existing code patterns; don't over-engineer.
5. **Pilot-driven** — build what real Montreal garages need, validated by founder's pilot connections.
6. **Agent-autonomous** — agents pick the next unchecked ROADMAP item unless blocked on `[FOUNDER]`.
7. **Test before PR** — `npm test`, `npm run lint`, `npm run build:css:once` must pass.

---

## Success metrics

### Phase A (pilot-ready)
- [ ] 1 real Montreal garage using MoMech daily
- [ ] French invoice PDF accepted by their comptable
- [ ] GST/QST calculated correctly on test invoices
- [ ] Automated daily backup running

### Phase B (sellable)
- [ ] 3–5 paying garages
- [ ] Licence enforcement working
- [ ] French onboarding doc / video complete
- [ ] Founder can install a new shop in < 2 hours

### Phase C (scale)
- [ ] 20+ garages in Quebec
- [ ] Recurring revenue covers hosting + support time
- [ ] Consider multi-location or light cloud sync

---

## Locked technical defaults (Montreal)

When implementing localization, use these defaults:

```env
DEFAULT_LOCALE=fr-CA
FALLBACK_LOCALE=en-CA
DEFAULT_CURRENCY=CAD
DEFAULT_TIMEZONE=America/Montreal
GST_RATE=0.05
QST_RATE=0.09975
DISTANCE_UNIT=km
```

---

## How to use this document

**Founder:** Review quarterly. Update locked decisions here before agents start new phases.

**Agents:** Read this + [AGENT_PLAYBOOK.md](./AGENT_PLAYBOOK.md) + [ROADMAP.md](./ROADMAP.md) at the start of every session. Pick the highest-priority unchecked item you are not blocked on. Update ROADMAP checkboxes in your PR.

---

*Last updated: 2026-06-30*
