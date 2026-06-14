import { describe, it, expect } from "vitest";
import { buildUserProfile } from "@/lib/user-profile";
import type { OnboardingData } from "@/types";
import { DEFAULT_GOAL_TARGETS } from "@/lib/constants";

describe("buildUserProfile", () => {
  it("returns demo profile when onboarding is null", () => {
    const profile = buildUserProfile(null);
    expect(profile.fromOnboarding).toBe(false);
    expect(profile.user.monthlyIncome).toBe(14500);
    expect(profile.goals).toHaveLength(2);
  });

  it("personalizes income and primary goal from onboarding", () => {
    const onboarding: OnboardingData = {
      monthlyIncome: 20000,
      goalType: "car",
      timelineYears: 3,
    };
    const profile = buildUserProfile(onboarding);
    expect(profile.fromOnboarding).toBe(true);
    expect(profile.user.monthlyIncome).toBe(20000);
    expect(profile.goals[0].type).toBe("car");
    expect(profile.goals[0].targetAmount).toBe(DEFAULT_GOAL_TARGETS.car);
    expect(profile.goals[0].monthlyContribution).toBeGreaterThan(0);
  });

  it("uses custom target amount when provided", () => {
    const onboarding: OnboardingData = {
      monthlyIncome: 18000,
      goalType: "apartment",
      timelineYears: 5,
      targetAmount: 800000,
    };
    const profile = buildUserProfile(onboarding);
    expect(profile.goals[0].targetAmount).toBe(800000);
  });
});
