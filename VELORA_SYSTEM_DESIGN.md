# Velora — System Design

**Phase:** NEXT  
**Scope:** Target architecture for AI Personal CFO pivot  
**Principle:** Data is infrastructure. Decisions are the product.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                        │
│  Decision Home │ AI CFO Chat │ Life Plan Setup │ Settings          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼─────────────────────────────────────┐
│                     API LAYER (Next.js Route Handlers)              │
│  /api/auth/*  /api/decisions/*  /api/plans/*  /api/cfo/*         │
│  /api/snapshots/*  /api/scenarios/*  /api/webhooks/*              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ Decision      │  │ AI Orchestrator │  │ Ingestion        │
│ Engine        │  │ (LLM + Tools)   │  │ (Manual/CSV/OB)  │
│ (existing +   │  │                 │  │                  │
│  extended)    │  │                 │  │                  │
└───────┬───────┘  └────────┬────────┘  └────────┬─────────┘
        │                   │                     │
        └───────────────────┼─────────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │ MongoDB Atlas        │
                 │ + Redis (cache/queue)│
                 └─────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          ┌────────────┐        ┌─────────────┐
          │ OpenAI API │        │ Email/Push  │
          │ (primary)  │        │ (Resend/FCM)│
          └────────────┘        └─────────────┘
```

---

## 2. Database Architecture

### 2.1 Database Choice

**MongoDB Atlas** — document model fits flexible financial snapshots, conversation history, and evolving life plan schemas. Israeli region deployment for latency and data residency considerations.

### 2.2 Collections

#### `users`
```typescript
{
  _id: ObjectId,
  email: string,
  name?: string,
  locale: "he-IL",
  householdId?: ObjectId,
  subscriptionTier: "free" | "plus" | "family",
  onboardingCompletedAt: Date,
  createdAt: Date,
  settings: {
    notifications: { weeklyBrief: boolean, alerts: boolean },
    primaryPlanId?: ObjectId
  }
}
```

#### `households` (V1)
```typescript
{
  _id: ObjectId,
  members: [{ userId, role: "owner" | "partner" }],
  monthlyIncome: number,
  currency: "ILS"
}
```

#### `life_plans`
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: GoalType,
  title: string,
  targetAmount: number,
  currentAmount: number,
  targetDate: Date,
  priority: "primary" | "secondary",
  status: "active" | "achieved" | "paused",
  createdAt: Date,
  updatedAt: Date
}
```

#### `financial_snapshots` (immutable monthly records)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  period: "2026-06",          // YYYY-MM
  income: number,
  expenses: number,
  savings: number,
  savingsRate: number,
  financialScore: number,
  status: "on-track" | "at-risk" | "off-track",
  headline: string,
  source: "manual" | "import" | "open_banking",
  createdAt: Date
}
```

#### `transactions`
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: number,
  category: BudgetCategory,
  type: "income" | "expense",
  description: string,
  date: Date,
  source: "manual" | "csv" | "open_banking",
  externalId?: string         // dedup for OB
}
```

#### `decisions` (core product artifact)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  planId?: ObjectId,
  type: "weekly_primary" | "alert" | "scenario_result",
  title: string,               // Hebrew action headline
  rationale: string,
  impact?: { monthsSaved?: number, amountRequired?: number },
  status: "pending" | "accepted" | "dismissed" | "completed",
  validUntil: Date,
  createdAt: Date
}
```

#### `conversations` / `messages`
```typescript
// conversations
{ _id, userId, title?, createdAt, updatedAt }

// messages
{ _id, conversationId, role: "user"|"assistant"|"system", content, toolCalls?, createdAt }
```

#### `scenarios`
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  planId: ObjectId,
  params: { incomeDelta?, expenseDelta?, timelineDelta? },
  results: { feasible: boolean, newTargetDate?, headline: string },
  createdAt: Date
}
```

#### `audit_log` (compliance)
```typescript
{ _id, userId, action, metadata, ip?, createdAt }
```

### 2.3 Indexing Strategy

| Collection | Index |
|------------|-------|
| users | `{ email: 1 }` unique |
| life_plans | `{ userId: 1, status: 1 }` |
| financial_snapshots | `{ userId: 1, period: -1 }` |
| transactions | `{ userId: 1, date: -1 }`, `{ userId: 1, externalId: 1 }` sparse |
| decisions | `{ userId: 1, status: 1, validUntil: -1 }` |
| messages | `{ conversationId: 1, createdAt: 1 }` |

### 2.4 Data Retention

- Snapshots: indefinite (user history)
- Messages: 24 months (configurable)
- Audit log: 7 years (regulatory conservative)
- Deleted accounts: 30-day soft delete → purge

---

## 3. Service Architecture

### 3.1 Layer Model

```
Presentation  →  API Routes  →  Application Services  →  Domain Services  →  Repositories
```

### 3.2 Domain Services (extend existing)

| Service | Responsibility | Status |
|---------|----------------|--------|
| `FinanceService` | Snapshot, score, headline, insights | **Exists — extend** |
| `ForecastEngine` | Projections, trends, months-to-target | **Exists — extend** |
| `ScenarioEngine` | What-if simulations | **New** |
| `DecisionEngine` | Generate weekly primary decision | **New** |
| `PlanService` | Life plan CRUD, feasibility | **New** |
| `IngestionService` | Manual/CSV/OB normalize → transactions | **New** |
| `AdvisorService` | Rule fallback | **Exists — demote to fallback** |

### 3.3 Application Services

| Service | Responsibility |
|---------|----------------|
| `CFOOrchestrator` | Assemble context, call LLM, execute tools, persist |
| `BriefGenerator` | Weekly decision email content |
| `ProofService` | Compare snapshots → progress narrative |
| `AnomalyDetector` | Category spike detection |

### 3.4 Decision Engine (New — Core)

```typescript
interface DecisionEngine {
  generatePrimaryDecision(ctx: UserFinancialContext): Decision;
  generateAlerts(ctx: UserFinancialContext): Decision[];
  evaluateAction(decisionId: string, outcome: "accepted"|"dismissed"): void;
}
```

**Logic flow:**
1. Load latest snapshot + primary life plan
2. Run `buildDashboardSummary()` + `monthsUntilTarget()`
3. Compare required pace vs actual pace
4. If gap → generate single actionable decision with impact
5. Persist to `decisions` collection
6. Return to UI as hero card

### 3.5 File Structure (Target)

```
src/
├── app/
│   ├── (marketing)/          # landing
│   ├── (app)/                # authenticated shell
│   │   ├── home/             # Decision Home (replaces dashboard)
│   │   ├── cfo/              # AI chat (replaces advisor)
│   │   ├── plan/             # Life plan (replaces goals)
│   │   └── settings/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── decisions/
│       ├── plans/
│       ├── cfo/chat/
│       ├── snapshots/
│       └── scenarios/
├── domain/
│   ├── finance/              # move from services/
│   ├── forecast/
│   ├── decisions/
│   └── plans/
├── infrastructure/
│   ├── db/                   # Mongo models + repositories
│   ├── ai/                   # OpenAI client, prompts, tools
│   ├── email/
│   └── queue/
├── components/
│   ├── decision/             # DecisionCard, VerdictHero
│   ├── cfo/                  # ChatThread, SuggestedActions
│   └── ui/
└── lib/
```

---

## 4. API Architecture

### 4.1 Design Principles

- RESTful route handlers (Next.js App Router)
- JSON responses, Hebrew user messages in payload
- Zod validation on all inputs
- User-scoped via session middleware
- Rate limiting on AI endpoints

### 4.2 Core Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/decisions/current` | Active primary decision + status |
| POST | `/api/decisions/:id/respond` | Accept/dismiss/complete |
| GET | `/api/plans` | User life plans |
| POST | `/api/plans` | Create/update plan |
| POST | `/api/snapshots` | Submit monthly financial data |
| GET | `/api/snapshots/latest` | Current financial state |
| POST | `/api/cfo/chat` | Streaming AI response |
| GET | `/api/cfo/conversations` | History |
| POST | `/api/scenarios/run` | Execute what-if |
| GET | `/api/brief` | Weekly brief content |

### 4.3 API Response Shape (Decision)

```json
{
  "verdict": {
    "status": "at-risk",
    "score": 62,
    "headline": "בקצב הנוכחי תגיע לדירה 2.1 שנים אחרי היעד"
  },
  "primaryDecision": {
    "id": "...",
    "title": "הגדל חיסכון חודשי ב-₪840",
    "rationale": "כדי לחזור למסלול עד 2031...",
    "impact": { "monthsSaved": 14 }
  },
  "details": { "income": 14500, "expenses": 11260, "savings": 3240 }
}
```

Details collapsed by default on client.

### 4.4 Error Handling

- 401 unauthenticated → redirect to sign-in
- 403 tier limit → upgrade prompt
- 429 AI rate limit → fallback to rule engine + message
- 500 → generic Hebrew error, log to Sentry

---

## 5. Authentication Architecture

### 5.1 Provider

**NextAuth.js v5 (Auth.js)** with:
- Google OAuth (primary — low friction)
- Email magic link (backup)
- Session strategy: JWT + database session record

### 5.2 Flow

```
Sign up (during/after onboarding)
    ↓
Session cookie (httpOnly, secure, sameSite)
    ↓
Middleware protects /(app)/* routes
    ↓
API routes validate session → userId
```

### 5.3 Authorization Model

| Resource | Rule |
|----------|------|
| All financial data | `userId` match |
| Household (V1) | `householdId` membership |
| Admin | Separate admin role (internal) |

### 5.4 Onboarding + Auth Timing

**Recommended:** Deliver first decision **before** account creation (guest session with local state), then prompt account creation to **save your plan**. Conversion hook: "Don't lose your CFO recommendation."

Guest data migrates to user on signup via merge endpoint.

---

## 6. AI Architecture

### 6.1 Orchestrator Pattern

```
CFOOrchestrator.handleMessage(userId, message)
  │
  ├─ 1. Load context bundle
  │     • User profile
  │     • Primary life plan
  │     • Latest snapshot
  │     • Active decision
  │     • Last 10 messages
  │     • Recent transactions summary (not raw dump)
  │
  ├─ 2. Build system prompt (Hebrew CFO persona + guardrails)
  │
  ├─ 3. Call LLM with tool definitions
  │
  ├─ 4. Execute tool calls → domain services
  │
  ├─ 5. Final response generation
  │
  └─ 6. Persist messages + any new decisions
```

### 6.2 Tool Definitions (LLM-callable)

| Tool | Returns |
|------|---------|
| `get_financial_snapshot` | Latest income/expenses/savings/score |
| `get_life_plan_status` | Gap, months remaining, on-track boolean |
| `simulate_scenario` | Feasibility + new timeline |
| `get_spending_breakdown` | Top categories + anomalies |
| `create_decision_recommendation` | Structured decision object |

**Critical rule:** LLM never computes numbers directly.

### 6.3 Prompt Architecture

```
System: Persona + guardrails + output format
Context: Structured JSON (not prose dump)
User: Message
```

Guardrails:
- Not licensed investment advice
- Recommend licensed professionals for complex cases
- Always respond in Hebrew unless asked otherwise
- Max one primary recommendation per response

### 6.4 Eval & Safety

- Golden dataset: 50 Hebrew financial Q&A pairs
- Automated eval on deploy (score accuracy, tone, guardrail compliance)
- Human review queue for flagged responses (V1)
- Token budget per user tier

### 6.5 Cost Control

| Tier | Model | Max tokens/msg |
|------|-------|----------------|
| Free | gpt-4o-mini | 2K |
| Plus | gpt-4o | 8K |

Cache system prompt + context hash for repeated queries within session.

---

## 7. Forecast Architecture

### 7.1 Current → Target

| Current | Target |
|---------|--------|
| Single baseline forecast | Multi-scenario engine |
| Static monthly growth 0.2% | Data-driven trend from snapshots |
| Display raw savings totals | Verdict-first output |

### 7.2 Scenario Engine

```typescript
interface ScenarioParams {
  incomeMultiplier?: number;    // e.g. 0.9 = 10% drop
  expenseMultiplier?: number;
  additionalMonthlySavings?: number;
  timelineShiftMonths?: number;
}

interface ScenarioResult {
  feasible: boolean;
  projectedReachDate: Date | null;
  headline: string;             // Hebrew verdict
  comparisonToBaseline: { monthsDelta: number };
}
```

### 7.3 Integration Points

- Decision Engine calls scenario on every primary decision ("if you add ₪X…")
- AI tool `simulate_scenario` exposes to chat
- Life plan page shows 3 paths: baseline / recommended / stress

### 7.4 Historical Accuracy (V2)

Store predictions vs actuals monthly → improve credibility messaging: "Our forecasts were within 8% for you."

---

## 8. Scalability Strategy

### 8.1 Phase 1 (0–10K users)

- Vercel serverless (Next.js)
- MongoDB Atlas M10
- OpenAI API direct
- No Redis required (optional session cache)

**Bottleneck:** AI API cost → mitigate with tier limits + caching.

### 8.2 Phase 2 (10K–100K users)

- Redis (Upstash) for rate limiting + brief job queue
- Background jobs (Inngest or BullMQ) for weekly briefs
- MongoDB read replicas
- CDN for static assets
- AI response caching for common queries

### 8.3 Phase 3 (100K+ users)

- Dedicated worker service for ingestion/OB sync
- Event-driven architecture (decisions generated on snapshot update)
- Multi-region if expanding beyond Israel
- Consider fine-tuned smaller model for cost reduction

### 8.4 Observability

| Tool | Purpose |
|------|---------|
| Sentry | Errors |
| PostHog | Product analytics |
| Langfuse / Helicone | AI tracing |
| MongoDB Atlas monitoring | DB performance |

### 8.5 Security

- TLS everywhere
- Field-level encryption for sensitive notes (V2)
- OWASP top 10 compliance
- Pen test before Open Banking launch
- Israeli Privacy Protection Law alignment
- SOC 2 path for B2B (V2)

---

## 9. Migration Path from Current Codebase

| Current | Action | Target |
|---------|--------|--------|
| `financeService.ts` | Move to `domain/finance/` | Extend with decision hooks |
| `forecastEngine.ts` | Move to `domain/forecast/` | Add scenario methods |
| `advisorService.ts` | Keep as `domain/advisor/fallback.ts` | Demote |
| `demo-data.ts` | Remove from production path | Seed script only |
| `dashboard-view.tsx` | Replace | `decision-home.tsx` |
| `onboarding-wizard.tsx` | Extend | Life context + auth |
| `localStorage` profile | Replace | MongoDB + guest merge |
| Flat `AppNav` | Replace | Minimal nav: Home, CFO, Plan |

**Estimated refactor:** 60% reuse of domain logic, 80% rewrite of UI/routing, 100% new infrastructure layer.

---

## 10. Technology Decisions Summary

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 16 App Router | Already in use; RSC + API colocated |
| Database | MongoDB Atlas | Flexible docs, fast iteration |
| Auth | Auth.js v5 | Next.js native, Google + email |
| AI | OpenAI API + tools | Best Hebrew quality, tool calling |
| Validation | Zod | Type-safe API inputs |
| Email | Resend | Developer-friendly |
| Payments (V1) | Stripe | International; add Israeli provider later |
| Hosting | Vercel | Zero-config Next.js |
| Queue (V1) | Inngest | Serverless-friendly cron/briefs |

---

*End of System Design — awaiting approval before implementation.*
