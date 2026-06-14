# Velora — Component Map

**Phase:** NEXT (Pre-Implementation)  
**Version:** 1.0  
**Purpose:** Map wireframes → reusable components → pages → data dependencies  
**Companion docs:** `WIREFRAMES.md` · `SCREEN_FLOW.md`

---

## 1. Component Hierarchy Overview

```
AppShell
├── MarketingLayout          (landing only)
├── OnboardingLayout         (no nav, progress chrome)
└── AppLayout                (sidebar desktop / bottom nav mobile)
    ├── HomePage
    │   ├── DecisionHero
    │   ├── VerdictStrip
    │   ├── ProofBanner
    │   ├── CFOInsightLink
    │   └── DetailsPanel
    ├── CFOPage
    │   ├── ChatThread
    │   ├── ChatInput
    │   ├── SuggestedChips
    │   └── ContextPanel (desktop)
    └── PlanPage
        ├── PlanHero
        ├── ScenarioChips
        ├── ScenarioSheet
        └── SecondaryPlanList
```

---

## 2. Layout Components

### `AppShell`
| Attribute | Value |
|-----------|-------|
| **Purpose** | Root wrapper, RTL, font, theme |
| **Used in** | All pages |
| **Props** | `children`, `lang="he"`, `dir="rtl"` |
| **Notes** | Existing `layout.tsx` evolves |

### `AppLayout`
| Attribute | Value |
|-----------|-------|
| **Purpose** | Authenticated shell with navigation |
| **Used in** | `/home`, `/cfo`, `/plan`, `/settings` |
| **Children** | `AppHeader`, `AppNav`, `main` |
| **Responsive** | Bottom nav <1024px · Sidebar ≥1024px |
| **Replaces** | Current `AppNav` only usage |

### `OnboardingLayout`
| Attribute | Value |
|-----------|-------|
| **Purpose** | Minimal chrome, progress, sticky CTA |
| **Used in** | `/onboarding/*` |
| **Children** | `OnboardingHeader`, `OnboardingProgress`, `main`, `OnboardingFooter` |
| **Replaces** | Inline layout in `OnboardingWizard` |

### `MarketingLayout`
| Attribute | Value |
|-----------|-------|
| **Purpose** | Landing header + footer, no app nav |
| **Used in** | `/` |
| **Children** | `MarketingHeader`, `main`, `MarketingFooter` |

---

## 3. Navigation Components

### `AppHeader`
| Attribute | Value |
|-----------|-------|
| **Props** | `showBack?: boolean`, `title?: string`, `onMenu?: () => void` |
| **Slots** | `leading` (logo/back), `center` (title), `trailing` (avatar) |
| **Wireframe** | All authenticated screens |
| **Reuse** | Extends current header pattern |

### `AppNav`
| Attribute | Value |
|-----------|-------|
| **Props** | `active: 'home' \| 'cfo' \| 'plan'` |
| **Items** | בית `/home` · ה-CFO `/cfo` · התוכנית `/plan` |
| **A11y** | `aria-current="page"`, 44px min touch |
| **Replaces** | Current 4-item nav (removes budget) |

### `SidebarNav` (desktop)
| Attribute | Value |
|-----------|-------|
| **Props** | Same as `AppNav` |
| **Notes** | Vertical variant of `AppNav` — shared item config |

### `OnboardingHeader`
| Attribute | Value |
|-----------|-------|
| **Props** | `step: number`, `total: number`, `onBack?: () => void` |
| **Shows** | Back to Velora, step label |

### `OnboardingProgress`
| Attribute | Value |
|-----------|-------|
| **Props** | `current: number`, `total: number` |
| **Visual** | 2px bar, primary fill |

---

## 4. Decision Components (Home)

### `DecisionHero` ★ Core
| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary weekly decision — hero of product |
| **Props** | `decision: Decision`, `onAccept`, `onAskWhy`, `onDismiss`, `state: 'pending' \| 'accepted' \| 'dismissed'` |
| **Slots** | `badge`, `headline`, `rationale`, `actions` |
| **Data** | `DecisionEngine.generatePrimaryDecision()` |
| **Wireframe** | Home mobile 1.1 · Onboarding 4.6 |
| **Visual** | `primary-soft` bg, radius 24, only shadow on app |

```
DecisionHero
├── DecisionBadge          ("ההחלטה שלך השבוע")
├── DecisionHeadline       (28px bold)
├── DecisionRationale      (16px muted, max 3 lines)
└── DecisionActions
    ├── PrimaryButton      ("אני מצטרף/ת")
    └── GhostButtonGroup   ("למה?" · "לא עכשיו")
```

### `DecisionBadge`
| **Props** | `label: string`, `icon?: ReactNode` |

