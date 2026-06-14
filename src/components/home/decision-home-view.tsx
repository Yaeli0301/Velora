"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardLabel } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { DecisionHero } from "@/components/decision/decision-hero";
import { VerdictStrip } from "@/components/decision/verdict-strip";
import { HealthTimeline } from "@/components/decision/health-timeline";
import { useUserProfile } from "@/hooks/use-user-profile";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { GOAL_LABELS } from "@/lib/constants";
import {
  getDecisionStatus,
  saveDecisionStatus,
  notifyDecisionUpdated,
} from "@/lib/decision-store";
import { WeeklyBriefCard } from "@/components/home/weekly-brief-card";
import type { DecisionStatus } from "@/types/decisions";

export function DecisionHomeView() {
  const { user, goals, transactions, fromOnboarding, persisted, loading } =
    useUserProfile();
  const { data: session } = useSession();
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>("pending");

  useEffect(() => {
    setDecisionStatus(getDecisionStatus());
    function refresh() {
      setDecisionStatus(getDecisionStatus());
    }
    window.addEventListener("velora:decision-updated", refresh);
    return () => window.removeEventListener("velora:decision-updated", refresh);
  }, []);

  const payload = useMemo(
    () =>
      buildDecisionHomePayload({
        monthlyIncome: user.monthlyIncome,
        transactions,
        goals,
        onboardingOnly: fromOnboarding,
        decisionStatus,
      }),
    [user.monthlyIncome, transactions, goals, fromOnboarding, decisionStatus]
  );

  const primaryGoal = goals[0];
  const goalLabel = primaryGoal ? GOAL_LABELS[primaryGoal.type] : "יעד";

  function acceptDecision() {
    saveDecisionStatus("accepted");
    notifyDecisionUpdated();
    setDecisionStatus("accepted");
  }

  function dismissDecision() {
    saveDecisionStatus("dismissed");
    notifyDecisionUpdated();
    setDecisionStatus("dismissed");
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          טוען את ההחלטה שלך…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 animate-fade-in lg:max-w-3xl lg:px-8 lg:py-8">
        {fromOnboarding && !persisted && !session?.user && (
          <Card className="mb-6 border-primary/30 bg-primary-soft/40">
            <CardLabel className="text-primary">שמרי את התוכנית</CardLabel>
            <p className="mt-1 text-sm text-muted-foreground">
              התוכנית נשמרת רק במכשיר הזה. התחבר/י כדי לשמור בענן.
            </p>
            <ButtonLink href="/login?saved=1" className="mt-4" size="sm">
              שמור את התוכנית שלי
            </ButtonLink>
          </Card>
        )}

        <DecisionHero
          decision={payload.decision}
          onAccept={acceptDecision}
          onDismiss={dismissDecision}
        />

        <div className="mt-4">
          <VerdictStrip
            status={payload.insightContext.snapshot.status}
            score={payload.insightContext.snapshot.financialScore}
            yearsToGoal={payload.yearsToGoal}
          />
        </div>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          יעד: {goalLabel}
          {payload.yearsToGoal > 0 && (
            <> · כ-{payload.yearsToGoal.toFixed(1)} שנים בקצב הנוכחי</>
          )}
        </p>

        <details className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
            ה-CFO אומר: {payload.topInsight?.title ?? "2 דברים דורשים תשומת לב"}
          </summary>
          <div className="space-y-3 border-t border-border px-4 py-4">
            {payload.insightContext.insights.slice(0, 3).map((insight) => (
              <div key={insight.id}>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {insight.message}
                </p>
              </div>
            ))}
            <Link
              href="/cfo"
              className="inline-block text-sm font-semibold text-primary hover:underline"
            >
              שאל את ה-CFO ←
            </Link>
          </div>
        </details>

        <div className="mt-6">
          <HealthTimeline timeline={payload.timeline} />
        </div>

        <WeeklyBriefCard />

        <div className="mt-4 flex justify-center">
          <ButtonLink href="/data" variant="secondary" size="sm">
            עדכן הכנסה והוצאות
          </ButtonLink>
        </div>
      </main>
    </AppLayout>
  );
}
