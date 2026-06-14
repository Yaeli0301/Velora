# Velora — Product Gap Analysis

**Phase:** NEXT (Pre-Implementation Review)  
**Date:** June 2026  
**Status:** Strategic assessment — no code changes  
**Core finding:** Velora *talks* like a Personal CFO but *behaves* like a budgeting dashboard with AI lipstick.

---

## Executive Summary

Velora has strong foundational logic (finance scoring, forecast engine, headline generation) buried under a traditional fintech UI pattern: tabs for Budget / Goals / Dashboard / Advisor. This architecture optimizes for **money management**, not **life decision-making**.

The gap between vision and product is not primarily technical — it is **product architecture, information hierarchy, and AI centrality**. Until Velora leads with decisions and treats data as infrastructure, it cannot be sold as an AI Personal CFO.

---

## 1. Current Architecture

### What Exists

```
UI (7 pages, flat nav)
  └── App Router pages: /, /onboarding, /dashboard, /goals, /budget, /advisor
Services (3 pure-TS modules)
  └── financeService, forecastEngine, advisorService
Data
  └── demo-data.ts + localStorage (onboarding only)
```

- Clean separation of services from UI (good foundation).
- No API layer, no database, no auth, no background jobs.
- Client/server split is minimal; most "smart" pages are server-rendered with static demo data.
- Only dashboard + onboarding + advisor use client-side state meaningfully.

### What Should Remain

| Asset | Reason |
|-------|--------|
| `financeService` core logic | Headline, score, insights are the decision kernel |
| `forecastEngine` math | Hidden complexity is correct product instinct |
| `advisorService` interface | Swappable AI backend is good architecture |
| Type system (`types/index.ts`) | Solid domain vocabulary |
| RTL / Hebrew / fintech visual language | Market-fit for Israel |
| Unit test coverage on services | Reduces refactor risk |

### What Should Be Removed

| Asset | Reason |
|-------|--------|
| Flat nav treating Budget / Goals / Dashboard / Advisor as peers | Reinforces "app suite" not "CFO" |
| Static `DashboardPreview` with hardcoded score (78) | Undermines trust; contradicts "real decisions" |
| Duplicate score ring implementations | Technical debt signal |
| README claims (MongoDB, NextAuth, OpenAI, Recharts) without implementation | Creates false product narrative |
| `FEATURE_FLAGS.demoMode` as permanent architecture | Blocks sellability |

### What Should Be Redesigned

| Asset | From → To |
|-------|-----------|
| App structure | Multi-module dashboard → **Decision-first home** |
| Data flow | Demo fixtures → **User financial graph** (even if mocked initially) |
| Onboarding | 3-field wizard → **Life context intake** that feeds AI |
| Advisor | Sidebar chat → **Primary interaction surface** |
| Goals | Standalone CRUD page → **Decision outcomes** embedded in home |
| Budget | Category breakdown page → **Background ingestion + anomaly signals** |

### What Should Be Merged

| Current Modules | Merged Into |
|-----------------|-------------|
| Dashboard + Goals + Forecast cards | **Decision Home** (single screen) |
| Budget categories + transaction list | **Spending Intelligence** (feeds decisions, not browsed) |
| Onboarding + Goal creation | **Life Plan Setup** (one flow) |
| Insights cards + Advisor replies | **Recommendations Engine** (unified output) |

### Blockers to Sellability

1. **No persistence** — user data vanishes on new device/browser.
2. **No identity** — cannot retain, notify, or monetize users.
3. **No real AI** — rule-based chat cannot justify "AI CFO" positioning.
4. **Module sprawl** — users must know where to go; CFO should tell them.
5. **Inconsistent personalization** — onboarding affects dashboard only.
6. **No proof loop** — no "you followed advice → here's what changed."
7. **No monetization hooks** — no premium tier, no conversion moment.
8. **Open Banking absent** — manual/demo data limits trust and retention.
9. **Git repo mismatch** (InterviewIQ) — brand and deployment confusion.

---

## 2. Current User Flows

### Flow A: Landing → Onboarding → Dashboard

```
/ → /onboarding (3 steps) → /dashboard
```

**What works:** Short path to value; headline appears quickly.  
**What's broken:** After onboarding, user lands on a dashboard that looks like Mint/YNAB. No clear "what do I do now?" beyond reading cards.

### Flow B: Nav-driven exploration

```
AppNav: סקירה | יעדים | תקציב | יועץ
```

