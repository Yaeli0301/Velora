import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { handleCFOMessage, toToolContext } from "@/services/ai/cfoOrchestrator";
import { buildUserProfile } from "@/lib/user-profile";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { getManualFinance } from "@/lib/db/finance-repository";
import { isMongoConfigured } from "@/lib/mongodb";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { manualFinanceSchema } from "@/lib/validations/finance-data";
import type { ManualFinanceData } from "@/lib/finance-data-store";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
  onboarding: onboardingSchema.nullable().optional(),
  manualFinance: manualFinanceSchema.nullable().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await auth();
  let onboarding = parsed.data.onboarding ?? null;
  let manual: ManualFinanceData | null = parsed.data.manualFinance
    ? { ...parsed.data.manualFinance, updatedAt: new Date().toISOString() }
    : null;

  if (session?.user?.id && isMongoConfigured()) {
    const stored = await getUserOnboarding(session.user.id);
    if (stored) onboarding = stored.onboarding;
    const dbManual = await getManualFinance(session.user.id);
    if (dbManual) manual = dbManual;
  }

  const profile = buildUserProfile(onboarding, manual);

  const result = await handleCFOMessage({
    message: parsed.data.message,
    history: parsed.data.history,
    context: toToolContext(
      profile.user.monthlyIncome,
      profile.transactions,
      profile.goals,
      profile.fromOnboarding && !profile.usesManualData
    ),
  });

  return NextResponse.json(result);
}
