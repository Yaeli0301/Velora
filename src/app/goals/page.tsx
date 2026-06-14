import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { GOAL_ICONS, GOAL_LABELS } from "@/lib/constants";
import { DEMO_USER, DEMO_TRANSACTIONS, DEMO_GOALS } from "@/lib/demo-data";
import { buildSnapshot } from "@/services/finance/financeService";
import { monthsUntilTarget } from "@/services/forecast/forecastEngine";

export const metadata: Metadata = {
  title: "היעדים שלך | Velora",
};

export default function GoalsPage() {
  const snapshot = buildSnapshot(DEMO_USER.monthlyIncome, DEMO_TRANSACTIONS);

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">היעדים שלך</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              כמה חסר, ובכמה זמן תגיע — בלי נוסחאות.
            </p>
          </div>
          <ButtonLink href="/onboarding" size="sm">
            הוסף יעד
          </ButtonLink>
        </div>

        <div className="mt-6 space-y-5">
          {DEMO_GOALS.map((goal) => {
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
                    label="קצב חיסכון נוכחי"
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
                      requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate)
                    )}/חודש`}
                    highlight
                  />
                </dl>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
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
  const ms = target.getTime() - now.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365);
}

function requiredMonthly(
  target: number,
  current: number,
  dateIso: string
): number {
  const years = Math.max(0.1, yearsUntil(dateIso));
  const gap = Math.max(0, target - current);
  return Math.ceil(gap / (years * 12));
}
