import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { manualFinanceSchema } from "@/lib/validations/finance-data";
import {
  getManualFinance,
  saveManualFinance,
  saveFinancialSnapshot,
} from "@/lib/db/finance-repository";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { buildUserProfile } from "@/lib/user-profile";
import { buildDashboardSummary } from "@/services/finance/financeService";
import { isMongoConfigured } from "@/lib/mongodb";
import type { ManualFinanceData } from "@/lib/finance-data-store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const manual = await getManualFinance(session.user.id);
  return NextResponse.json({ manual });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = manualFinanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const manual: ManualFinanceData = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  if (isMongoConfigured()) {
    await saveManualFinance(session.user.id, manual);
  }

  const stored = await getUserOnboarding(session.user.id);
  const profile = buildUserProfile(stored?.onboarding ?? null, manual);
  const summary = buildDashboardSummary(
    profile.user.monthlyIncome,
    profile.transactions,
    profile.goals
  );

  if (isMongoConfigured()) {
    await saveFinancialSnapshot(
      session.user.id,
      stored?.onboarding ?? null,
      manual,
      summary
    );
  }

  return NextResponse.json({
    ...profile,
    persisted: isMongoConfigured(),
    snapshot: {
      financialScore: summary.financialScore,
      status: summary.status,
      headline: summary.headline,
    },
  });
}
