# Velora — Product Blueprint

**Phase:** NEXT  
**Version:** 1.0 (Strategic)  
**Tagline:** Your AI Personal CFO — decisions, not spreadsheets.

---

## 1. Product Vision

**Velora transforms financial data into life decisions.**

Users do not manage money. They make better life decisions — buy the apartment, survive the wedding, escape debt, achieve independence — with a trusted AI CFO that tells them exactly what to do next and why.

Velora is **not** a budgeting app, **not** a neobank, **not** an investment platform. It is a **decision intelligence layer** on top of personal finance.

---

## 2. Core Value Proposition

### For Users

> "Tell me if I'm on track for the life I want — and what to do if I'm not."

### Value Stack

| Layer | User Gets |
|-------|-----------|
| Clarity | One answer: on track / at risk / off track |
| Direction | One primary action per week |
| Confidence | Plain Hebrew explanation, no jargon |
| Foresight | "If you continue / if you change X" scenarios |
| Companion | AI CFO available 24/7, remembers your context |

### Differentiation

| Competitor Pattern | Velora Pattern |
|--------------------|----------------|
| Show all transactions | Show one decision |
| User categorizes spending | System detects anomalies |
| User sets budget limits | CFO recommends adjustments |
| Charts and reports | Verdicts and actions |
| Financial literacy required | Zero literacy required |

---

## 3. Target Users

### Primary Persona: "The Life Builder" (25–40, Israel)

- Salaried household, ₪12K–₪25K net monthly
- Has a concrete life goal (apartment, wedding, car)
- Overwhelmed by financial apps; wants answers not tools
- Willing to pay for clarity and peace of mind

### Secondary Persona: "The Recovery Seeker"

- In debt or negative monthly cashflow
- Needs escape plan, not shame
- High urgency, high retention if helped

### Tertiary Persona: "The Optimizer" (future premium)

- Already saves; wants scenario planning and tax-aware tips
- Higher LTV, lower volume

### Anti-Persona (not now)

- Day traders / investors
- Small business owners (B2B CFO is V2+)
- Power users who want raw Excel export

---

## 4. User Journeys

### Journey 1: First Decision (Activation)

```
Discover → Life Context (3–5 min) → First Verdict + Action → Account Created
                                              ↓
                                    "Save ₪920 more/month to hit apartment by 2031"
```

**Success metric:** User receives first actionable decision within 5 minutes.

### Journey 2: Weekly CFO Brief (Retention)

```
Push/email: "Your week in one decision"
     ↓
Open app → See updated track status → Accept / dismiss / ask why
     ↓
Proof loop: "You saved ₪400 extra — 2 weeks closer to goal"
```

**Success metric:** WAU/MAU > 40%.

### Journey 3: Life Event (Expansion)

```
User: "We're getting married in 18 months"
     ↓
CFO recalculates all plans → New primary decision
     ↓
Optional: premium scenario pack
```

### Journey 4: Crisis (Trust)

```
Expense spike detected → CFO alert (not panic)
     ↓
"Your food spending jumped 18%. One-time or new pattern?"
     ↓
Adjusted plan with options
```

### Journey 5: Upgrade (Monetization)

```
Free: 1 life plan, weekly brief, 5 AI questions/month
     ↓
Hit limit or want scenarios / Open Banking sync
     ↓
Velora Plus: unlimited AI, multi-scenario, bank sync, partner sharing
```

---

## 5. Monetization Strategy

### Model: Freemium → Subscription

| Tier | Price (ILS/mo) | Includes |
|------|----------------|----------|
| **Free** | ₪0 | 1 life plan, decision home, 5 AI msgs/mo, manual data entry |
| **Plus** | ₪29–49 | Unlimited AI, 3 life plans, scenarios, weekly brief, export |
| **Family** | ₪59–79 | 2 adults, shared household view, partner decisions |
| **Pro** (V2) | ₪99+ | Open Banking sync, tax insights, priority support |

### Revenue Principles

- Charge for **decisions and clarity**, not data storage
- Free tier must deliver real value (first decision free)
- Upgrade trigger = **depth** (scenarios, sync, unlimited AI), not basic access
- B2B2C later: employee benefit via HR/insurance partners (V2)

### Unit Economics Target (V1)

- CAC < ₪80 (content + referral)
- LTV > ₪400 (12+ month retention at Plus)
- Conversion free→paid: 8–12%

---

## 6. AI Strategy

### Positioning

AI is not a feature. **AI is the CFO.**

### Architecture: Tool-Augmented LLM

```
User message
    ↓
Context assembly (profile, plans, transactions, history)
    ↓
LLM with structured tools:
  - get_financial_snapshot()
  - simulate_scenario(params)
  - get_goal_status()
  - recommend_action()
    ↓
Guardrailed response (Hebrew, plain, actionable)
    ↓
Optional: executable action card
```

### AI Principles

1. **Never hallucinate numbers** — all figures from tools/services
2. **Always cite reasoning** — "based on your ₪14,500 income and ₪11,260 expenses"
3. **One recommendation primary** — avoid overwhelming lists
4. **Regulatory safe** — not investment advice; savings and planning only
5. **Proactive + reactive** — weekly brief even if user doesn't ask