**What works:** Familiar fintech IA.  
**What's broken:** This is **budget app IA**. A Personal CFO does not ask users to "go check budget." It surfaces decisions proactively.

### Flow C: Advisor chat

```
/advisor → type question → rule-based answer
```

**What works:** Conversational UX exists; suggested questions lower friction.  
**What's broken:** Disconnected from onboarding profile; uses hardcoded demo data; not the primary entry point; no memory, no actions, no follow-up.

### Flow D: Return visit

**What exists:** localStorage onboarding data on dashboard only.  
**What's broken:** No account, no history, no weekly briefing, no reason to return.

### Flow Redesign Target

```
Landing → Life Context (5 min) → Decision Home → [Ask CFO | Act on Recommendation | Simulate Scenario]
         ↓
    Weekly Decision Brief (push/email)
         ↓
    Proof: "Last month you saved X toward Y"
```

---

## 3. Current Onboarding

### What Exists

3-step wizard:
1. Monthly income (presets + custom)
2. Goal type (6 options)
3. Timeline + optional target amount

Saves to `localStorage`, builds personalized goal for dashboard.

### What Should Remain

- Speed (< 2 minutes to first decision)
- Hebrew, plain language
- Goal-type taxonomy (apartment, wedding, etc.)
- Preview of monthly savings needed

### What Should Be Removed

- Treating onboarding as "data collection" only
- No emotional/life context questions
- No commitment moment ("I'm optimizing for X by date Y")

### What Should Be Redesigned

| Step | Current | Target |
|------|---------|--------|
| 1 | Income number | **Life situation** — age band, household, employment stability |
| 2 | Pick a goal icon | **Priority ranking** — "What would change your life if achieved?" |
| 3 | Timeline slider | **Trade-off moment** — "Faster goal vs. lifestyle now" with CFO explanation |
| New 4 | — | **First decision delivered** — not "go to dashboard" but "here's your #1 move this month" |

### Gap

Onboarding does not establish a relationship with the CFO. It fills a form. A Personal CFO onboarding should feel like the first consultation, not account setup.

---

## 4. Current Dashboard

### What Exists

- Headline ("השורה התחתונה") — **strong, keep**
- Financial score ring 0–100
- 4 money metric cards (income, expenses, savings, rate)
- Primary goal progress bar
- Forecast cards (1/3/5 years)
- Insight cards (2-column grid)

### What Should Remain

- **Headline as hero** — this is the product
- Score as single health indicator (simplified, not competing with headline)
- One primary goal anchor
- Forecast as outcome, not chart

### What Should Be Removed

- "הסקירה החודשית שלך" framing — implies reporting, not advising
- Four equal-weight metric cards — cognitive load, spreadsheet energy
- Duplicate goal detail (also on /goals)
- Forecast disclaimer buried at bottom without context

### What Should Be Redesigned

**Dashboard → Decision Home**

```
┌─────────────────────────────────────────┐
│  🎯 YOUR DECISION THIS WEEK             │
│  "Increase savings by ₪800 to stay      │
│   on track for apartment by 2031"       │
│  [Do it] [Simulate] [Ask why]           │
├─────────────────────────────────────────┤
│  Am I on track?  ● Yes (72/100)         │
│  Life goal: Apartment — 6.2 years       │
├─────────────────────────────────────────┤
│  CFO says: 2 things need attention      │
│  (collapsed — expand only if curious)   │
└─────────────────────────────────────────┘
```

Information hierarchy inversion: **Action → Status → Detail**.

### Gap

Dashboard answers "what is my situation?" not "what should I do?" Insights exist but are visually secondary to metrics.

---

## 5. Current Goals System

### What Exists

- `/goals` page with 2 demo goals
- Per-goal: progress, gap, current pace, required monthly, on-track badge
- "Add goal" links to onboarding

### What Should Remain

- Gap + time-to-goal calculations (core decision math)
- On-track / behind semantics
- Life-oriented goal types

### What Should Be Removed

- Standalone goals page as primary destination
- Manual "add goal" as main interaction
- Multiple goals with equal visual weight (dilutes focus)

### What Should Be Redesigned

Goals become **Life Plans** — not a list to manage:

| Concept | Implementation |
|---------|----------------|
| Primary Life Plan | One active north-star (apartment, wedding, etc.) |
| Supporting Plans | Emergency fund, debt clearance — secondary, auto-managed |
| Scenario Engine | "What if I delay 2 years?" / "What if income drops 10%?" |
| Decision linkage | Every recommendation ties to a plan outcome |

