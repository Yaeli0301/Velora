import { describe, it, expect } from "vitest";
import {
  buildSnapshot,
  calcFinancialScore,
  scoreStatus,
  buildInsights,
} from "./financeService";
import type { Transaction, Goal } from "@/types";

const tx = (amount: number, type: Transaction["type"]): Transaction => ({
  _id: Math.random().toString(),
  userId: "u",
  amount,
  category: "other",
  type,
  description: "",
  date: "2026-06-01",
});

const goal = (target: number, current: number): Goal => ({
  _id: "g",
  userId: "u",
  title: "דירה",
  type: "apartment",
  targetAmount: target,
  currentAmount: current,
  targetDate: "2032-01-01",
  monthlyContribution: 1000,
});

describe("buildSnapshot", () => {
  it("computes income, expenses, savings and rate", () => {
    const snap = buildSnapshot(10000, [tx(3000, "expense"), tx(1000, "expense")]);
    expect(snap.income).toBe(10000);
    expect(snap.expenses).toBe(4000);
    expect(snap.savings).toBe(6000);
    expect(snap.savingsRate).toBeCloseTo(0.6, 5);
  });
  it("includes extra income transactions", () => {
    const snap = buildSnapshot(10000, [tx(2000, "income"), tx(1000, "expense")]);
    expect(snap.income).toBe(12000);
    expect(snap.savings).toBe(11000);
  });
});

describe("calcFinancialScore", () => {
  it("is between 0 and 100", () => {
    const snap = buildSnapshot(10000, [tx(8000, "expense")]);
    const score = calcFinancialScore(snap, [goal(100000, 50000)]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  it("rewards a strong saver more than a weak saver", () => {
    const strong = buildSnapshot(10000, [tx(5000, "expense")]);
    const weak = buildSnapshot(10000, [tx(9500, "expense")]);
    const g = [goal(100000, 50000)];
    expect(calcFinancialScore(strong, g)).toBeGreaterThan(
      calcFinancialScore(weak, g)
    );
  });
});

describe("scoreStatus", () => {
  it("maps score ranges to status", () => {
    expect(scoreStatus(80)).toBe("on-track");
    expect(scoreStatus(50)).toBe("at-risk");
    expect(scoreStatus(20)).toBe("off-track");
  });
});

describe("buildInsights", () => {
  it("warns on negative cashflow", () => {
    const snap = buildSnapshot(5000, [tx(6000, "expense")]);
    const insights = buildInsights(snap, []);
    expect(insights[0].type).toBe("warning");
  });
  it("congratulates a healthy saver", () => {
    const snap = buildSnapshot(10000, [tx(5000, "expense")]);
    const insights = buildInsights(snap, []);
    expect(insights.some((i) => i.type === "success")).toBe(true);
  });
});