### `VerdictStrip`
| Attribute | Value |
|-----------|-------|
| **Props** | `status`, `score`, `yearsToGoal`, `goalLabel?` |
| **Visual** | Single horizontal pill, dividers |
| **Data** | `DashboardSummary.status`, `financialScore`, plan math |
| **Replaces** | Score ring hero placement + status badge scatter |

### `ProofBanner`
| Attribute | Value |
|-----------|-------|
| **Props** | `amountSaved`, `timeSaved?`, `visible: boolean` |
| **Data** | Compare snapshots week-over-week |
| **Condition** | Only if returning user with improvement |

### `CFOInsightLink`
| Attribute | Value |
|-----------|-------|
| **Props** | `message: string`, `prefill: string` |
| **Action** | Navigate `/cfo?prefill=...` |
| **Replaces** | Insight cards grid (2-col) |

### `DetailsPanel`
| Attribute | Value |
|-----------|-------|
| **Props** | `expanded: boolean`, `onToggle`, `summary: DashboardSummary`, `plan: LifePlan` |
| **Children** | `MetricGrid`, `PlanProgress`, `ForecastRow`, `SpendingAlert` |
| **Default** | Collapsed |
| **Replaces** | Always-visible metric cards on dashboard |

### `MetricGrid`
| **Props** | `metrics: { label, value }[]` · max 4 items, 2×2 grid |

### `ForecastRow`
| **Props** | `forecasts: ForecastPoint[]` · 3 compact columns |
| **Replaces** | Large forecast card section |

### `SpendingAlert`
| **Props** | `categoryCount: number` · "2 קטגוריות דורשות תשומת לב" |
| **Action** | Link to CFO or expand spending in details |

---

## 5. Chat Components (CFO)

### `ChatThread`
| Attribute | Value |
|-----------|-------|
| **Props** | `messages: ChatMessage[]`, `isLoading: boolean` |
| **Children** | `ChatBubble`, `InlineDecisionCard`, `TypingIndicator` |
| **A11y** | `aria-live="polite"` |

### `ChatBubble`
| Attribute | Value |
|-----------|-------|
| **Props** | `role: 'user' \| 'assistant'`, `content: string`, `timestamp?`, `source?` |
| **Variants** | user (primary bg) · assistant (muted bg) |
| **Max width** | 85% mobile |

### `InlineDecisionCard`
| Attribute | Value |
|-----------|-------|
| **Props** | `decision: Decision`, `onApply?: () => void` |
| **Used in** | Assistant bubble when AI recommends action |
| **Visual** | Nested card, lighter border |

### `SuggestedChips`
| Attribute | Value |
|-----------|-------|
| **Props** | `questions: string[]`, `onSelect: (q: string) => void` |
| **Layout** | Horizontal scroll |
| **Reuses** | Pattern from current advisor page |

### `ChatInput`
| Attribute | Value |
|-----------|-------|
| **Props** | `value`, `onChange`, `onSend`, `disabled`, `placeholder` |
| **Layout** | Sticky above bottom nav |
| **A11y** | `aria-label="שאלה ל-CFO"` |

### `TypingIndicator`
| **Props** | `visible: boolean` · three dots pulse |

### `ContextPanel` (desktop only)
| Attribute | Value |
|-----------|-------|
| **Props** | `plan`, `score`, `activeDecision` |
| **Purpose** | Read-only mirror — Linear-style side context |
| **Width** | 280px |

---

## 6. Plan Components

### `PlanHero`
| Attribute | Value |
|-----------|-------|
| **Props** | `plan: LifePlan`, `yearsToGoal`, `status`, `progress` |
| **Visual** | Large years number as focal point |
| **Data** | `monthsUntilTarget()` → formatted years |
| **Replaces** | Goals page card list as primary |

### `PlanProgress`
| **Props** | `current`, `target`, `percent` · thin 4px bar |

### `ScenarioChips`
| Attribute | Value |
|-----------|-------|
| **Props** | `scenarios: ScenarioPreset[]`, `onSelect` |
| **Presets** | +₪800 חיסכון · −שנה · +10% הכנסה · עיכוב 6 חודשים |

### `ScenarioSheet`
| Attribute | Value |
|-----------|-------|
| **Props** | `open`, `scenario`, `result`, `onApply`, `onAskCFO`, `onClose` |
| **Type** | Bottom sheet mobile · modal desktop |
| **Shows** | Before → after years, verdict line |

### `SecondaryPlanList`
| Attribute | Value |
|-----------|-------|
| **Props** | `plans: LifePlan[]` (non-primary) |
| **Children** | `SecondaryPlanRow` |

### `SecondaryPlanRow`
| **Props** | `plan`, `percent`, `status` · compact tappable row |

