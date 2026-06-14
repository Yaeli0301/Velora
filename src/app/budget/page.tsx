import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { DEMO_BUDGETS } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "התקציב החכם שלך | Velora",
};

export default function BudgetPage() {
  const totalSpent = DEMO_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalLimit = DEMO_BUDGETS.reduce((s, b) => s + b.limit, 0);
  const overspent = DEMO_BUDGETS.filter((b) => b.spent > b.limit);

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <AppNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">התקציב החכם שלך</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            קטלוג אוטומטי של ההוצאות — כדי שתדע לאן הכסף הולך.
          </p>
        </div>

        <Card className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <CardLabel>סה&quot;כ הוצאות החודש</CardLabel>
              <p className="mt-1 text-3xl font-bold">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              מתוך תקציב של {formatCurrency(totalLimit)}
            </p>
          </div>
          <Progress
            className="mt-4"
            value={(totalSpent / totalLimit) * 100}
            tone={totalSpent > totalLimit ? "warning" : "primary"}
            label="ניצול התקציב הכולל"
          />
          {overspent.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              חרגת ב-{overspent.length} קטגוריות. הגדולה ביותר:{" "}
              <span className="font-semibold text-foreground">
                {CATEGORY_LABELS[overspent[0].category]}
              </span>
              .
            </p>
          )}
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DEMO_BUDGETS.map((b) => {
            const pct = (b.spent / b.limit) * 100;
            const over = b.spent > b.limit;
            return (
              <Card key={b._id}>
                <div className="flex items-center justify-between">
                  <CardTitle>{CATEGORY_LABELS[b.category]}</CardTitle>
                  <Badge tone={over ? "warning" : "neutral"}>
                    {over ? "חריגה" : `${Math.round(pct)}%`}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(b.spent)}</span>
                  <span>תקרה {formatCurrency(b.limit)}</span>
                </div>
                <Progress
                  className="mt-2"
                  value={pct}
                  tone={over ? "warning" : "primary"}
                  label={`ניצול תקציב ${CATEGORY_LABELS[b.category]}`}
                />
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
