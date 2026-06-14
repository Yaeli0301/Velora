import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildUserProfile } from "@/lib/user-profile";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { getManualFinance } from "@/lib/db/finance-repository";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { buildWeeklyCFOBrief } from "@/services/brief/weeklyBrief";
import { sendWeeklyBriefEmail } from "@/lib/email/send-weekly-brief";
import { saveWeeklyBriefDoc } from "@/lib/db/finance-repository";
import { isMongoConfigured } from "@/lib/mongodb";

function weekOfToday(): string {
  const d = new Date();
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return sunday.toISOString().slice(0, 10);
}

/** Manual trigger — sends weekly brief email to signed-in user (for testing). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
  const brief = buildWeeklyCFOBrief({
    userId: session.user.id,
    weekOf,
    payload,
  });

  if (isMongoConfigured()) {
    await saveWeeklyBriefDoc(
      session.user.id,
      weekOf,
      brief as unknown as Record<string, unknown>
    );
  }

  const result = await sendWeeklyBriefEmail(session.user.email, brief);

  return NextResponse.json({
    brief,
    email: result,
  });
}
