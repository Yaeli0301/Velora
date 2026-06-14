import { describe, it, expect } from "vitest";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { DEMO_USER, DEMO_TRANSACTIONS, DEMO_GOALS } from "@/lib/demo-data";

describe("buildDecisionHomePayload", () => {
  it("returns a decision with title and timeline", () => {
    const payload = buildDecisionHomePayload({
      monthlyIncome: DEMO_USER.monthlyIncome,
      transactions: DEMO_TRANSACTIONS,
      goals: DEMO_GOALS,
    });

    expect(payload.decision.title).toBeTruthy();
    expect(payload.timeline.milestones).toHaveLength(4);
    expect(payload.insightContext.snapshot.financialScore).toBeGreaterThan(0);
  });
});
