import type { OnboardingData } from "@/types";
import { DEFAULT_GOAL_TARGETS, GOAL_LABELS } from "@/lib/constants";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import {
  COLLECTIONS,
  type StoredLifePlan,
  type StoredProfile,
  type StoredUserData,
} from "@/lib/db/types";

function buildPrimaryPlan(
  userId: string,
  onboarding: OnboardingData
): StoredLifePlan {
  const targetAmount =
    onboarding.targetAmount ?? DEFAULT_GOAL_TARGETS[onboarding.goalType];
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() + onboarding.timelineYears);
  const currentAmount = Math.round(targetAmount * 0.08);
  const months = onboarding.timelineYears * 12;
  const gap = targetAmount - currentAmount;
  const monthlyContribution = Math.max(500, Math.ceil(gap / months));
  const now = new Date();

  return {
    userId,
    type: onboarding.goalType,
    title: GOAL_LABELS[onboarding.goalType],
    targetAmount,
    currentAmount,
    targetDate: targetDate.toISOString().slice(0, 10),
    timelineYears: onboarding.timelineYears,
    monthlyContribution,
    priority: "primary",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveUserOnboarding(
  userId: string,
  email: string,
  name: string | null | undefined,
  onboarding: OnboardingData
): Promise<StoredUserData | null> {
  if (!isMongoConfigured()) return null;

  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const profile: StoredProfile = {
    userId,
    email,
    name: name ?? null,
    monthlyIncome: onboarding.monthlyIncome,
    onboardingCompletedAt: now,
    locale: "he-IL",
    updatedAt: now,
    settings: {
      notifications: { weeklyBrief: true },
    },
  };
  const primaryPlan = buildPrimaryPlan(userId, onboarding);

  await db.collection<StoredProfile>(COLLECTIONS.profiles).updateOne(
    { userId },
    { $set: profile },
    { upsert: true }
  );

  await db.collection<StoredLifePlan>(COLLECTIONS.lifePlans).updateOne(
    { userId, priority: "primary" },
    { $set: primaryPlan },
    { upsert: true }
  );

  return { profile, onboarding, primaryPlan };
}

export async function getUserOnboarding(
  userId: string
): Promise<StoredUserData | null> {
  if (!isMongoConfigured()) return null;

  const db = await getDb();
  if (!db) return null;

  const profile = await db
    .collection<StoredProfile>(COLLECTIONS.profiles)
    .findOne({ userId });
  const primaryPlan = await db
    .collection<StoredLifePlan>(COLLECTIONS.lifePlans)
    .findOne({ userId, priority: "primary" });

  if (!profile || !primaryPlan) return null;

  const onboarding: OnboardingData = {
    monthlyIncome: profile.monthlyIncome,
    goalType: primaryPlan.type,
    timelineYears: primaryPlan.timelineYears,
    targetAmount: primaryPlan.targetAmount,
  };

  return { profile, onboarding, primaryPlan };
}

export async function mergeGuestOnboarding(
  userId: string,
  email: string,
  name: string | null | undefined,
  onboarding: OnboardingData
): Promise<StoredUserData | null> {
  const existing = await getUserOnboarding(userId);
  if (existing) return existing;
  return saveUserOnboarding(userId, email, name, onboarding);
}
