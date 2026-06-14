import type { BudgetCategory, Transaction } from "@/types";
import { DEMO_TRANSACTIONS } from "@/lib/demo-data";

const STORAGE_KEY = "velora:finance-data";

export interface ManualFinanceData {
  monthlyIncome?: number;
  totalMonthlyExpenses?: number;
  /** Optional category overrides — replaces demo breakdown when set */
  expensesByCategory?: Partial<Record<BudgetCategory, number>>;
  updatedAt: string;
}

export function getManualFinanceData(): ManualFinanceData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ManualFinanceData;
  } catch {
    return null;
  }
}

export function saveManualFinanceData(data: Omit<ManualFinanceData, "updatedAt">): void {
  if (typeof window === "undefined") return;
  const payload: ManualFinanceData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event("velora:finance-updated"));
}

export function clearManualFinanceData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("velora:finance-updated"));
}

/** Builds transactions from manual entry or falls back to demo fixtures. */
export function resolveTransactions(
  manual: ManualFinanceData | null
): Transaction[] {
  if (!manual) return DEMO_TRANSACTIONS;

  const now = new Date().toISOString().slice(0, 10);

  if (manual.expensesByCategory && Object.keys(manual.expensesByCategory).length > 0) {
    return Object.entries(manual.expensesByCategory)
      .filter(([, amount]) => (amount ?? 0) > 0)
      .map(([category, amount], i) => ({
        _id: `manual-${i}`,
        userId: "user",
        amount: amount!,
        category: category as BudgetCategory,
        type: "expense" as const,
        description: "הזנה ידנית",
        date: now,
      }));
  }

  if (manual.totalMonthlyExpenses && manual.totalMonthlyExpenses > 0) {
    return [
      {
        _id: "manual-total",
        userId: "user",
        amount: manual.totalMonthlyExpenses,
        category: "other",
        type: "expense",
        description: "סה״כ הוצאות חודשיות",
        date: now,
      },
    ];
  }

  return DEMO_TRANSACTIONS;
}

export function resolveMonthlyIncome(
  onboardingIncome: number,
  manual: ManualFinanceData | null
): number {
  return manual?.monthlyIncome ?? onboardingIncome;
}
