import type { Goal, OnboardingData, User, Transaction } from "@/types";
import { DEFAULT_GOAL_TARGETS, GOAL_LABELS } from "@/lib/constants";
import {
  DEMO_USER,
  DEMO_TRANSACTIONS,
  DEMO_GOALS,
  DEMO_BUDGETS,
} from "@/lib/demo-data";
import {
  type ManualFinanceData,
  resolveTransactions,
  resolveMonthlyIncome,
} from "@/lib/finance-data-store";

export interface UserProfile {
  user: User;
  goals: Goal[];
  transactions: Transaction[];
  budgets: typeof DEMO_BUDGETS;
  fromOnboarding: boolean;
  usesManualData: boolean;
}

export function buildUserProfile(
  onboarding: OnboardingData | null,
  manual: ManualFinanceData | null = null
): UserProfile {
  const base = onboarding ? buildFromOnboarding(onboarding) : buildDemoProfile();
  const income = resolveMonthlyIncome(base.user.monthlyIncome, manual);
  const transactions = resolveTransactions(manual);
  const usesManualData = Boolean(
    manual &&
      (manual.totalMonthlyExpenses ||
        manual.monthlyIncome ||
        (manual.expensesByCategory &&
          Object.keys(manual.expensesByCategory).length > 0))
  );

  return {
    ...base,
    user: { ...base.user, monthlyIncome: income },
    transactions,
    usesManualData,
  };
}

function buildDemoProfile(): UserProfile {
  return {
    user: DEMO_USER,
    goals: DEMO_GOALS,
    transactions: DEMO_TRANSACTIONS,
    budgets: DEMO_BUDGETS,
    fromOnboarding: false,
    usesManualData: false,
  };
}

function buildGoalFromOnboarding(data: OnboardingData): Goal {
  const targetAmount = data.targetAmount ?? DEFAULT_GOAL_TARGETS[data.goalType];
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() + data.timelineYears);

  const currentAmount = Math.round(targetAmount * 0.08);
  const months = data.timelineYears * 12;
  const gap = targetAmount - currentAmount;
  const monthlyContribution = Math.max(500, Math.ceil(gap / months));

  return {
    _id: "user-goal-1",
    userId: "user",
    title: GOAL_LABELS[data.goalType],
    type: data.goalType,
    targetAmount,
    currentAmount,
    targetDate: targetDate.toISOString().slice(0, 10),
    monthlyContribution,
  };
}

/** Merges onboarding answers with demo fixtures for a personalized profile. */
function buildFromOnboarding(data: OnboardingData): Omit<UserProfile, "usesManualData"> {
  const primaryGoal = buildGoalFromOnboarding(data);
  const emergencyGoal: Goal = {
    ...DEMO_GOALS[1],
    userId: "user",
    monthlyContribution: Math.round(data.monthlyIncome * 0.05),
  };

  return {
    user: {
      ...DEMO_USER,
      _id: "user",
      name: "שלום",
      monthlyIncome: data.monthlyIncome,
      onboardingCompleted: true,
    },
    goals: [primaryGoal, emergencyGoal],
    transactions: DEMO_TRANSACTIONS,
    budgets: DEMO_BUDGETS,
    fromOnboarding: true,
  };
}
