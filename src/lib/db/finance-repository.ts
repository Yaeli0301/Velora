import type { ManualFinanceData } from "@/lib/finance-data-store";
import type { OnboardingData } from "@/types";
import { buildDashboardSummary } from "@/services/finance/financeService";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/db/types";

export interface StoredManualFinance extends ManualFinanceData {
  userId: string;
}

export interface StoredFinancialSnapshot {
  userId: string;
  period: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  financialScore: number;
  status: "on-track" | "at-risk" | "off-track";
  headline: string;
  source: "manual" | "import" | "demo";
  createdAt: Date;
}

export interface StoredWeeklyBrief {
  userId: string;
  weekOf: string;
  brief: Record<string, unknown>;
  status: "draft" | "scheduled" | "sent";
  createdAt: Date;
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function saveManualFinance(
  userId: string,
  data: ManualFinanceData
): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  const db = await getDb();
  if (!db) return false;

  await db.collection<StoredManualFinance>("manual_finance").updateOne(
    { userId },
    { $set: { ...data, userId } },
    { upsert: true }
  );
  return true;
}

export async function getManualFinance(
  userId: string
): Promise<ManualFinanceData | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  if (!db) return null;

  const doc = await db
    .collection<StoredManualFinance>("manual_finance")
    .findOne({ userId });
  if (!doc) return null;

  const { userId: _, ...rest } = doc;
  return rest;
}

export async function saveFinancialSnapshot(
  userId: string,
  onboarding: OnboardingData | null,
  manual: ManualFinanceData | null,
  summary: ReturnType<typeof buildDashboardSummary>
): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  const db = await getDb();
  if (!db) return false;

  const snapshot: StoredFinancialSnapshot = {
    userId,
    period: currentPeriod(),
    income: summary.income,
    expenses: summary.expenses,
    savings: summary.savings,
    savingsRate: summary.savingsRate,
    financialScore: summary.financialScore,
    status: summary.status,
    headline: summary.headline,
    source: manual ? "manual" : onboarding ? "manual" : "demo",
    createdAt: new Date(),
  };

  await db.collection<StoredFinancialSnapshot>("financial_snapshots").updateOne(
    { userId, period: snapshot.period },
    { $set: snapshot },
    { upsert: true }
  );
  return true;
}

export async function saveWeeklyBriefDoc(
  userId: string,
  weekOf: string,
  brief: Record<string, unknown>
): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  const db = await getDb();
  if (!db) return false;

  await db.collection<StoredWeeklyBrief>("weekly_briefs").updateOne(
    { userId, weekOf },
    {
      $set: {
        userId,
        weekOf,
        brief,
        status: "scheduled",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  return true;
}

export async function getLatestWeeklyBrief(
  userId: string
): Promise<Record<string, unknown> | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  if (!db) return null;

  const doc = await db
    .collection<StoredWeeklyBrief>("weekly_briefs")
    .findOne({ userId }, { sort: { weekOf: -1 } });
  return doc?.brief ?? null;
}
