import { NextResponse } from "next/server";
import { listProfilesForWeeklyBrief } from "@/lib/db/settings-repository";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { getManualFinance } from "@/lib/db/finance-repository";
import { buildUserProfile } from "@/lib/user-profile";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import {
  buildWeeklyCFOBrief,
  scheduleBrief,
} from "@/services/brief/weeklyBrief";
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

/** Vercel Cron — Sunday 07:00 IST (05:00 UTC). Secure with CRON_SECRET. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const profiles = await listProfilesForWeeklyBrief();
  const weekOf = weekOfToday();
  const results: { email: string; sent: boolean; error?: string }[] = [];

  for (const profile of profiles) {
    const stored = await getUserOnboarding(profile.userId);
    if (!stored) continue;

    const manual = await getManualFinance(profile.userId);
    const userProfile = buildUserProfile(stored.onboarding, manual);
    const payload = buildDecisionHomePayload({
      monthlyIncome: userProfile.user.monthlyIncome,
      transactions: userProfile.transactions,
      goals: userProfile.goals,
      onboardingOnly:
        userProfile.fromOnboarding && !userProfile.usesManualData,
    });

    const brief = scheduleBrief(
      buildWeeklyCFOBrief({
        userId: profile.userId,
        weekOf,
        payload,
      })
    );

    await saveWeeklyBriefDoc(
      profile.userId,
      weekOf,
      brief as unknown as Record<string, unknown>
    );

    const emailResult = await sendWeeklyBriefEmail(profile.email, brief);
    results.push({
      email: profile.email,
      sent: emailResult.sent,
      error: emailResult.error,
    });
  }

  return NextResponse.json({
    weekOf,
    processed: results.length,
    results,
  });
}