### Gap

Goals page is a **project tracker**. Personal CFO sells **life trajectory clarity**.

---

## 6. Current Advisor System

### What Exists

- Client-side chat UI
- Rule-based `answer()` with keyword matching
- 3 suggested questions
- Uses hardcoded `DEMO_USER` / `DEMO_GOALS`

### What Should Remain

- Chat as interaction paradigm
- Suggested prompts
- Plain Hebrew output
- `AdvisorContext` interface for swappable backend

### What Should Be Removed

- Keyword-only rule engine as production AI
- Advisor as secondary nav item
- Stateless conversations (no memory)
- Demo data disconnect from user profile

### What Should Be Redesigned

**Advisor → Personal CFO (AI Core)**

| Layer | Design |
|-------|--------|
| Input | Natural language + structured actions |
| Context | Full user financial graph + life plan + history |
| Output | Decision + rationale + confidence + next step |
| Memory | Session + longitudinal ("last month you asked…") |
| Actions | Executable recommendations ("move ₪500 to savings") |
| Guardrails | Not investment advice; regulatory-safe language |

### Gap

Advisor is a FAQ bot on a budget app. A sellable AI CFO requires **proactive** guidance, not reactive Q&A.

---

## 7. Current Forecast Engine

### What Exists

- Statistical helpers: mean, stdev, moving average, linear trend
- `buildForecast()` — compound monthly savings with 2.4%/yr drift
- `monthsUntilTarget()` — gap / monthly savings
- `describeTrend()` — improving / stable / worsening
- 17 unit tests

### What Should Remain

- Math hidden from user (correct instinct)
- Multi-horizon projection (1/3/5 years)
- Trend detection on expense history
- Test coverage

### What Should Be Removed

- Presenting raw forecast numbers without decision framing
- Single-scenario projection (no "what if")

### What Should Be Redesigned

**Forecast Engine → Scenario & Simulation Engine**

| Capability | Purpose |
|------------|---------|
| Baseline path | "If nothing changes…" |
| Optimistic path | "If you follow CFO recommendation…" |
| Stress path | "If income drops / expense spike…" |
| Goal feasibility | "Is this timeline realistic?" score |
| Decision impact | "This ₪800 cut moves arrival by 8 months" |

Output format shift: from "in 5 years you'll have ₪X" to **"You will / will not reach your goal on time — here's why."**

### Gap

Engine produces numbers. Product needs **verdicts**.

---

## 8. Cross-Cutting Gaps

| Dimension | Current State | Required for Sellable CFO |
|-----------|---------------|---------------------------|
| Identity | None | Auth + household model |
| Data | Demo + localStorage | DB + sync + audit trail |
| AI | Rules | LLM + structured tools + guardrails |
| Proactivity | None | Weekly brief, alerts, nudges |
| Trust | Static demo | Real data or transparent simulation |
| Monetization | None | Freemium → Premium CFO |
| Mobile | Responsive web only | PWA or native-ready flows |
| Compliance | None | Disclaimers, data privacy, not investment advice |

---

## 9. Summary Matrix

| Area | Keep | Remove | Redesign | Merge |
|------|------|--------|----------|-------|
| Architecture | Service layer, types, tests | Demo-as-architecture | Monolith pages → decision platform | Services → Decision Engine |
| User flows | Fast onboarding | Nav-first exploration | Return visit / retention loop | Onboarding + first decision |
| Onboarding | Speed, Hebrew, goals | Form-only UX | Life context intake | Onboarding + goal setup |
| Dashboard | Headline, score | Metric grid hero | Decision Home | Dashboard + goals + forecast |
| Goals | Gap math, goal types | Goals list page | Life Plans | Goals into home |
| Advisor | Chat UX, interface | Rule engine, sidebar | AI CFO core | Advisor + insights |
| Forecast | Hidden math, tests | Raw number display | Scenario engine | Forecast into decisions |

---

## 10. Critical Path to Sellability

The three changes that unlock everything else:

1. **Decision Home replaces Dashboard** — one screen, one primary action, CFO voice.
2. **AI CFO becomes the product** — not a tab; proactive, contextual, memory-enabled.
3. **Persistence + identity** — users must belong to Velora across sessions and devices.

Everything else (Open Banking, advanced scenarios, premium tiers) builds on this foundation.

---

*End of Product Gap Analysis — awaiting approval before implementation.*
