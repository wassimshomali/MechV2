# Business Model & Go-to-Market

Reference: [NORTH_STAR.md](./NORTH_STAR.md)

---

## Value proposition

**Pour les garages indépendants de Montréal** qui en ont assez du papier et des chiffriers, MoMech est un logiciel de gestion simple qui fonctionne **chez vous, en français, avec les taxes du Québec** — sans monthly bill surprise d'une grosse compagnie américaine.

**For Montreal independent garages** tired of paper and spreadsheets, MoMech is simple management software that runs **locally, in French, with Quebec taxes** — without surprise bills from a big American company.

---

## Target market

| Segment | Fit |
|---------|-----|
| 1–3 bay independent garage | ✅ Primary |
| 4–5 bay with 1 receptionist | ✅ Primary |
| Dealership service department | ❌ Too complex needs |
| Mobile mechanic (no shop) | ⚠️ Secondary (lighter needs) |
| Chain / franchise | ❌ Phase C at earliest |

### Montreal geography (expansion order)
1. Island of Montreal (Plateau, Rosemont, Hochelaga, St-Laurent, etc.)
2. Laval
3. South Shore (Longueuil, Brossard, St-Hubert)
4. North Shore (Laval done, then Terrebonne, Repentigny)
5. Rest of Quebec (Phase B/C)

---

## Pricing (locked)

### Recommended: Hybrid model

| Item | Price (CAD) | Billing |
|------|-------------|---------|
| **Installation & formation** | $750 – $1,200 | One-time |
| **Licence annuelle** | $900 – $1,400 | Annual |
| **Sauvegarde cloud** (optionnel) | $15 – $30/mois | Monthly |
| **Support prioritaire** (optionnel) | $50 – $100/mois | Monthly |

### Alternative: All-in subscription

| Plan | Price (CAD) | Includes |
|------|-------------|----------|
| **MoMech Essentiel** | $99/mois | Software + updates + backup + email support |
| **MoMech Pro** | $149/mois | Above + phone support + priority updates |

### What's included in annual licence
- Software updates (features + bug fixes)
- Quebec tax rate updates
- Email support (48h response)
- Database migration support on update

### What's NOT included (bill separately or upsell)
- On-site visits beyond initial install
- Data migration from complex legacy systems
- Custom integrations
- Hardware (shop PC / mini PC)

---

## Sales process

### Step 1: Lead (founder-driven)
- Word of mouth in Montreal garage community
- Facebook groups (mécaniciens Montréal, entrepreneurs Québec)
- Direct visit to garages with paper clipboard visible
- Simple French landing page

### Step 2: Demo (30 min, in French)
- Show on laptop: client → véhicule → rendez-vous → facture PDF
- Emphasize: "Vos données restent ici, pas dans le cloud américain"
- Show French invoice with TPS/TVQ

### Step 3: Pilot (2–4 weeks, free or $200)
- Install on their PC
- Import their clients (CSV or manual)
- Founder available by phone for questions
- Collect feedback in `docs/PILOT_FEEDBACK.md`

### Step 4: Close
- Annual licence + setup fee
- Sign simple service agreement (founder provides)
- Schedule install / training (2–3 hours)

### Step 5: Onboard
- Install MoMech
- Configure business profile (name, GST#, QST#)
- Import data
- Train owner + 1 employee
- Verify first real invoice

### Step 6: Retain
- Check in at 30 days and 90 days
- Annual renewal 30 days before expiry
- Offer backup add-on if not already subscribed

---

## Competitive comparison (for sales conversations)

| | MoMech | Shop-Ware / AutoLeap | Paper + Excel |
|--|--------|---------------------|---------------|
| French | ✅ Native | ⚠️ Partial | ✅ |
| Quebec taxes | ✅ Built-in | ⚠️ Manual config | ❌ Manual |
| Data location | ✅ Local | ☁️ US cloud | ✅ Local |
| Price | ~$100/mo | $200–400+/mo | Free (but costly in time) |
| Offline | ✅ | ❌ | ✅ |
| Support | Founder direct | Ticket system | None |
| Setup help | ✅ In person | Remote only | N/A |

---

## Hardware bundle (optional upsell)

Sell a "MoMech Kit" for shops without a good office PC:

| Item | Est. cost | Sell price |
|------|-----------|------------|
| Intel NUC or similar mini PC | $400–600 | $750–900 |
| Monitor (if needed) | $150 | $200 |
| UPS battery backup | $80 | $120 |
| Install + config | — | included in setup fee |

---

## Revenue projections (conservative)

| Milestone | Shops | Avg annual revenue/shop | ARR |
|-----------|-------|------------------------|-----|
| Pilot | 1 | $0 | $0 |
| Early adopters | 5 | $1,200 | $6,000 |
| Year 1 target | 15 | $1,200 | $18,000 |
| Year 2 target | 40 | $1,200 | $48,000 |

Plus setup fees: ~$1,000 × new shops/year.

This is a side-business realistic target for a solo Montreal developer, not a venture-scale play — and that's fine.

---

## Legal (founder handles)

- [ ] Register business (NEQ) if not already
- [ ] GST/QST registration for your software sales
- [ ] Service agreement template (French)
- [ ] Privacy policy (French, Law 25 compliant)
- [ ] Software licence agreement
- [ ] Consider liability insurance for software sold to businesses

---

## Marketing materials needed (founder)

See [SALES_CONTENT_OUTLINE.md](./SALES_CONTENT_OUTLINE.md) for content the agent can draft; founder reviews and publishes.

---

*Last updated: 2026-06-30*
