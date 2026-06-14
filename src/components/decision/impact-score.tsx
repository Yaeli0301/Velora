import type { RecommendationImpact } from "@/types/decisions";
import { formatCurrency } from "@/lib/utils";

export function ImpactScore({ impact }: { impact: RecommendationImpact }) {
  if (impact.financialImpact <= 0 && impact.timeSavedMonths <= 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-background/60 p-3">
      <ImpactMetric
        label="השפעה כספית"
        value={`+${formatCurrency(impact.financialImpact)}/חודש`}
      />
      <ImpactMetric
        label="זמן שנחסך"
        value={
          impact.timeSavedMonths > 0
            ? `${impact.timeSavedMonths} חודשים`
            : "—"
        }
      />
      <ImpactMetric
        label="האצת יעד"
        value={
          impact.goalAccelerationPercent > 0
            ? `${impact.goalAccelerationPercent}%`
            : "—"
        }
      />
    </div>
  );
}

function ImpactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold sm:text-sm">{value}</p>
    </div>
  );
}
