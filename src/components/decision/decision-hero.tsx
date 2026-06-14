"use client";

import type { Decision } from "@/types/decisions";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ImpactScore } from "@/components/decision/impact-score";
import { ConfidenceBadge } from "@/components/decision/confidence-badge";

export function DecisionHero({
  decision,
  onAccept,
  onDismiss,
  compact,
}: {
  decision: Decision;
  onAccept?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}) {
  const accepted = decision.status === "accepted" || decision.status === "completed";

  return (
    <section
      className="rounded-3xl border border-primary/30 bg-primary-soft/40 p-6 shadow-soft"
      aria-label="ההחלטה שלך השבוע"
    >
      <Badge tone="primary">ההחלטה שלך השבוע</Badge>
      <h2
        className={
          compact
            ? "mt-3 text-xl font-bold leading-snug sm:text-2xl"
            : "mt-4 text-2xl font-bold leading-snug sm:text-3xl"
        }
      >
        {decision.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {decision.rationale}
      </p>

      <div className="mt-4">
        <ImpactScore impact={decision.impact} />
      </div>

      <div className="mt-4">
        <ConfidenceBadge confidence={decision.confidence} />
      </div>

      {!accepted && onAccept && onDismiss && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={onAccept}>
            אני מצטרף/ת
          </Button>
          <ButtonLink
            href={`/cfo?prefill=${encodeURIComponent("למה ההמלצה הזו?")}`}
            variant="secondary"
            className="flex-1"
          >
            למה?
          </ButtonLink>
          <Button variant="ghost" onClick={onDismiss}>
            לא עכשיו
          </Button>
        </div>
      )}

      {accepted && (
        <p className="mt-4 text-sm font-medium text-primary">
          ✓ קיבלת את ההמלצה — נעקוב אחרי ההתקדמות שלך
        </p>
      )}
    </section>
  );
}
