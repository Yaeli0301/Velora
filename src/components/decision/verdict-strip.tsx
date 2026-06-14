import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_META = {
  "on-track": { tone: "success" as const, label: "בדרך הנכונה", dot: "bg-primary" },
  "at-risk": { tone: "warning" as const, label: "דורש תשומת לב", dot: "bg-warning" },
  "off-track": { tone: "danger" as const, label: "צריך פעולה", dot: "bg-danger" },
};

export function VerdictStrip({
  status,
  score,
  yearsToGoal,
}: {
  status: keyof typeof STATUS_META;
  score: number;
  yearsToGoal: number;
}) {
  const meta = STATUS_META[status];
  const yearsLabel =
    yearsToGoal > 0 && isFinite(yearsToGoal)
      ? `${yearsToGoal.toFixed(1)} ש'`
      : "—";

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
      aria-label="סטטוס פיננסי"
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} aria-hidden />
        <span className="text-sm font-semibold">{meta.label}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span>
          <span className="text-muted-foreground">ציון </span>
          <span className="font-bold">{score}</span>
        </span>
        <span className="text-border" aria-hidden>
          |
        </span>
        <span>
          <span className="text-muted-foreground">ליעד </span>
          <span className="font-bold">{yearsLabel}</span>
        </span>
      </div>
      <Badge tone={meta.tone} className="hidden sm:inline-flex">
        {meta.label}
      </Badge>
    </div>
  );
}
