import { describe, it, expect } from "vitest";
import {
  mean,
  standardDeviation,
  movingAverage,
  linearTrend,
  buildForecast,
  monthsUntilTarget,
  describeTrend,
} from "./forecastEngine";

describe("mean", () => {
  it("returns 0 for empty input", () => {
    expect(mean([])).toBe(0);
  });
  it("computes the average", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
});

describe("standardDeviation", () => {
  it("is 0 when all values are equal", () => {
    expect(standardDeviation([5, 5, 5])).toBe(0);
  });
  it("computes population std dev", () => {
    expect(standardDeviation([2, 4, 6])).toBeCloseTo(1.633, 2);
  });
});

describe("movingAverage", () => {
  it("smooths a series over a window", () => {
    expect(movingAverage([10, 20, 30], 2)).toEqual([10, 15, 25]);
  });
  it("returns empty for non-positive window", () => {
    expect(movingAverage([1, 2], 0)).toEqual([]);
  });
});

describe("linearTrend", () => {
  it("detects a positive slope", () => {
    expect(linearTrend([1, 2, 3, 4])).toBeCloseTo(1, 5);
  });
  it("detects a negative slope", () => {
    expect(linearTrend([4, 3, 2, 1])).toBeCloseTo(-1, 5);
  });
  it("returns 0 for fewer than 2 points", () => {
    expect(linearTrend([5])).toBe(0);
  });
});

describe("buildForecast", () => {
  it("accumulates savings across horizons", () => {
    const snapshot = { income: 10000, expenses: 8000, savings: 2000, savingsRate: 0.2 };
    const [oneYear] = buildForecast(snapshot, [1], { monthlyGrowth: 0 });
    expect(oneYear.savings).toBe(24000);
  });
  it("never projects negative savings", () => {
    const snapshot = { income: 5000, expenses: 6000, savings: -1000, savingsRate: -0.2 };
    const [p] = buildForecast(snapshot, [5]);
    expect(p.savings).toBe(0);
  });
});

describe("monthsUntilTarget", () => {
  it("returns Infinity when not saving", () => {
    expect(monthsUntilTarget(1000, 0, 0)).toBe(Infinity);
  });
  it("returns 0 when already reached", () => {
    expect(monthsUntilTarget(1000, 1200, 100)).toBe(0);
  });
  it("rounds up partial months", () => {
    expect(monthsUntilTarget(1000, 0, 300)).toBe(4);
  });
});

describe("describeTrend", () => {
  it("flags worsening spending", () => {
    expect(describeTrend([1000, 2000, 3000, 4000, 5000])).toBe("worsening");
  });
  it("flags improving spending", () => {
    expect(describeTrend([5000, 4000, 3000, 2000, 1000])).toBe("improving");
  });
  it("treats flat spending as stable", () => {
    expect(describeTrend([3000, 3000, 3000, 3000])).toBe("stable");
  });
});