### `PlanCTAFooter`
| **Props** | `onChat: () => void` · "רוצה לשנות יעד? שאל CFO" |

---

## 7. Onboarding Components

### `OnboardingStep`
| Attribute | Value |
|-----------|-------|
| **Purpose** | Wrapper for each step — title, subtitle, content, spacing |
| **Props** | `title`, `subtitle?`, `children` |

### `CFOAvatar`
| **Props** | `size: 'sm' \| 'md'`, `animating?: boolean` |
| **Visual** | V mark in circle — brand, not character illustration |

### `IncomePresets`
| **Props** | `options: number[]`, `selected`, `onSelect`, `customValue`, `onCustomChange` |
| **Reuse** | From current wizard — visual refresh only |

### `GoalTypeGrid`
| **Props** | `options: GoalType[]`, `selected`, `onSelect` |
| **Children** | `GoalTypeCard` |

### `GoalTypeCard`
| **Props** | `type`, `icon`, `label`, `hint`, `selected` |

### `TimelinePicker`
| **Props** | `years`, `selected`, `onSelect`, `preview: { monthlyNeeded }` |
| **Children** | `TimelinePill`, `PreviewCard`, `OptionalTargetInput` |

### `PreparingChecklist`
| **Props** | `steps: { label, done }[]` |
| **Used in** | Onboarding screen 4 |

### `FirstDecisionReveal`
| **Props** | Same as `DecisionHero` but with onboarding chrome |
| **Composition** | `DecisionHero` + `VerdictStrip` + source line |

### `SavePlanGate`
| **Props** | `onGoogle`, `onEmail`, `onSkip` |
| **Children** | `AuthProviderButton` × 2, ghost skip |

### `AuthProviderButton`
| **Props** | `provider: 'google' \| 'email'`, `onClick` |

### `GuestSaveBanner`
| **Props** | `onSave`, `onDismiss` |
| **Used in** | `/home` when guest mode |

---

## 8. Shared UI Primitives

Existing components to **keep and extend**:

| Component | Status | Changes |
|-----------|--------|---------|
| `Button` | Keep | Add `loading` state |
| `ButtonLink` | Keep | — |
| `Card` | Keep | Add `variant: 'hero' \| 'default' \| 'ghost'` |
| `Badge` | Keep | Status tones already exist |
| `Progress` | Keep | Add `size: 'thin' \| 'default'` |
| `ScoreRing` | Demote | Move to DetailsPanel only — not hero |
| `icons.tsx` | Keep | Add `HomeIcon`, `PlanIcon` if needed |

New primitives:

| Component | Purpose |
|-----------|---------|
| `PrimaryButton` | Wrapper enforcing full-width hero CTAs |
| `GhostButton` | Secondary actions |
| `Pill` | Verdict strip segments, timeline pills |
| `Divider` | Inline separators |
| `BottomSheet` | Scenario sheet, mobile overlays |
| `Collapsible` | Details panel expand |
| `EmptyState` | No data states |
| `LegalFooter` | "לא ייעוץ השקעות" microcopy |

---

## 9. Page → Component Matrix

### `/home`
| Section | Components | Data source |
|---------|------------|-------------|
| Header | `AppHeader` | user session |
| Hero | `DecisionHero` | `DecisionEngine` |
| Status | `VerdictStrip` | `buildDashboardSummary()` |
| Proof | `ProofBanner` | snapshot diff |
| Insight | `CFOInsightLink` | `buildInsights()[0]` |
| Details | `DetailsPanel` | summary + plan |
| Nav | `AppNav` | route |
| Guest | `GuestSaveBanner` | session type |

### `/cfo`
| Section | Components | Data source |
|---------|------------|-------------|
| Header | `AppHeader` | — |
| Messages | `ChatThread` | `conversations` API |
| Chips | `SuggestedChips` | `SUGGESTED_QUESTIONS` + dynamic |
| Input | `ChatInput` | local state |
| Context | `ContextPanel` | profile (desktop) |
| Nav | `AppNav` | route |

### `/plan`
| Section | Components | Data source |
|---------|------------|-------------|
| Header | `AppHeader` | — |
| Hero | `PlanHero` | primary `LifePlan` |
| Scenarios | `ScenarioChips` | preset list |
| Sheet | `ScenarioSheet` | `ScenarioEngine` |
| Secondary | `SecondaryPlanList` | plans[1..n] |
| Footer | `PlanCTAFooter` | — |
| Nav | `AppNav` | route |

