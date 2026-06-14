import type { User, Transaction, Goal, Budget } from "@/types";

/**
 * Demo dataset used when FEATURE_FLAGS.demoMode is on (no DB connection yet).
 * Numbers are realistic for an Israeli household to make the product feel real.
 */

export const DEMO_USER: User = {
  _id: "demo-user",
  name: "דניאל",
  email: "daniel@example.com",
  monthlyIncome: 14500,
  financialScore: 0,
  onboardingCompleted: true,
  createdAt: "2025-01-01T00:00:00.000Z",
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  { _id: "t1", userId: "demo-user", amount: 3800, category: "housing", type: "expense", description: "שכר דירה", date: "2026-06-01" },
  { _id: "t2", userId: "demo-user", amount: 2400, category: "food", type: "expense", description: "סופר ומכולת", date: "2026-06-03" },
  { _id: "t3", userId: "demo-user", amount: 1200, category: "transport", type: "expense", description: "ביטוח ורכב", date: "2026-06-05" },
  { _id: "t4", userId: "demo-user", amount: 650, category: "fuel", type: "expense", description: "דלק", date: "2026-06-07" },
  { _id: "t5", userId: "demo-user", amount: 900, category: "entertainment", type: "expense", description: "מסעדות ובילויים", date: "2026-06-10" },
  { _id: "t6", userId: "demo-user", amount: 1100, category: "education", type: "expense", description: "חוגים לילדים", date: "2026-06-12" },
  { _id: "t7", userId: "demo-user", amount: 480, category: "health", type: "expense", description: "ביטוח בריאות", date: "2026-06-14" },
  { _id: "t8", userId: "demo-user", amount: 730, category: "other", type: "expense", description: "שונות", date: "2026-06-18" },
];

export const DEMO_GOALS: Goal[] = [
  {
    _id: "g1",
    userId: "demo-user",
    title: "מקדמה לדירה",
    type: "apartment",
    targetAmount: 500000,
    currentAmount: 180000,
    targetDate: "2032-06-01",
    monthlyContribution: 3000,
  },
  {
    _id: "g2",
    userId: "demo-user",
    title: "קרן חירום",
    type: "savings",
    targetAmount: 60000,
    currentAmount: 42000,
    targetDate: "2027-06-01",
    monthlyContribution: 1000,
  },
];

export const DEMO_BUDGETS: Budget[] = [
  { _id: "b1", userId: "demo-user", category: "housing", limit: 4000, spent: 3800, month: "2026-06" },
  { _id: "b2", userId: "demo-user", category: "food", limit: 2200, spent: 2400, month: "2026-06" },
  { _id: "b3", userId: "demo-user", category: "transport", limit: 1300, spent: 1200, month: "2026-06" },
  { _id: "b4", userId: "demo-user", category: "fuel", limit: 700, spent: 650, month: "2026-06" },
  { _id: "b5", userId: "demo-user", category: "entertainment", limit: 800, spent: 900, month: "2026-06" },
  { _id: "b6", userId: "demo-user", category: "education", limit: 1100, spent: 1100, month: "2026-06" },
  { _id: "b7", userId: "demo-user", category: "health", limit: 500, spent: 480, month: "2026-06" },
  { _id: "b8", userId: "demo-user", category: "other", limit: 800, spent: 730, month: "2026-06" },
];

/** Last 7 months of total expenses — feeds the forecast/trend engine. */
export const DEMO_EXPENSE_HISTORY: number[] = [
  12400, 11900, 12600, 11700, 11500, 11200, 11260,
];
