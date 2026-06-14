import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { getManualFinance } from "@/lib/db/finance-repository";
import { buildUserProfile } from "@/lib/user-profile";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { buildWeeklyCFOBrief, scheduleBrief } from "@/services/brief/weeklyBrief";
import { isMongoConfigured } from "@/lib/mongodb";
import { saveWeeklyBriefDoc } from "@/lib/db/finance-repository";

function weekOfToday(): string {
  const d = new Date();
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return sunday.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stored = isMongoConfigured()
    ? await getUserOnboarding(session.user.id)
    : null;
  const manual =
    isMongoConfigured() ? await getManualFinance(session.user.id) : null;

  const profile = buildUserProfile(stored?.onboarding ?? null, manual);
  const payload = buildDecisionHomePayload({
    monthlyIncome: profile.user.monthlyIncome,
    transactions: profile.transactions,
    goals: profile.goals,
    onboardingOnly: profile.fromOnboarding && !profile.usesManualData,
  });

  const weekOf = weekOfToday();
  const brief = scheduleBrief(
    buildWeeklyCFOBrief({
      userId: session.user.id,
      weekOf,
      payload,
    })
  );

  if (isMongoConfigured()) {
    await saveWeeklyBriefDoc(
      session.user.id,
      weekOf,
      brief as unknown as Record<string, unknown>
    );
  }

  return NextResponse.json({ brief, weekOf });
}