### `/onboarding`
| Step | Components |
|------|------------|
| 1 | `OnboardingStep`, `CFOAvatar`, `IncomePresets` |
| 2 | `OnboardingStep`, `GoalTypeGrid` |
| 3 | `OnboardingStep`, `TimelinePicker` |
| 4 | `PreparingChecklist`, `CFOAvatar` |
| 5 | `FirstDecisionReveal` |
| 6 | `SavePlanGate` |

---

## 10. Component → Service Dependencies

```
DecisionHero ──────► DecisionEngine ──► FinanceService
                 └──► PlanService

VerdictStrip ──────► FinanceService.buildDashboardSummary()

ProofBanner ───────► SnapshotRepository (week diff)

DetailsPanel ──────► FinanceService + ForecastEngine

ChatThread ────────► CFOOrchestrator ──► FinanceService (tools)
                                    └──► ForecastEngine (tools)
                                    └──► ScenarioEngine (tools)

PlanHero ──────────► PlanService + ForecastEngine.monthsUntilTarget()

ScenarioSheet ─────► ScenarioEngine

IncomePresets ─────► (onboarding only, no service until submit)

FirstDecisionReveal ► DecisionEngine (same as home)
```

---

## 11. State Ownership

| State | Owner | Storage |
|-------|-------|---------|
| User session | Auth.js | cookie + DB |
| Life plans | `PlanService` | MongoDB |
| Active decision | `DecisionEngine` | MongoDB |
| Chat messages | `CFOOrchestrator` | MongoDB |
| Details expanded | `DetailsPanel` local | UI state only |
| Scenario sheet open | `ScenarioSheet` local | UI state only |
| Onboarding draft | `OnboardingStore` | localStorage → merge on auth |
| Guest profile | `OnboardingStore` | localStorage |

---

## 12. Component Priority (Implementation Order)

Aligned with FINAL RECOMMENDATION Phase A→D:

### Phase A — Decision Home
1. `AppLayout` + `AppNav` (3 items)
2. `DecisionHero` + `DecisionActions`
3. `VerdictStrip`
4. `DetailsPanel` + `MetricGrid` + `ForecastRow`
5. `CFOInsightLink`
6. `ProofBanner` (can stub initially)

### Phase B — AI CFO
7. `ChatThread` + `ChatBubble` + `ChatInput`
8. `SuggestedChips`
9. `InlineDecisionCard`
10. `TypingIndicator`
11. `ContextPanel` (desktop)

### Phase C — Life Plan
12. `PlanHero` + `PlanProgress`
13. `ScenarioChips` + `ScenarioSheet`
14. `SecondaryPlanList`

### Phase D — Onboarding V2
15. `OnboardingLayout` + `OnboardingProgress`
16. `IncomePresets` + `GoalTypeGrid` + `TimelinePicker`
17. `PreparingChecklist`
18. `FirstDecisionReveal`
19. `SavePlanGate` + `GuestSaveBanner`

---

## 13. Deprecation Map

| Current file | Fate | Maps to |
|--------------|------|---------|
| `dashboard-view.tsx` | Replace | `HomePage` + decision components |
| `dashboard-preview.tsx` | Redesign | `DecisionHero` static variant on landing |
| `onboarding-wizard.tsx` | Refactor | Onboarding steps + `FirstDecisionReveal` |
| `app-nav.tsx` | Update | 3 items |
| `app/dashboard/page.tsx` | Redirect | `/home` |
| `app/advisor/page.tsx` | Replace | `/cfo` |
| `app/goals/page.tsx` | Replace | `/plan` |
| `app/budget/page.tsx` | Remove | `SpendingAlert` in `DetailsPanel` |
| `score-ring.tsx` | Demote | `DetailsPanel` optional |

---

## 14. Design Consistency Rules

1. **One hero per screen** — DecisionHero OR PlanHero OR Chat focus, never multiple.
2. **One primary button** — green fill, full width on mobile.
3. **Max 3 ghost actions** per screen.
4. **No grid >2 columns** on mobile except goal type picker.
5. **All currency** via shared `formatCurrency()`.
6. **All status** via `VerdictStrip` or `Badge` — no ad-hoc colors.
7. **CFO voice** in `DecisionRationale` and `ChatBubble` — not in labels/buttons.

---

## 15. Storybook / Preview Matrix (Recommended)

| Story | Components |
|-------|------------|
| Decision / pending | `DecisionHero` |
| Decision / accepted | `DecisionHero` |
| Decision / at-risk | `DecisionHero` + `VerdictStrip` |
| Verdict / on-track | `VerdictStrip` |
| Chat / with inline card | `ChatBubble` + `InlineDecisionCard` |
| Plan / primary | `PlanHero` |
| Scenario / sheet open | `ScenarioSheet` |
| Onboarding / each step | Step components |
| Empty / no data | `EmptyState` |

---

*End of Component Map — ready for implementation approval*
