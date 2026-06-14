"use client";

import { AppNav } from "@/components/app-nav";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import { ButtonLink } from "@/components/ui/button";
import { TrendIcon, WalletIcon, ArrowLeftIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import { GOAL_LABELS } from "@/lib/constants";
import { buildDashboardSummary } from "@/services/finance/financeService";
import { monthsUntilTarget } from "@/services/forecast/forecastEngine";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSession } from "next-auth/react";

const STATUS_META = {
  "on-track": { tone: "success" as const, label: "בדרך הנכונה" },
  "at-risk": { tone: "warning" as const, label: "דורש תשומת לב" },
  "off-track": { tone: "danger" as const, label: "צריך פעולה" },
};

export function DashboardView() {
  const { user, goals, transactions, fromOnboarding, persisted } = useUserProfile();
  const { data: session } = useSession();

  const summary = buildDashboardSummary(
    user.monthlyIncome,
    transactions,
    goals
  );
  const status = STATUS_META[summary.status];
  const primaryGoal = goals[0];
  const goalMonths = monthsUntilTarget(
    primaryGoal.targetAmount,
    primaryGoal.currentAmount,
    Math.max(summary.savings, primaryGoal.monthlyContribution)
  );
  const goalPct =
    (primaryGoal.currentAmount / primaryGoal.targetAmount) * 100;

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {fromOnboarding ? "התוכנית האישית שלך" : `שלום ${user.name},`}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">הסקירה החודשית שלך</h1>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        {fromOnboarding && !persisted && !session?.user && (
          <Card className="mt-6 border-primary/30 bg-primary-soft/40">
            <CardLabel className="text-primary">שמרי את התוכנית</CardLabel>
            <p className="mt-1 text-sm text-muted-foreground">
              התוכנית שלך נשמרת רק במכשיר הזה. התחבר/י כדי לשמור אותה בענן.
            </p>
            <ButtonLink href="/login?saved=1" className="mt-4" size="sm">
              שמור את התוכנית שלי
            </ButtonLink>
          </Card>
        )}

        <Card className="mt-6 border-primary/30 bg-primary-soft/50">
          <CardLabel className="text-primary">השורה התחתונה</CardLabel>
          <p className="mt-1 text-lg font-semibold leading-relaxed sm:text-xl">
            {summary.headline}
          </p>
        </Card>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Card className="flex flex-col items-center justify-center">
            <ScoreRing score={summary.financialScore} />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              מתבסס על שיעור החיסכון, האיזון החודשי וההתקדמות ליעדים.
            </p>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            <Card>
              <CardLabel>הכנסה חודשית</CardLabel>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(summary.income)}
              </p>
            </Card>
            <Card>
              <CardLabel>הוצאות חודשיות</CardLabel>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(summary.expenses)}
              </p>
            </Card>
            <Card>
              <CardLabel>חיסכון החודש</CardLabel>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatCurrency(summary.savings)}
              </p>
            </Card>
            <Card>
              <CardLabel>שיעור חיסכון</CardLabel>
              <p className="mt-1 text-2xl font-bold">
                {Math.round(summary.savingsRate * 100)}%
              </p>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <WalletIcon className="h-4 w-4" />
              </span>
              <CardTitle>יעד מרכזי: {GOAL_LABELS[primaryGoal.type]}</CardTitle>
            </div>
            <ButtonLink href="/goals" variant="ghost" size="sm">
              לכל היעדים
              <ArrowLeftIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(primaryGoal.currentAmount)} מתוך{" "}
                {formatCurrency(primaryGoal.targetAmount)}
              </span>
              <span className="font-semibold">{Math.round(goalPct)}%</span>
            </div>
            <Progress
              className="mt-2"
              value={goalPct}
              label={`התקדמות ליעד ${GOAL_LABELS[primaryGoal.type]}`}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              חסרים עוד{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(
                  primaryGoal.targetAmount - primaryGoal.currentAmount
                )}
              </span>{" "}
              · כ-{(goalMonths / 12).toFixed(1)} שנים בקצב הנוכחי
            </p>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
              <TrendIcon className="h-4 w-4" />
            </span>
            <CardTitle>איך ייראה החיסכון שלך</CardTitle>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {summary.forecasts.map((f) => (
              <div
                key={f.year}
                className="rounded-2xl border border-border bg-muted/40 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  בעוד {f.year} {f.year === 1 ? "שנה" : "שנים"}
                </p>
                <p className="mt-1 text-xl font-bold text-primary">
                  {formatCurrency(f.savings)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * תחזית מבוססת על קצב החיסכון הנוכחי. לא ייעוץ השקעות.
          </p>
        </Card>

        {summary.insights.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {summary.insights.map((insight) => (
              <Card key={insight.id}>
                <Badge
                  tone={
                    insight.type === "warning"
                      ? "warning"
                      : insight.type === "success"
                        ? "success"
                        : insight.type === "action"
                          ? "primary"
                          : "neutral"
                  }
                >
                  {insight.title}
                </Badge>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {insight.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
