# Montreal & Quebec Requirements

Technical specification for localizing MoMech. Agents implementing Phase A should follow this document precisely.

Reference: [NORTH_STAR.md](./NORTH_STAR.md) | [ROADMAP.md](./ROADMAP.md)

---

## 1. Language (i18n)

### Primary locale
- **Default:** `fr-CA` (French Canadian)
- **Fallback:** `en-CA` (English Canadian)
- User can switch; preference stored in localStorage and/or business settings

### What must be translated
- All UI labels, buttons, placeholders, tooltips
- Form validation messages
- API error messages returned to frontend (or error codes mapped client-side)
- Notification toasts
- PDF invoices and estimates
- Email/SMS templates (Phase B)
- Empty states ("Aucun client trouvé")
- Status and priority labels
- Day/month names in calendar
- Onboarding and help text

### French terminology (garage domain)

| English | French (use this) |
|---------|-------------------|
| Client | Client |
| Vehicle | Véhicule |
| Appointment | Rendez-vous |
| Work order | Bon de travail |
| Invoice | Facture |
| Estimate | Devis |
| Payment | Paiement |
| Inventory | Inventaire |
| Dashboard | Tableau de bord |
| Service | Service |
| Mechanic | Mécanicien |
| License plate | Plaque d'immatriculation |
| Mileage | Kilométrage |
| Oil change | Changement d'huile |
| Brake service | Service de freins |
| Scheduled | Planifié |
| Confirmed | Confirmé |
| In progress | En cours |
| Completed | Terminé |
| Cancelled | Annulé |
| Low stock | Stock bas |
| Save | Enregistrer |
| Cancel | Annuler |
| Delete | Supprimer |
| Search | Rechercher |
| Add | Ajouter |
| Edit | Modifier |
| Back | Retour |

### i18n implementation guidance

```
src/i18n/
├── index.js          # t('key') function, locale loader
├── fr-CA.json        # Primary translations
└── en-CA.json        # Fallback translations
```

- Use keys like `clients.form.firstName` not raw French in components
- Date/number formatting via `Intl` with active locale
- Do not use Google Translate for production strings — write proper French

---

## 2. Currency & numbers

### Currency
- **ISO 4217:** CAD
- **Symbol:** `$` suffix in French (`123,45 $`) or prefix in English (`$123.45`)
- **Locale formatting:**
  - fr-CA: `1 234,56 $` (space thousands, comma decimal)
  - en-CA: `$1,234.56`

### Implementation
```javascript
// fr-CA
new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(1234.56)
// → "1 234,56 $"
```

### Remove
- All `USD` references in `config/app.js`, formatters, seed data, and UI

---

## 3. Taxes (GST + QST)

### Rates (2026)
| Tax | Rate | French label | English label |
|-----|------|--------------|---------------|
| GST (TPS) | 5% | TPS (5%) | GST (5%) |
| QST (TVQ) | 9.975% | TVQ (9,975%) | QST (9.975%) |

### Calculation (standard Quebec)

```
subtotal = sum of line items
gst_amount = subtotal × 0.05
qst_amount = (subtotal + gst_amount) × 0.09975
total = subtotal + gst_amount + qst_amount
```

**Example:** $100.00 subtotal
- TPS: $5.00
- TVQ: $10.47 (on $105.00)
- Total: $115.47

> **Agent note:** Confirm this matches founder's comptable guidance. Some items may be tax-exempt — add `is_tax_exempt` on line items for future use.

### Invoice display (French)

```
Sous-total                    100,00 $
TPS (5%)                        5,00 $
TVQ (9,975%)                   10,47 $
─────────────────────────────────────
TOTAL                         115,47 $
```

### Business tax registration fields
- **GST#** (TPS): format `123456789 RT 0001`
- **QST#** (TVQ): format `1234567890 TQ 0001`
- **NEQ** (Quebec business number): optional, 10 digits

Store on business profile; display on invoices.

### Database migration needed
```sql
ALTER TABLE invoices ADD COLUMN gst_amount REAL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN qst_amount REAL DEFAULT 0;
-- tax_rate column may become deprecated or split into gst_rate + qst_rate
```

---

## 4. Locale & formats

| Field | Format | Example |
|-------|--------|---------|
| Date (display) | DD/MM/YYYY | 30/06/2026 |
| Date (storage/API) | ISO 8601 | 2026-06-30 |
| Time | 24h or 12h per setting | 14:30 or 2:30 PM |
| Phone | (XXX) XXX-XXXX | (514) 555-1234 |
| Postal code | A1A 1A1 | H2X 1Y4 |
| Distance | Kilometres | 45 000 km |
| Timezone | America/Montreal | EST/EDT |

### Validation regex
```javascript
// Canadian postal code
/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/

// Canadian phone (loose)
/^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
```

---

## 5. Invoice & document requirements

