"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { GOAL_ICONS, GOAL_LABELS } from "@/lib/constants";
import { buildSnapshot } from "@/services/finance/financeService";
import { monthsUntilTarget } from "@/services/forecast/forecastEngine";
import { useUserProfile } from "@/hooks/use-user-profile";
import { HealthTimeline } from "@/components/decision/health-timeline";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";

export function PlanView() {
  const { user, goals, transactions, fromOnboarding } = useUserProfile();
  const snapshot = buildSnapshot(user.monthlyIncome, transactions);
  const payload = buildDecisionHomePayload({
    monthlyIncome: user.monthlyIncome,
    transactions,
    goals,
    onboardingOnly: fromOnboarding,
  });

  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 animate-fade-in lg:px-8 lg:py-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">התוכנית שלך</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            יעד חיים אחד, מסלול ברור — בלי רשימות מסובכות.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {goals.map((goal) => {
            const gap = goal.targetAmount - goal.currentAmount;
            const pct = (goal.currentAmount / goal.targetAmount) * 100;
            const monthsCurrent = monthsUntilTarget(
              goal.targetAmount,
              goal.currentAmount,
              Math.max(snapshot.savings, goal.monthlyContribution)
            );
            const onTrack = monthsCurrent / 12 <= yearsUntil(goal.targetDate);

            return (
              <Card key={goal._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">
                      {GOAL_ICONS[goal.type]}
                    </span>
                    <div>
                      <CardTitle>{goal.title}</CardTitle>
                      <CardLabel>{GOAL_LABELS[goal.type]}</CardLabel>
                    </div>
                  </div>
                  <Badge tone={onTrack ? "success" : "warning"}>
                    {onTrack ? "בדרך הנכונה" : "מאחור ביעד"}
                  </Badge>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} מתוך{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-semibold">{Math.round(pct)}%</span>
                  </div>
                  <Progress
                    className="mt-2"
                    value={pct}
                    tone={onTrack ? "primary" : "warning"}
                    label={`התקדמות ${goal.title}`}
                  />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Metric label="חסר ליעד" value={formatCurrency(gap)} />
                  <Metric
                    label="קצב נוכחי"
                    value={`${formatCurrency(goal.monthlyContribution)}/חודש`}
                  />
                  <Metric
                    label="זמן משוער"
                    value={
                      isFinite(monthsCurrent)
                        ? `${(monthsCurrent / 12).toFixed(1)} שנים`
                        : "—"
                    }
                  />
                  <Metric
                    label="חיסכון נדרש"
                    value={`${formatCurrency(
                      requiredMonthly(
                        goal.targetAmount,
                        goal.currentAmount,
                        goal.targetDate
                      )
                    )}/חודש`}
                    highlight
                  />
                </dl>
              </Card>
            );
          })}
        </div>

        <div className="mt-6">
          <HealthTimeline timeline={payload.timeline} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/home" variant="secondary" size="sm">
            חזרה להחלטה השבועית
          </ButtonLink>
          <ButtonLink href="/data" variant="secondary" size="sm">
            עדכן נתונים
          </ButtonLink>
          <ButtonLink href="/cfo" size="sm">
            שאל את ה-CFO
          </ButtonLink>
        </div>
      </main>
    </AppLayout>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          "mt-1 text-base font-bold " + (highlight ? "text-primary" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}

function yearsUntil(dateIso: string): number {
  const now = new Date();
  const target = new Date(dateIso);
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

function requiredMonthly(
  target: number,
  current: number,
  dateIso: string
): number {
  const years = Math.max(0.1, yearsUntil(dateIso));
  return Math.ceil(Math.max(0, target - current) / (years * 12));
}
