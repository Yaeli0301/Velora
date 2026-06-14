import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserOnboarding } from "@/lib/db/user-repository";
import { getManualFinance } from "@/lib/db/finance-repository";
import { buildUserProfile } from "@/lib/user-profile";
import { isMongoConfigured } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const stored = await getUserOnboarding(session.user.id);
  if (!stored) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const manual = await getManualFinance(session.user.id);
  const profile = buildUserProfile(stored.onboarding, manual);

  return NextResponse.json({
    ...profile,
    user: {
      ...profile.user,
      name: stored.profile.name ?? profile.user.name,
      email: stored.profile.email,
    },
    fromOnboarding: true,
    persisted: true,
  });
}
