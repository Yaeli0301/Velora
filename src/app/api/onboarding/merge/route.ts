import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mergeGuestOnboarding } from "@/lib/db/user-repository";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { buildUserProfile } from "@/lib/user-profile";
import { isMongoConfigured } from "@/lib/mongodb";

/** Merges guest localStorage onboarding into the signed-in user account. */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const stored = await mergeGuestOnboarding(
    session.user.id,
    session.user.email,
    session.user.name,
    parsed.data
  );

  if (!stored) {
    return NextResponse.json({ error: "Merge failed" }, { status: 500 });
  }

  const profile = buildUserProfile(stored.onboarding);
  return NextResponse.json({
    ...profile,
    user: {
      ...profile.user,
      name: stored.profile.name ?? profile.user.name,
      email: stored.profile.email,
    },
    fromOnboarding: true,
    persisted: true,
    merged: true,
  });
}
