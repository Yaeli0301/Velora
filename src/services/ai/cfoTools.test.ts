import { describe, it, expect } from "vitest";
import { execGetFinancialSnapshot } from "@/services/ai/cfoTools";
import { DEMO_USER, DEMO_TRANSACTIONS, DEMO_GOALS } from "@/lib/demo-data";

describe("cfoTools", () => {
  it("returns snapshot from domain services", () => {
    const result = execGetFinancialSnapshot({
      monthlyIncome: DEMO_USER.monthlyIncome,
      transactions: DEMO_TRANSACTIONS,
      goals: DEMO_GOALS,
      fromOnboarding: false,
    });

    expect(result.financialScore).toBeGreaterThan(0);
    expect(result.income).toBeGreaterThan(result.expenses);
  });
});
