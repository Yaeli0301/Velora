"use client";

import { useEffect, useState } from "react";
import { getOnboardingData } from "@/lib/onboarding-store";
import { buildUserProfile, type UserProfile } from "@/lib/user-profile";

const DEFAULT_PROFILE = buildUserProfile(null);

export function useUserProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    function refresh() {
      setProfile(buildUserProfile(getOnboardingData()));
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("velora:onboarding-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("velora:onboarding-updated", refresh);
    };
  }, []);

  return profile;
}

export function notifyProfileUpdated(): void {
  window.dispatchEvent(new Event("velora:onboarding-updated"));
}