### Model Strategy

| Phase | Approach |
|-------|----------|
| MVP | GPT-4o-mini / Claude Haiku via API + tool calls |
| V1 | Fine-tuned prompts + eval suite (Hebrew financial) |
| V2 | Domain RAG on Israeli financial norms + partner content |

### Fallback

Rule-based engine (current `advisorService`) remains as offline/fallback when API unavailable.

---

## 7. Feature Hierarchy

### Tier 0 — Identity of Product (Non-negotiable)

- Decision Home (replaces dashboard)
- Life Plan (replaces goals list)
- AI CFO chat (primary, not sidebar)
- Headline / verdict / one action

### Tier 1 — Retention

- User accounts + persistence
- Weekly decision brief
- Proof loop (progress since last visit)
- Notification system

### Tier 2 — Depth

- Scenario simulator ("what if")
- Multi-life-plan support
- Spending anomaly detection
- Conversation memory

### Tier 3 — Growth

- Open Banking (Israeli providers)
- Referral / share decision
- Family/household mode
- Partner integrations (mortgage brokers, wedding planners — affiliate)

### Tier 4 — Platform

- API for partners
- White-label CFO for banks/insurers
- B2B employee wellness

---

## 8. MVP Definition (8–10 Weeks)

**Goal:** Prove users will act on AI-generated financial decisions.

### In Scope

- [ ] Auth (email magic link or Google)
- [ ] MongoDB persistence (user, life plan, snapshots)
- [ ] Redesigned onboarding → first decision (not dashboard)
- [ ] Decision Home (headline + action + status + collapsed detail)
- [ ] AI CFO (OpenAI + tool calls to existing services)
- [ ] Single life plan
- [ ] Manual income/expense entry (simple, not full budget UI)
- [ ] Weekly email brief (basic)
- [ ] Mobile-responsive PWA-ready layout

### Out of Scope (MVP)

- Open Banking
- Multi-life-plan
- Family accounts
- Payment/subscription
- Native apps
- Investment advice

### MVP Success Criteria

| Metric | Target |
|--------|--------|
| Activation (first decision seen) | > 70% of signups |
| D7 retention | > 30% |
| AI message engagement | > 3 msgs/user/week |
| NPS | > 40 |

---

## 9. Version 1.0 (3–4 Months Post-MVP)

- Subscription billing (Stripe / Israeli provider)
- Scenario simulator (3 presets: income change, expense cut, timeline shift)
- Spending categories auto-classified from manual entry
- 3 life plans
- Push notifications
- Improved AI memory (30-day context)
- Onboarding v2 (life context questions)
- Remove all demo-mode dependencies
- Dedicated Velora GitHub + Vercel production deploy

---

## 10. Version 2.0 (6–12 Months)

- Open Banking (Israel — Salt Edge / Finastra / local PSP)
- Real-time transaction sync
- Anomaly detection + proactive alerts
- Family/household CFO
- Affiliate marketplace (mortgage, insurance, savings products — disclosure-compliant)
- Advanced scenarios (Monte Carlo lite, stress tests)
- B2B pilot (1 corporate partner)
- Hebrew voice input (mobile)

---

## 11. Open Banking Roadmap

### Phase OB-0 (MVP): Manual Entry

User enters income + major expenses monthly. CFO works with imperfect data; transparent about limitations.

### Phase OB-1 (V1): CSV Import

Bank export upload → auto-categorize. Bridge between manual and live sync.

### Phase OB-2 (V2): Read-Only Sync

Connect 2–3 major Israeli banks via licensed aggregator. Read transactions only.

### Phase OB-3 (V3): Enriched Intelligence

Recurring detection, subscription audit, income stability scoring.

### Phase OB-4 (V4): Actions (Optional)

Payment initiation only with explicit user consent; likely partner-led, not core product.

### Compliance Notes

- Bank of Israel open banking framework alignment
- PSD2-equivalent consent flows
- Data minimization — sync only what's needed for decisions
- Clear "Velora is not a bank" positioning

---

## 12. Growth Roadmap

### Month 1–2: Foundation

- MVP launch to closed beta (50 users)
- Content: "האם אתה בדרך לדירה?" calculators on social
- Referral: share your decision card

### Month 3–4: Open Beta

- Product Hunt / Geektime / Israeli fintech communities
- Influencer partnerships (personal finance TikTok/IG Hebrew)
- SEO: life goal + financial planning Hebrew keywords

### Month 5–8: Paid Growth

- Meta ads targeting life events (engagement, new job, wedding)
- Conversion optimization on first decision moment
- Plus tier launch

### Month 9–12: Partnerships

- Wedding venues / real estate agents co-marketing
- HR benefit pilots
- Open Banking launch PR

### North Star Metric

**Decisions acted upon per user per month** — not DAU, not page views.

---

## 13. Product Principles (Decision Filter)

Every feature must pass:

1. Does it produce or support a **decision**?
2. Does it reduce **cognitive load**?
3. Would a user **pay** for this clarity?
4. Can the AI **explain** it in one sentence in Hebrew?
5. Does it work with **imperfect data**?

If no to any → defer or cut.

---

*End of Product Blueprint — awaiting approval before implementation.*
