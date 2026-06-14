import { getDb, isMongoConfigured } from "@/lib/mongodb";
import type { StoredProfile } from "@/lib/db/types";
import { COLLECTIONS } from "@/lib/db/types";

export async function listProfilesForWeeklyBrief(): Promise<StoredProfile[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  if (!db) return [];

  return db
    .collection<StoredProfile>(COLLECTIONS.profiles)
    .find({
      $or: [
        { "settings.notifications.weeklyBrief": { $ne: false } },
        { settings: { $exists: false } },
      ],
    })
    .toArray();
}

export async function updateProfileSettings(
  userId: string,
  settings: StoredProfile["settings"]
): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  const db = await getDb();
  if (!db) return false;

  await db.collection<StoredProfile>(COLLECTIONS.profiles).updateOne(
    { userId },
    { $set: { settings, updatedAt: new Date() } }
  );
  return true;
}

export async function getProfileSettings(
  userId: string
): Promise<StoredProfile["settings"]> {
  if (!isMongoConfigured()) return defaultSettings();
  const db = await getDb();
  if (!db) return defaultSettings();

  const profile = await db
    .collection<StoredProfile>(COLLECTIONS.profiles)
    .findOne({ userId });

  return profile?.settings ?? defaultSettings();
}

export function defaultSettings(): StoredProfile["settings"] {
  return { notifications: { weeklyBrief: true } };
}
