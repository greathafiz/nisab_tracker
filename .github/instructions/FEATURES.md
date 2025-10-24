# Nisab & Zakat Tracker – Feature List (MVP + Next Steps)

## Tech Stack

- Next.js 15+ (App Router)
- TailwindCSS (minimal stone/gray/zinc palette)
- Shadcn UI components
- Postgres
- NextAuth.js for authentication
- Hijri calendar library for accurate Islamic dates

## 🎯 MVP Features (for launch)

### 1. Nisab & Related Values

- Show current **Nisab threshold** in the user’s local currency.
- Auto-detect user currency (system/IP) with option to switch to any currency.
- Show values updated daily (or hourly).
- Cards for:
  - **Nisab (Gold & Silver)**
  - **Dowry (Mahr al-Fatimah)**
  - **Diyyah (Blood money)**
  - **Theft threshold**

### 2. Zakat Calculator

- User inputs wealth categories:
  - Cash
  - Gold/Silver
  - Other assets
- System checks nisab threshold and calculates Zakat due (2.5%).
- Simple, clean output: total wealth, nisab threshold, zakat amount.

### 3. Accounts & Reminders

- User signup/login (Google or email).
- **User Flow**: After signup → User enters their Zakat start date (accepts both Hijri & Gregorian, converts to Hijri)
- Calculate next Zakat due date (e.g., "24 Ramadan 1447 (March 15, 2026)")
- **Privacy**: Don't store actual wealth amounts - only track due dates for reminders
- **Hijri Calendar**: Handle variable month lengths (29/30 days) and moon sighting variations
- Track zakat history per year (payment confirmations, not amounts)
- Email reminders:
  - 30 days before due date
  - 7 days before
  - 3 days before
  - 1 day before
  - On the due date

---

## 📈 Additional Features (Phase 2 / Nice-to-Have)

### 4. Cost of Hajj

- Show estimated **cost of Hajj** in user’s currency.
- Based on average ticket + package data (e.g., official sources, or fixed formula for MVP).

### 5. Historical Data

- Display table/graph of:
  - Nisab
  - Dowry
  - Diyyah
  - Theft threshold
- Default view: last **7 days**
- User can switch to:
  - Last 30 days
  - Last 6 months
  - Last 1 year

### 6. Expanded Zakat Calculator

- Add livestock (camels, cattle, sheep/goats).
- Add agricultural produce.
- Add business assets & trade goods.

### 7. Education & FAQs

- Short, easy-to-read explanations:
  - What is Nisab?
  - Why Zakat is important
  - Gold vs Silver nisab opinions
  - Eligible assets
- Link to authentic references.

### 8. Charity Integration

- Suggest trusted zakat organizations.
- (Later) direct donation/payment integration.

---

## 🚀 Future-Proofing Ideas

- Mobile app (React Native).
- Push notifications.
- Multi-language support (English, Arabic, Hausa, Urdu, etc).
- Community features (zakat impact stories, shared reminders).
