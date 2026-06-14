import { describe, it, expect } from "vitest";
import { buildUserProfile } from "@/lib/user-profile";
import type { OnboardingData } from "@/types";

describe("manual finance in profile", () => {
  it("uses manual expenses instead of demo", () => {
    const onboarding: OnboardingData = {
      monthlyIncome: 15000,
      goalType: "apartment",
      timelineYears: 5,
    };
    const profile = buildUserProfile(onboarding, {
      totalMonthlyExpenses: 5000,
      updatedAt: new Date().toISOString(),
    });

    expect(profile.usesManualData).toBe(true);
    expect(profile.transactions).toHaveLength(1);
    expect(profile.transactions[0].amount).toBe(5000);
  });
});
