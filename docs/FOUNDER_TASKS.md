# Founder Tasks

Human-only tasks that autonomous agents cannot complete. The founder (Montreal-based programmer) handles these; agents should create scaffolding and document what's needed.

Reference: [NORTH_STAR.md](./NORTH_STAR.md) | [ROADMAP.md](./ROADMAP.md)

---

## How to use this file

- **Founder:** Check off items as you complete them. Agents read this to know what's unblocked.
- **Agents:** Do not attempt these tasks. Create `.env.example` entries, UI placeholders, and docs instead. Note in PR if agent work is waiting on a founder task.

---

## Business & legal

- [ ] Register business / NEQ (if selling commercially)
- [ ] Register for GST/QST on software sales
- [ ] Consult lawyer on Law 25 privacy requirements
- [ ] Approve privacy policy text (French) — agent can draft outline
- [ ] Approve terms of service (French) — agent can draft outline
- [ ] Approve software licence agreement for shops
- [ ] Set up business bank account for receiving payments
- [ ] Choose payment method for shops (e-transfer, Stripe, cheque)

---

## Pilot garage (Phase A gate)

- [ ] Identify first pilot garage in Montreal
- [ ] Pitch MoMech (use demo on laptop)
- [ ] Agree on pilot terms (free for 2–4 weeks)
- [ ] Install MoMech on shop PC (or bring mini PC)
- [ ] Provide client/vehicle data for import (CSV export from their current system or paper)
- [ ] Train owner + 1 employee (2–3 hours, in French)
- [ ] Validate invoice PDF with their comptable
- [ ] Fill in [PILOT_FEEDBACK.md](./PILOT_FEEDBACK.md) after 2 weeks
- [ ] Decide: convert to paying customer or iterate

---

## External services (Phase B)

### Twilio (SMS)
- [ ] Create Twilio account
- [ ] Purchase Canadian phone number (514 or 438)
- [ ] Provide credentials to `.env` on pilot/production installs:
  ```env
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_PHONE_NUMBER=+15145550100
  ```
- [ ] Test SMS delivery to your own phone
- [ ] Confirm CASL compliance approach with pilot shop

### Email (SMTP or transactional)
- [ ] Choose provider (Gmail app password, SendGrid, Mailgun, etc.)
- [ ] Provide credentials:
  ```env
  EMAIL_HOST=
  EMAIL_PORT=587
  EMAIL_USER=
  EMAIL_PASS=
  EMAIL_FROM_NAME=MoMech
  EMAIL_FROM=noreply@votredomaine.com
  ```
- [ ] Test sending French appointment confirmation email

### Cloud backup (Canada)
- [ ] Choose provider (AWS ca-central-1, Backblaze B2, OVH Canada)
- [ ] Create bucket/storage with encryption at rest
- [ ] Provide credentials:
  ```env
  BACKUP_PROVIDER=s3
  BACKUP_BUCKET=momech-backups
  BACKUP_REGION=ca-central-1
  BACKUP_ACCESS_KEY=
  BACKUP_SECRET_KEY=
  BACKUP_ENCRYPTION_KEY=
  ```
- [ ] Test upload and restore cycle

### Licence server (Phase B)
- [ ] Decide: simple static validation or small API on Railway/Fly.io (Canada)
- [ ] Domain for licence API (e.g. `licence.momech.ca`)
- [ ] Provide endpoint URL:
  ```env
  LICENCE_SERVER_URL=https://licence.momech.ca/api/v1
  ```

### Domain & website
- [ ] Register domain (e.g. `momech.ca`, `momechmontreal.com`)
- [ ] Deploy simple French landing page
- [ ] Pricing page with contact form

---

## Tax validation

- [ ] Confirm GST/QST calculation with a comptable:
  - Subtotal $100 → TPS $5.00 → TVQ $10.47 → Total $115.47
  - Is QST calculated on (subtotal + GST)? ✅ standard Quebec
  - Any tax-exempt services for garages?
- [ ] Confirm invoice PDF layout meets their needs
- [ ] Provide GST# and QST# format examples from real garages

---

## Sales & marketing

- [ ] Write or approve French website copy (agent provides outline in SALES_CONTENT_OUTLINE.md)
- [ ] Record 5-minute demo video in French
- [ ] Create onboarding PDF for new shops
- [ ] Join relevant Facebook/LinkedIn groups for Montreal mechanics
- [ ] Ask pilot shop for testimonial (after successful pilot)

---

## Testing (founder hardware)

Agents run automated tests (`npm test`). Founder validates on real setups:

- [ ] Test on Windows 10/11 shop PC (most common)
- [ ] Test on Mac (if any shops use Mac)
- [ ] Test printing invoice PDF to shop printer
- [ ] Test on shop local network (tablet access via browser)
- [ ] Test offline operation (disconnect internet, verify app works)
- [ ] Test backup restore on a fresh machine

---

## When founder completes a task

1. Check the box in this file
2. Commit (or tell agent): "Twilio credentials ready in .env"
3. Agent can then implement the integration in next session

---

## Contact & escalation

If an agent is stuck and no ROADMAP P0/P1 is unblocked:
- Implement tests, docs, or seed data improvements
- Fix open bugs
- Do not idle — there's always lint, tests, or docs to improve

---

*Last updated: 2026-06-30*
