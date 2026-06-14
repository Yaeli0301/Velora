"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardLabel } from "@/components/ui/card";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { buildWeeklyCFOBrief } from "@/services/brief/weeklyBrief";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { WeeklyCFOBrief } from "@/types/decisions";

function weekOfToday(): string {
  const d = new Date();
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return sunday.toISOString().slice(0, 10);
}

export function WeeklyBriefCard() {
  const { data: session } = useSession();
  const profile = useUserProfile();
  const [brief, setBrief] = useState<WeeklyCFOBrief | null>(null);

  useEffect(() => {
    if (profile.loading) return;

    if (session?.user) {
      fetch("/api/brief")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setBrief(data.brief))
        .catch(() => buildLocalBrief());
    } else {
      buildLocalBrief();
    }

    function buildLocalBrief() {
      const payload = buildDecisionHomePayload({
        monthlyIncome: profile.user.monthlyIncome,
        transactions: profile.transactions,
        goals: profile.goals,
        onboardingOnly: profile.fromOnboarding && !profile.usesManualData,
      });
      setBrief(
        buildWeeklyCFOBrief({
          userId: "guest",
          weekOf: weekOfToday(),
          payload,
        })
      );
    }
  }, [session?.user, profile.loading, profile]);

  if (!brief) return null;

  return (
    <Card className="mt-6">
      <CardLabel>הבריף השבועי של ה-CFO</CardLabel>
      <p className="mt-2 text-sm font-semibold">{brief.headline}</p>
      <p className="mt-2 text-sm text-muted-foreground">{brief.decision.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        ציון {brief.verdict.score}/100 · סטטוס:{" "}
        {brief.verdict.status === "on-track"
          ? "בדרך"
          : brief.verdict.status === "at-risk"
            ? "דורש תשומת לב"
            : "צריך פעולה"}
      </p>
    </Card>
  );
}