### Facture (invoice) must include
- Garage legal name and address
- GST# and QST# (if registered)
- Invoice number (sequential)
- Invoice date
- Client name and address
- Description of goods/services
- Subtotal, TPS, TVQ, total
- Payment terms (e.g. "Net 30 jours")

### Devis (estimate) 
- Same layout but marked "DEVIS" / "ESTIMATE"
- Not a tax document until converted to facture
- Add `document_type` enum: `estimate | invoice`

### Records retention
- Quebec requires businesses keep records 6 years
- MoMech should not auto-delete invoices before 6 years
- Soft-delete only; hard-delete requires admin confirmation

---

## 6. Privacy (Law 25)

MoMech stores personal information: names, phones, emails, addresses, vehicle VINs, plates, service history.

### Minimum compliance (Phase B)
- Privacy policy in French (founder provides legal text)
- Consent checkbox for communications (SMS/email) on client form
- Ability to export all data for a client (JSON/CSV)
- Ability to anonymize/delete a client on request
- Document where data is stored (local PC at garage)
- Breach notification procedure (document only; founder handles)

### Data residency
- **Default:** all data local at garage (best for Law 25 story)
- **Cloud backups:** must be in Canada (ca-central-1 or Canadian provider)
- Do not store Quebec customer data on US servers without disclosure and consent

### Agent implementation
- Add `consent_sms` and `consent_email` booleans on clients table
- Add `GET /api/v1/clients/:id/export` endpoint
- Add `POST /api/v1/clients/:id/anonymize` endpoint (soft-delete PII)

---

## 7. Communications (Phase B — founder sets up accounts)

### SMS (Twilio)
- `[FOUNDER]` Register Twilio, get Canadian number (514/438/450)
- French templates:
  - Reminder: "Rappel: votre rendez-vous chez {garage} est le {date} à {heure}."
  - Confirmation: "Votre rendez-vous est confirmé pour le {date} à {heure}."
- CASL: only send if `consent_sms = true`

### Email
- `[FOUNDER]` Configure SMTP or transactional email service
- French templates for invoice sent, appointment confirmation
- CASL: only send if `consent_email = true`

### Env vars (not in repo)
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
```

---

## 8. Quebec-specific workflows (Phase C / nice-to-have)

Document for future; do not implement unless founder requests.

| Feature | Notes |
|---------|-------|
| SAAQ inspection tracking | Annual inspection due dates |
| Winter tire season | Seasonal reminder campaigns (Nov–Apr) |
| Pneus hiver / été | Tire storage tracking |
| Rustproofing | Antirouille service template |
| Quebec vehicle makes mix | More Hyundai, Toyota, Nissan, VW — seed data |
| French automotive terms | Use Canadian French, not European |

---

## 9. Seed data (Montreal)

When updating seeds, use realistic Montreal data:

- **Cities:** Montréal, Laval, Longueuil, Brossard, Terrebonne
- **Postal codes:** H1A–H9X, J4G, etc.
- **Area codes:** 514, 438, 450
- **Addresses:** Rue Sainte-Catherine, Boulevard René-Lévesque, etc.
- **Plates:** Quebec format (e.g. ABC 123)
- **Names:** Mix of French and English Canadian names
- **Invoices:** CAD with GST/QST
- **Appointments:** Relative dates using `date('now')`

---

## 10. Configuration reference

### Environment variables (Montreal defaults)

```env
# Locale
DEFAULT_LOCALE=fr-CA
FALLBACK_LOCALE=en-CA

# Currency & tax
DEFAULT_CURRENCY=CAD
GST_RATE=0.05
QST_RATE=0.09975

# Timezone
TZ=America/Montreal

# Business (set per shop during onboarding)
BUSINESS_NAME=
BUSINESS_GST_NUMBER=
BUSINESS_QST_NUMBER=
BUSINESS_NEQ=
```

### config/app.js changes needed

```javascript
FINANCIAL: {
  DEFAULT_CURRENCY: 'CAD',
  CURRENCY_SYMBOL: '$',
  GST_RATE: 0.05,
  QST_RATE: 0.09975,
  // Remove single TAX_RATE
},
UI: {
  LANGUAGE: 'fr-CA',
  TIMEZONE: 'America/Montreal',
  DATE_FORMAT: 'DD/MM/YYYY',
  DISTANCE_UNIT: 'km',
},
```

---

## 11. Testing checklist (Montreal)

Before marking Phase A complete, verify:

- [ ] UI loads in French by default
- [ ] Currency shows `1 234,56 $` format
- [ ] Mileage shows `km` not `mi`
- [ ] Invoice for $100 shows TPS $5.00 + TVQ $10.47 = $115.47
- [ ] PDF invoice is in French with tax numbers
- [ ] Phone validation accepts (514) 555-1234
- [ ] Postal code validation accepts H2X 1Y4
- [ ] Dates display as DD/MM/YYYY
- [ ] Timezone shows correct Montreal time on appointments
- [ ] No USD or US-specific strings remain in UI

---

*Last updated: 2026-06-30*
