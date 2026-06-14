import type { FinancialHealthTimeline } from "@/types/decisions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_DOT = {
  "on-track": "bg-primary",
  "at-risk": "bg-warning",
  "off-track": "bg-danger",
} as const;

export function HealthTimeline({ timeline }: { timeline: FinancialHealthTimeline }) {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-4 shadow-soft"
      role="region"
      aria-label="ציר זמן בריאות פיננסית"
    >
      <p className="text-sm font-semibold">מסלול פיננסי</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        היום → 6 חודשים → שנה → תאריך יעד
      </p>
      <div className="mt-4 flex items-start justify-between gap-1">
        {timeline.milestones.map((m, i) => (
          <div key={m.id} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className="h-0.5 flex-1 bg-border" aria-hidden />
              )}
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full ring-2 ring-card",
                  STATUS_DOT[m.status]
                )}
                aria-hidden
              />
              {i < timeline.milestones.length - 1 && (
                <div className="h-0.5 flex-1 bg-border" aria-hidden />
              )}
            </div>
            <p className="mt-2 text-[10px] font-semibold sm:text-xs">{m.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {m.projectedScore}/100
            </p>
            {m.id !== "today" && (
              <p className="mt-0.5 hidden text-[10px] font-medium text-primary sm:block">
                {formatCurrency(m.projectedSavings)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
