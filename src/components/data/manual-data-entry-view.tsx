"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { BudgetCategory } from "@/types";
import {
  getManualFinanceData,
  saveManualFinanceData,
} from "@/lib/finance-data-store";
import { useUserProfile } from "@/hooks/use-user-profile";
import { buildSnapshot } from "@/services/finance/financeService";

const CATEGORIES: BudgetCategory[] = [
  "housing",
  "food",
  "transport",
  "entertainment",
  "other",
];

export function ManualDataEntryView() {
  const { data: session } = useSession();
  const { user } = useUserProfile();
  const existing = getManualFinanceData();

  const [income, setIncome] = useState(
    String(existing?.monthlyIncome ?? user.monthlyIncome)
  );
  const [expenses, setExpenses] = useState(
    String(existing?.totalMonthlyExpenses ?? "")
  );
  const [categoryValues, setCategoryValues] = useState<
    Partial<Record<BudgetCategory, string>>
  >(() => {
    const init: Partial<Record<BudgetCategory, string>> = {};
    for (const c of CATEGORIES) {
      if (existing?.expensesByCategory?.[c]) {
        init[c] = String(existing.expensesByCategory[c]);
      }
    }
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const monthlyIncome = Number(income) || user.monthlyIncome;
    const totalMonthlyExpenses = expenses ? Number(expenses) : undefined;

    const expensesByCategory: Partial<Record<BudgetCategory, number>> = {};
    for (const c of CATEGORIES) {
      const v = categoryValues[c];
      if (v && Number(v) > 0) expensesByCategory[c] = Number(v);
    }

    const payload = {
      monthlyIncome,
      ...(Object.keys(expensesByCategory).length > 0
        ? { expensesByCategory }
        : totalMonthlyExpenses
          ? { totalMonthlyExpenses }
          : {}),
    };

    saveManualFinanceData(payload);

    if (session?.user) {
      try {
        await fetch("/api/finance-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // localStorage saved
      }
    }

    setSaved(true);
    setLoading(false);
  }

  const previewSnapshot = buildSnapshot(
    Number(income) || user.monthlyIncome,
    Object.keys(categoryValues).length
      ? CATEGORIES.filter((c) => categoryValues[c]).map((c, i) => ({
          _id: `p-${i}`,
          userId: "user",
          amount: Number(categoryValues[c]) || 0,
          category: c,
          type: "expense" as const,
          description: "",
          date: "2026-06-01",
        }))
      : expenses
        ? [
            {
              _id: "p-total",
              userId: "user",
              amount: Number(expenses),
              category: "other" as const,
              type: "expense" as const,
              description: "",
              date: "2026-06-01",
            },
          ]
        : []
  );

  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <h1 className="text-2xl font-bold">עדכון נתונים</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          הזן/י הכנסה והוצאות — ה-CFO וההחלטות יתעדכנו מיד.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <Card>
            <CardTitle>הכנסה חודשית</CardTitle>
            <input
              type="number"
              min={3000}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </Card>

          <Card>
            <CardTitle>הוצאות — סה״כ (מהיר)</CardTitle>
            <CardLabel className="mt-1">
              או פרק לפי קטגוריות למטה
            </CardLabel>
            <input
              type="number"
              min={0}
              placeholder="למשל 11200"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </Card>

          <Card>
            <CardTitle>לפי קטגוריה (אופציונלי)</CardTitle>
            <div className="mt-4 space-y-3">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{CATEGORY_LABELS[c]}</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="₪"
                    value={categoryValues[c] ?? ""}
                    onChange={(e) =>
                      setCategoryValues((prev) => ({
                        ...prev,
                        [c]: e.target.value,
                      }))
                    }
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  />
                </label>
              ))}
            </div>
          </Card>

          {(expenses || Object.values(categoryValues).some(Boolean)) && (
            <Card className="border-primary/30 bg-primary-soft/30">
              <CardLabel className="text-primary">תצוגה מקדימה</CardLabel>
              <p className="mt-2 text-sm">
                חיסכון משוער:{" "}
                <span className="font-bold">
                  {formatCurrency(previewSnapshot.savings)}
                </span>{" "}
                בחודש
              </p>
            </Card>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "שומר…" : "שמור ועדכן את ה-CFO"}
          </Button>

          {saved && (
            <p className="text-center text-sm font-medium text-primary">
              ✓ הנתונים עודכנו
            </p>
          )}
        </form>
      </main>
    </AppLayout>
  );
}
