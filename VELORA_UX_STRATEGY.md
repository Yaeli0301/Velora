# Velora — UX Strategy

**Phase:** NEXT  
**Mission:** Users make life decisions, not manage money.  
**Design North Star:** One clear answer. One clear action. Zero guilt.

---

## 1. UX Philosophy

### From Budget App to Personal CFO

| Budget App UX | Personal CFO UX |
|---------------|-----------------|
| "Here's your data" | "Here's what to do" |
| Explore tabs | Stay on one screen |
| User analyzes | CFO analyzes |
| Charts first | Verdict first |
| Guilt (overspent!) | Guidance (here's the fix) |
| Complexity = power | Simplicity = trust |

### Core UX Principles

1. **Decision-first hierarchy** — Action → Status → Detail (never reverse)
2. **Progressive disclosure** — Details only for the curious
3. **One primary action** — Never two competing CTAs
4. **CFO voice, not app voice** — "I recommend" not "Your budget shows"
5. **Life language, not finance language** — "דירה" not "יעד פיננסי"
6. **Calm confidence** — No alarm-red dashboards; measured urgency only

---

## 2. Emotional User Journey

### Stage 1: Anxiety (Pre-Velora)

**Feeling:** "I don't know if I'm doing okay. Everyone else seems to have it figured out."

**Design response:**
- Landing page validates the question: "האם אתה בדרך הנכונה?"
- No shame language, no complexity preview
- Social proof: real outcomes, not feature lists

### Stage 2: Hope (Onboarding)

**Feeling:** "Maybe someone can actually tell me."

**Design response:**
- Conversational onboarding (CFO asks, user answers)
- Progress bar with time estimate ("עוד דקה")
- Early micro-reward: preview of savings needed before final step

### Stage 3: Relief (First Decision)

**Feeling:** "Oh — I actually know what to do now."

**Design response:**
- Single hero decision card — large, clear, actionable
- Plain Hebrew rationale (2–3 sentences max)
- Immediate CTA: "בוא נתחיל" / "הבנתי"

**This is the activation moment. Everything before is setup. Everything after is retention.**

### Stage 4: Trust (Week 1–4)

**Feeling:** "This thing knows my situation."

**Design response:**
- Proof loop: "Since last week, you saved ₪400 extra"
- CFO remembers previous conversations
- Consistent verdict language
- No sudden UI changes

### Stage 5: Confidence (Month 2+)

**Feeling:** "I'm in control of my life plan."

**Design response:**
- Scenario exploration ("what if I get a raise?")
- Milestone celebrations (25%, 50%, 75% to goal)
- Optional depth — user chooses to dig in

### Stage 6: Advocacy

**Feeling:** "You have to try this."

**Design response:**
- Shareable decision card (privacy-safe)
- Referral: "Help a friend get their first decision"

---

## 3. Trust Building

### Trust Pillars

| Pillar | UX Implementation |
|--------|-------------------|
| **Transparency** | "Based on your ₪14,500 income" — always show data source |
| **Honesty about limits** | "Without bank connection, this is an estimate" |
| **No hidden agenda** | Affiliate links clearly labeled (V2) |
| **Regulatory clarity** | "Not investment advice" — subtle, persistent footer |
| **Data control** | Settings: export, delete account, see what's stored |
| **Consistency** | Same verdict format every visit |

### Trust Killers to Avoid

- Hardcoded demo numbers in marketing preview
- AI hallucinating figures
- Aggressive upgrade popups before value delivered
- Red alert aesthetics for normal variance
- Asking for bank credentials before trust established

### Trust Sequence

```
Free value (first decision)
    → Account save ("don't lose this")
    → Weekly brief (proactive care)
    → Optional bank connect (convenience, not requirement)
    → Premium (depth, not access)
```

---

## 4. Information Hierarchy

### Decision Home — Visual Priority

```
Priority 1 (60% viewport):  Primary Decision + CTA
Priority 2 (20%):           Verdict strip (on track / score / goal timeline)
Priority 3 (15%):           CFO insight (1–2 lines)
Priority 4 (5%):            "Show details" expandable
```

### Collapsed Detail Panel (Expandable)

Only for users who want it:
- Income / expenses / savings
- Category breakdown (top 3, not 8)
- Forecast scenarios
- Full conversation with CFO

**Rule:** 80% of users should never need to expand.

### Typography Hierarchy

| Element | Treatment |
|---------|-----------|
| Decision headline | 24–28px, bold, max 2 lines |
| Rationale | 16px, regular, muted |
| Verdict status | Badge + color (green/amber/red) |
| Metrics | 14px, only in detail panel |
| Legal/disclaimer | 12px, footer |

### Color Semantics

| State | Color | Usage |
|-------|-------|-------|
| On track | Green `#0f8a5f` | Verdict, positive proof |
| Attention | Amber `#d9822b` | Single warning, not alarm |
| Off track | Soft red `#d64545` | Only when action urgent |
| Neutral | Navy/muted | Everything else |

**Never:** Full-screen red, pulsing alerts, exclamation marks in hero.

---

## 5. Cognitive Load Reduction

### Rules

1. **One number hero** — Financial score OR months to goal, not both competing
2. **Max 3 items per section** — Top 3 categories, top 3 insights
3. **No empty states requiring user action** — CFO pre-fills recommendations
4. **Default everything** — Smart defaults from onboarding, user adjusts only if needed
5. **Remove navigation choices** — 3 nav items max: Home, CFO, Plan

### Before / After

| Current (High Load) | Target (Low Load) |
|---------------------|-------------------|
| 4 metric cards | 1 verdict strip |
| 8 budget categories | "2 categories need attention" |
| Separate goals page | Goal embedded in home |
| User asks advisor | CFO pushes weekly decision |
| User picks timeline | CFO suggests optimal + alternative |

### Cognitive Load Budget

Target: **< 7 seconds** to understand status, **< 15 seconds** to understand action.

Test: 5-second screenshot test with target users — can they answer "what should I do?"

---

## 6. Screen-by-Screen UX Direction

### Landing Page

- Keep emotional hook
- Replace static dashboard preview with **animated decision card**
- Single CTA: "קבל את ההחלטה הראשונה שלך"
- Remove feature grid overload → 3 benefits max

### Onboarding (Life Context)

**Format:** Conversational cards, one question per screen

```
Screen 1: "מה ההכנסה החודשית שלך?" (existing)
Screen 2: "מה החלום הגדול?" (existing, reframed)
Screen 3: "מתי תרצה להגיע?" (existing)
Screen 4: "רגע — אני מכין את התוכנית שלך..." (loading + CFO animation)
Screen 5: FIRST DECISION (not dashboard redirect)
Screen 6: "שמרי את התוכנית" → account creation
```

### Decision Home (Replaces Dashboard)

```
┌─────────────────────────────────────┐
│  [Velora logo]          [CFO chat]  │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐   │
│   │  📌 ההחלטה שלך השבוע        │   │
│   │                             │   │
│   │  הגדל חיסכון ב-₪840/חודש   │   │
│   │  כדי להגיע לדירה ב-2031     │   │
│   │                             │   │
│   │  [אני מצטרף]  [למה?]        │   │
│   └─────────────────────────────┘   │
│                                     │
│   ● בדרך הנכונה · 62/100 · 6.2 שנים │
│                                     │
│   ▼ פרטים (collapsed)               │
│                                     │
└─────────────────────────────────────┘
```

### AI CFO Chat

- Full-screen on mobile, side panel on desktop (optional)
- CFO avatar/icon — consistent persona
- Suggested actions as chips, not open-ended empty chat
- Inline decision cards in chat responses
- "Apply this recommendation" button when applicable

### Life Plan (Replaces Goals)

- Single page, primary plan hero
- Secondary plans as compact list
- Scenario buttons: "מה אם אחכה שנה?" / "מה אם אגדיל הכנסה?"
- No manual CRUD forms — CFO guides changes via chat

### Budget (Demoted)

- **No standalone nav item in MVP**
- Spending surfaced as: "2 categories need attention" on Decision Home
- Full breakdown only in detail panel or via CFO chat query

---

## 7. Mobile Experience

### Mobile-First Rationale

Israeli target users are mobile-primary. CFO must work on phone during commute, before sleep, in stress moments.

### Mobile Patterns

| Pattern | Implementation |
|---------|----------------|
| Bottom nav | Home · CFO · Plan (3 items) |
| Sticky decision card | Primary action always visible |
| Chat as full screen | Primary mobile interaction |
| Thumb-zone CTAs | Primary button bottom-center |
| Swipe to dismiss | Secondary decisions/alerts |
| Pull to refresh | Update financial snapshot |

### PWA (V1)

- Add to home screen prompt after first decision
- Push notifications for weekly brief
- Offline: show last cached decision + "connect to update"

### Mobile Don'ts

- No horizontal scroll tables
- No 8-card grids
- No tiny chart interactions
- No multi-step forms without progress indicator

---

## 8. Accessibility

### Standards Target

WCAG 2.1 AA compliance minimum.

### Requirements

| Area | Standard |
|------|----------|
| Color contrast | 4.5:1 text, 3:1 large text |
| Color independence | Status never color-only (icon + text) |
| Screen readers | All decisions readable as plain text |
| Focus management | Chat modal traps focus correctly |
| Motion | Respect `prefers-reduced-motion` |
| Language | `lang="he"` `dir="rtl"` on all pages |
| Form labels | All inputs labeled (existing onboarding good) |
| Score ring | `aria-label="ציון פיננסי 62 מתוך 100"` |

### Cognitive Accessibility

- Plain Hebrew (grade 8 reading level)
- No acronyms (ROI, APR, etc.)
- Explain every recommendation in one sentence
- Optional "explain like I'm 12" in CFO chat

### Inclusive Design

- Debt users: no shame language ("מינוס" → "בוא נחזור לפלוס")
- Low income: realistic goals, not aspirational pressure
- Gender-neutral Hebrew where possible

---

## 9. Content & Voice Guidelines

### CFO Persona

- **Name:** Velora (the CFO is the product, not a character name initially)
- **Tone:** Calm, direct, supportive — like a smart friend who happens to be an accountant
- **Never:** Condescending, alarmist, jargon-heavy, vague

### Voice Examples

| ❌ Don't | ✅ Do |
|----------|-------|
| "Your savings rate is suboptimal" | "אתה חוסך מעט מדי כדי להגיע בזמן" |
| "Budget exceeded in food category" | "הוצאות האוכל עלו — בוא נבין למה" |
| "Consider diversifying investments" | "קודם נגיע ליעד, אחר כך נחשוב על השקעות" |
| "Error: insufficient data" | "אני צריך עוד קצת מידע כדי לעזור" |

### Microcopy Standards

- Buttons: verb-first ("הגדל חיסכון", "שאל את ה-CFO")
- Empty states: always lead to action
- Loading: "מכין את ההחלטה שלך..." (not generic spinner)

---

## 10. Key UX Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Time to first decision | Signup → decision visible | < 5 min |
| Decision comprehension | User can state action in own words | > 80% |
| Primary CTA click rate | "Accept" on weekly decision | > 40% |
| Detail panel open rate | How many dig into numbers | < 25% (good!) |
| CFO messages per session | Engagement depth | 2–5 |
| Mobile session share | Mobile / total | > 65% |
| Accessibility audit score | Lighthouse a11y | > 90 |

---

## 11. UX Migration Map

| Current Screen | UX Action |
|----------------|-----------|
| `/dashboard` | → `/home` Decision Home |
| `/advisor` | → `/cfo` primary nav, promote |
| `/goals` | → `/plan` simplified |
| `/budget` | → demote to detail panel |
| `/onboarding` | → extend with first decision + auth |
| `AppNav` (4 items) | → 3 items: Home, CFO, Plan |
| `DashboardPreview` | → animated DecisionCard preview |
| Metric cards grid | → remove from hero |
| Insight cards grid | → single CFO insight line |

---

## 12. Design System Notes

Keep existing fintech visual language (green/navy, Heebo, rounded cards) but shift composition:

- **More whitespace** around decision hero
- **Larger type** for decisions
- **Fewer borders** — one hero card, not grid of cards
- **CFO chat bubble** styling distinct from system UI
- **Motion:** subtle fade-in on new decisions, no chart animations

---

*End of UX Strategy — awaiting approval before implementation.*
