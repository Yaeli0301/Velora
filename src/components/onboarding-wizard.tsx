"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GoalType, OnboardingData } from "@/types";
import { ArrowLeftIcon, CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DEFAULT_GOAL_TARGETS,
  GOAL_ICONS,
  GOAL_LABELS,
} from "@/lib/constants";
import { saveOnboardingData } from "@/lib/onboarding-store";
import { notifyProfileUpdated } from "@/hooks/use-user-profile";

const INCOME_PRESETS = [8000, 12000, 15000, 18000, 22000, 28000];

const GOAL_OPTIONS: GoalType[] = [
  "apartment",
  "wedding",
  "car",
  "savings",
  "debt",
  "independence",
];

const TIMELINE_OPTIONS = [2, 3, 5, 7, 10];

const TOTAL_STEPS = 3;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(15000);
  const [customIncome, setCustomIncome] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("apartment");
  const [timelineYears, setTimelineYears] = useState(5);
  const [customTarget, setCustomTarget] = useState("");

  const effectiveIncome = customIncome
    ? Math.max(0, Number(customIncome) || 0)
    : income;

  const targetAmount = customTarget
    ? Math.max(0, Number(customTarget) || 0)
    : DEFAULT_GOAL_TARGETS[goalType];

  function goNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  function finish() {
    const data: OnboardingData = {
      monthlyIncome: effectiveIncome,
      goalType,
      timelineYears,
      ...(customTarget ? { targetAmount } : {}),
    };
    saveOnboardingData(data);
    notifyProfileUpdated();
    router.push("/dashboard");
  }

  const canContinue =
    step === 1
      ? effectiveIncome >= 3000
      : step === 2
        ? Boolean(goalType)
        : timelineYears >= 1;

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4 rotate-180" />
            Velora
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            שלב {step} מתוך {TOTAL_STEPS}
          </span>
        </div>
        <div className="mx-auto h-1 w-full max-w-xl px-6 pb-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-10 animate-fade-in">
        {step === 1 && (
          <StepIncome
            income={income}
            customIncome={customIncome}
            onPresetSelect={(v) => {
              setIncome(v);
              setCustomIncome("");
            }}
            onCustomChange={setCustomIncome}
          />
        )}
        {step === 2 && (
          <StepGoal goalType={goalType} onSelect={setGoalType} />
        )}
        {step === 3 && (
          <StepTimeline
            goalType={goalType}
            timelineYears={timelineYears}
            targetAmount={targetAmount}
            customTarget={customTarget}
            onTimelineSelect={setTimelineYears}
            onCustomTargetChange={setCustomTarget}
          />
        )}

        <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button variant="secondary" size="lg" onClick={goBack}>
              חזרה
            </Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button size="lg" onClick={goNext} disabled={!canContinue}>
              המשך
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={finish} disabled={!canContinue}>
              בנה לי תוכנית
              <CheckIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIncome({
  income,
  customIncome,
  onPresetSelect,
  onCustomChange,
}: {
  income: number;
  customIncome: string;
  onPresetSelect: (v: number) => void;
  onCustomChange: (v: string) => void;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">כמה אתה מרוויח בחודש?</h1>
      <p className="mt-3 text-muted-foreground">
        אחרי מס — מספר משוער מספיק. הנתונים נשארים אצלך.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INCOME_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className={cn(
              "rounded-2xl border p-4 text-base font-semibold transition",
              !customIncome && income === preset
                ? "border-primary bg-primary-soft text-primary shadow-soft"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            {formatCurrency(preset)}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-right shadow-soft">
        <label htmlFor="custom-income" className="text-sm font-medium text-muted-foreground">
          או הזן סכום אחר
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-muted-foreground">₪</span>
          <input
            id="custom-income"
            type="number"
            min={3000}
            step={500}
            placeholder="למשל 16500"
            value={customIncome}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>
    </div>
  );
}

function StepGoal({
  goalType,
  onSelect,
}: {
  goalType: GoalType;
  onSelect: (t: GoalType) => void;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">מה המטרה שלך?</h1>
      <p className="mt-3 text-muted-foreground">
        בחר יעד אחד — נראה לך בדיוק כמה חסר ובכמה זמן.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-5 transition",
              goalType === type
                ? "border-primary bg-primary-soft shadow-soft"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            <span className="text-3xl">{GOAL_ICONS[type]}</span>
            <span className="font-semibold">{GOAL_LABELS[type]}</span>
            <span className="text-xs text-muted-foreground">
              ~{formatCurrency(DEFAULT_GOAL_TARGETS[type])}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTimeline({
  goalType,
  timelineYears,
  targetAmount,
  customTarget,
  onTimelineSelect,
  onCustomTargetChange,
}: {
  goalType: GoalType;
  timelineYears: number;
  targetAmount: number;
  customTarget: string;
  onTimelineSelect: (y: number) => void;
  onCustomTargetChange: (v: string) => void;
}) {
  const monthlyNeeded = Math.ceil(
    (targetAmount * 0.92) / (timelineYears * 12)
  );

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">כמה זמן יש לך?</h1>
      <p className="mt-3 text-muted-foreground">
        ליעד {GOAL_LABELS[goalType]} — תוך כמה שנים תרצה להגיע?
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {TIMELINE_OPTIONS.map((years) => (
          <button
            key={years}
            type="button"
            onClick={() => onTimelineSelect(years)}
            className={cn(
              "rounded-full border px-6 py-3 font-semibold transition",
              timelineYears === years
                ? "border-primary bg-primary text-white shadow-soft"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            {years} שנים
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-right shadow-soft">
        <label htmlFor="custom-target" className="text-sm font-medium text-muted-foreground">
          סכום יעד מותאם (אופציונלי)
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-muted-foreground">₪</span>
          <input
            id="custom-target"
            type="number"
            min={10000}
            step={10000}
            placeholder={String(DEFAULT_GOAL_TARGETS[goalType])}
            value={customTarget}
            onChange={(e) => onCustomTargetChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5 text-right">
        <p className="text-sm font-medium text-primary">תצוגה מקדימה</p>
        <p className="mt-2 text-base leading-relaxed">
          כדי להגיע ל-{formatCurrency(targetAmount)} תוך {timelineYears} שנים,
          תצטרך לחסוך בערך{" "}
          <span className="font-bold text-foreground">
            {formatCurrency(monthlyNeeded)}
          </span>{" "}
          בחודש.
        </p>
      </div>
    </div>
  );
}
