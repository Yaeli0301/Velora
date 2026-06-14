import { describe, it, expect } from "vitest";
import { onboardingSchema } from "@/lib/validations/onboarding";

describe("onboardingSchema", () => {
  it("accepts valid onboarding payload", () => {
    const result = onboardingSchema.safeParse({
      monthlyIncome: 15000,
      goalType: "apartment",
      timelineYears: 5,
      targetAmount: 500000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects income below minimum", () => {
    const result = onboardingSchema.safeParse({
      monthlyIncome: 1000,
      goalType: "apartment",
      timelineYears: 5,
    });
    expect(result.success).toBe(false);
  });
});
