"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getOnboardingData, clearOnboardingData } from "@/lib/onboarding-store";
import { notifyProfileUpdated } from "@/hooks/use-user-profile";

/**
 * After sign-in, merges guest onboarding from localStorage into MongoDB once.
 */
export function GuestDataMerger() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const guest = getOnboardingData();
    if (!guest) return;

    let cancelled = false;

    async function merge() {
      try {
        const res = await fetch("/api/onboarding/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guest),
        });

        if (!cancelled && res.ok) {
          clearOnboardingData();
          notifyProfileUpdated();
        }
      } catch {
        // Keep local data if merge fails; user can retry on next load.
      }
    }

    merge();
    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}
