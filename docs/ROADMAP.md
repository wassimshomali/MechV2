# MoMech Development Roadmap

Phased plan aligned with [NORTH_STAR.md](./NORTH_STAR.md). Agents should work top-to-bottom within the current phase unless the founder reprioritizes.

**Legend:**
- `[ ]` — not started
- `[~]` — in progress
- `[x]` — done
- `[FOUNDER]` — requires human action; agent should skip and note in PR

---

## Phase 0 — Foundation ✅ (complete)

Core app scaffold merged to feature branch.

- [x] Express API with SQLite migrations
- [x] All CRUD routes (clients, vehicles, appointments, inventory, financial, work orders, services)
- [x] SPA frontend with list/form/detail pages
- [x] Seed data for development
- [x] Jest integration tests + GitHub Actions CI
- [x] Built Tailwind CSS (no CDN)
- [x] `.env.example`, API docs, README

---

## Phase A — Montreal pilot-ready

**Goal:** One real Montreal garage can use MoMech daily with French invoices and correct Quebec taxes.

### A1. Internationalization (i18n) — P0

- [x] Add i18n system (`src/i18n/` — recommend lightweight custom or `i18next`)
- [x] Extract all UI strings from components to locale files
- [x] Create `fr-CA.json` (primary) and `en-CA.json` (fallback)
- [x] Language switcher in header (default: French)
- [x] French labels for all form fields, buttons, errors, notifications
- [x] French status labels (scheduled → planifié, completed → terminé, etc.)
- [x] Update `index.html` `<html lang="fr-CA">`

**Acceptance:** Entire UI readable in French with no hardcoded English strings in components.

### A2. Canadian locale — P0

- [x] Change default currency to CAD in `config/app.js`
- [x] Update `formatCurrency()` for `fr-CA` locale (`1 234,56 $`)
- [x] Change distance display from miles to kilometres
- [x] Date format: `DD/MM/YYYY` for display, ISO for storage
- [x] Phone validation: Canadian `(514) 555-1234` format
- [x] Postal code validation: `A1A 1A1`
- [x] Timezone default: `America/Montreal`
- [x] Update seed data with Montreal addresses, Quebec plates, km

**Acceptance:** Dashboard and client detail show km, CAD, Montreal-style dates.

### A3. Quebec sales tax (GST + QST) — P0

- [ ] Replace flat `TAX_RATE` with `GST_RATE` (5%) and `QST_RATE` (9.975%)
- [ ] Invoice model: separate `gst_amount` and `qst_amount` columns (migration)
- [ ] Invoice API: calculate GST on subtotal, QST on subtotal + GST (Quebec standard)
- [ ] Invoice UI: show GST and QST as separate lines
- [ ] Business profile: fields for GST# and QST# (NEQ optional)
- [ ] Tax-exempt flag per line item (future-proof)
- [ ] Remove all USD references from financial module

**Acceptance:** Test invoice for $100 labour shows GST $5.00 + QST $10.47 = $115.47 total.

> **Tax note:** Verify QST-on-GST calculation with founder's comptable before pilot. Document assumption in code comments.

### A4. Quebec invoice PDF — P0

- [ ] Add PDF generation library (e.g. `pdfkit` or `puppeteer`)
- [ ] French invoice template:
  - Garage name, address, GST#/QST#
  - Client name, address
  - Line items (description, qty, price, total)
  - Subtotal, TPS (GST), TVQ (QST), total
  - Payment terms, invoice number, date
- [ ] `GET /api/v1/financial/invoices/:id/pdf` endpoint
- [ ] Download button on invoice detail page
- [ ] Distinction between **Devis** (estimate) and **Facture** (invoice) — status or type field

**Acceptance:** PDF downloads in French with correct tax lines; founder validates with comptable.

### A5. Business profile — P1

- [ ] `settings` or `business_profile` table (migration)
- [ ] Fields: legal name, trade name, address, phone, email, GST#, QST#, NEQ, logo path
- [ ] Settings page in UI (`/settings`)
- [ ] Business info appears on invoices and PDFs
- [ ] Default tax rates configurable (but pre-filled with Quebec rates)

### A6. Automated backup — P1

- [ ] `npm run backup` script — copies SQLite DB to timestamped file
- [ ] Optional: encrypt backup with AES (key from env)
- [ ] Scheduled backup via cron or node-cron (daily at 2 AM)
- [ ] Backup retention policy (keep last 30 days local)
- [ ] Settings UI: backup location, last backup time, manual backup button
- [ ] Restore from backup (admin-only, with confirmation)

**Acceptance:** Database backs up daily; founder can restore on test machine.

### A7. Production installer — P1

