"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getOnboardingData } from "@/lib/onboarding-store";
import { getManualFinanceData } from "@/lib/finance-data-store";
import { buildUserProfile, type UserProfile } from "@/lib/user-profile";

const DEFAULT_PROFILE = buildUserProfile(null);

export function useUserProfile(): UserProfile & {
  loading: boolean;
  persisted: boolean;
} {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [persisted, setPersisted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function loadLocal() {
      return buildUserProfile(getOnboardingData(), getManualFinanceData());
    }

    async function refresh() {
      if (status === "loading") return;

      if (session?.user) {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = (await res.json()) as UserProfile & {
              persisted?: boolean;
            };
            if (!cancelled) {
              setProfile(data);
              setPersisted(Boolean(data.persisted));
              setLoading(false);
            }
            return;
          }
        } catch {
          // fall through
        }
      }

      if (!cancelled) {
        setProfile(loadLocal());
        setPersisted(false);
        setLoading(false);
      }
    }

    refresh();

    function onLocalUpdate() {
      if (!session?.user) setProfile(loadLocal());
    }

    window.addEventListener("storage", onLocalUpdate);
    window.addEventListener("velora:onboarding-updated", onLocalUpdate);
    window.addEventListener("velora:finance-updated", onLocalUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onLocalUpdate);
      window.removeEventListener("velora:onboarding-updated", onLocalUpdate);
      window.removeEventListener("velora:finance-updated", onLocalUpdate);
    };
  }, [session, status]);

  return { ...profile, loading, persisted };
}

export function notifyProfileUpdated(): void {
  window.dispatchEvent(new Event("velora:onboarding-updated"));
}
