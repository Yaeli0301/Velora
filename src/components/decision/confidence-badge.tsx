import type { DataConfidence } from "@/types/decisions";
import { Badge } from "@/components/ui/badge";

const LEVEL_TONE = {
  high: "success",
  medium: "warning",
  low: "neutral",
} as const;

export function ConfidenceBadge({ confidence }: { confidence: DataConfidence }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={LEVEL_TONE[confidence.level]}>
        דיוק {confidence.score}%
      </Badge>
      <span className="text-xs text-muted-foreground">{confidence.message}</span>
    </div>
  );
}
