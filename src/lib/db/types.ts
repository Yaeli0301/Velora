import type { OnboardingData } from "@/types";

export const COLLECTIONS = {
  profiles: "profiles",
  lifePlans: "life_plans",
} as const;

export interface StoredProfile {
  userId: string;
  email: string;
  name?: string | null;
  monthlyIncome: number;
  onboardingCompletedAt: Date;
  locale: "he-IL";
  updatedAt: Date;
  settings?: {
    notifications: {
      weeklyBrief: boolean;
    };
  };
}

export interface StoredLifePlan {
  userId: string;
  type: OnboardingData["goalType"];
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  timelineYears: number;
  monthlyContribution: number;
  priority: "primary" | "secondary";
  status: "active" | "achieved" | "paused";
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredUserData {
  profile: StoredProfile;
  onboarding: OnboardingData;
  primaryPlan: StoredLifePlan;
}
