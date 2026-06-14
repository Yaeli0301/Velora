import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProfileSettings,
  updateProfileSettings,
  defaultSettings,
} from "@/lib/db/settings-repository";
import { isMongoConfigured } from "@/lib/mongodb";
import { z } from "zod";

const settingsSchema = z.object({
  weeklyBrief: z.boolean(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({
      settings: defaultSettings(),
      persisted: false,
    });
  }

  const settings = await getProfileSettings(session.user.id);
  return NextResponse.json({ settings, persisted: true });
}

export async function PATCH(request: Request) {
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

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const settings = {
    notifications: { weeklyBrief: parsed.data.weeklyBrief },
  };

  if (isMongoConfigured()) {
    await updateProfileSettings(session.user.id, settings);
  }

  return NextResponse.json({ settings, persisted: isMongoConfigured() });
}