- [ ] `npm run build` produces complete `dist/` ready to serve
- [ ] Install script or README for Windows/Mac/Linux shop PC
- [ ] Auto-start on boot (systemd service file for Linux; instructions for Windows)
- [ ] Default port 3001, accessible on local network
- [ ] First-run wizard: business name, language, tax numbers

### A8. Pilot preparation — [FOUNDER]

- [ ] `[FOUNDER]` Identify 1 pilot garage in Montreal
- [ ] `[FOUNDER]` Install MoMech on shop PC
- [ ] `[FOUNDER]` Import their client/vehicle data (CSV or manual)
- [ ] `[FOUNDER]` Validate invoice PDF with their comptable
- [ ] `[FOUNDER]` Collect feedback after 2 weeks of daily use
- [ ] Agent: create `docs/PILOT_FEEDBACK.md` template for founder to fill in

---

## Phase B — Sellable product

**Goal:** 3–5 paying garages with licence enforcement and support infrastructure.

### B1. Licensing — P0

- [ ] Licence key generation (annual, tied to shop ID)
- [ ] Local licence file validation on startup
- [ ] Grace period (7 days) if validation server unreachable
- [ ] Optional: phone-home to licence server (Canada-hosted)
- [ ] UI: licence status in settings (active / expiring / expired)
- [ ] Expired licence: read-only mode (view data, no new records)

### B2. Cloud backup service — P1

- [ ] Upload encrypted backup to S3-compatible storage (ca-central-1)
- [ ] `[FOUNDER]` Set up AWS/Backblaze account in Canada region
- [ ] Backup credentials via env vars (not in repo)
- [ ] UI: backup status, last cloud sync, restore from cloud
- [ ] Founder sells as optional $15–30/mo add-on

### B3. Update distribution — P1

- [ ] Version check endpoint (or GitHub releases)
- [ ] In-app notification: "Update available"
- [ ] Update script: download, backup, migrate, restart
- [ ] Changelog in French

### B4. Data import — P1

- [ ] CSV import for clients (name, phone, email, address)
- [ ] CSV import for vehicles (client, make, model, year, plate, vin)
- [ ] Import wizard UI with column mapping
- [ ] Validation and error report (French)

### B5. Accounting export — P2

- [ ] Export invoices to CSV (comptable-friendly)
- [ ] Export payments to CSV
- [ ] Date range filter on exports
- [ ] (Future) QuickBooks / Sage integration

### B6. Communications — P2

- [ ] `[FOUNDER]` Set up Twilio account (Canadian number)
- [ ] SMS appointment reminders (French templates)
- [ ] `[FOUNDER]` Set up email SMTP (or SendGrid/Mailgun)
- [ ] Email appointment confirmations (French templates)
- [ ] CASL-compliant opt-in on client record

### B7. Privacy & legal — P1

- [ ] `[FOUNDER]` Consult on Law 25 requirements
- [ ] Privacy policy page (French) — `/legal/confidentialite`
- [ ] Terms of service (French) — `/legal/conditions`
- [ ] Data export for client (right of access)
- [ ] Data deletion for client (right to erasure)
- [ ] Privacy settings in app (retention period, consent flags)

### B8. Sales materials — [FOUNDER]

- [ ] `[FOUNDER]` Simple French website (momech.ca or similar)
- [ ] `[FOUNDER]` Pricing page
- [ ] `[FOUNDER]` Demo video (5 min, French)
- [ ] `[FOUNDER]` Onboarding PDF for new shops
- [ ] Agent: provide content outline in `docs/SALES_CONTENT_OUTLINE.md`

### B9. Multi-user auth — P2

- [ ] Re-enable auth middleware (optional per shop)
- [ ] Roles: owner, manager, mechanic, receptionist
- [ ] Permission matrix (who can see financials, delete records, etc.)
- [ ] Login page in French

---

## Phase C — Scale (future)

Only start after 20+ paying garages or explicit founder request.

- [ ] Multi-location support (one owner, multiple shops)
- [ ] Light cloud sync between locations
- [ ] Customer portal (view invoices, book appointments)
- [ ] Mobile app (PWA or native)
- [ ] Parts supplier integration
- [ ] SAAQ inspection workflow templates
- [ ] Winter service packages (seasonal templates)
- [ ] Multi-tenant SaaS option (if market demands)

---

## Agent priority queue

When starting a new session, pick the **first unchecked P0 item** in the **earliest incomplete phase**:

```
Phase A: A1 → A2 → A3 → A4 → A5 → A6 → A7
Phase B: B1 → B4 → B7 → B2 → B3 → B5 → B6 → B9
```

Skip any `[FOUNDER]` task. If blocked on `[FOUNDER]`, move to next agent task and note blocker in PR.

After completing a task:
1. Check the box in this file
2. Run tests and lint
3. Commit, push, update PR
4. Note what you did and what's next in PR description

---

*Last updated: 2026-06-30*
