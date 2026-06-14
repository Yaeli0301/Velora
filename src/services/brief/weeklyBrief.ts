import type { WeeklyCFOBrief } from "@/types/decisions";
import type { DecisionHomePayload } from "@/types/decisions";

/**
 * Weekly CFO Brief — architecture & payload builder.
 * Delivery (email/push) deferred to V1; model defined now for schema alignment.
 */

export interface BriefDeliveryConfig {
  channel: "email" | "push";
  scheduledAt: string;
  recipientEmail?: string;
}

export interface BriefGeneratorInput {
  userId: string;
  weekOf: string;
  payload: DecisionHomePayload;
  proofDelta?: WeeklyCFOBrief["proofDelta"];
}

/** Builds a brief document ready for persistence or delivery queue */
export function buildWeeklyCFOBrief(input: BriefGeneratorInput): WeeklyCFOBrief {
  const { payload, userId, weekOf, proofDelta } = input;
  const { decision, insightContext, timeline, yearsToGoal } = payload;

  const scheduledAt = new Date(weekOf);
  scheduledAt.setHours(8, 0, 0, 0);
  if (scheduledAt.getDay() !== 0) {
    scheduledAt.setDate(scheduledAt.getDate() + ((7 - scheduledAt.getDay()) % 7));
  }

  return {
    id: `brief-${userId}-${weekOf}`,
    userId,
    weekOf,
    status: "draft",
    headline: insightContext.headline,
    decision: {
      title: decision.title,
      rationale: decision.rationale,
      impact: decision.impact,
      confidence: decision.confidence,
    },
    verdict: {
      status: insightContext.snapshot.status,
      score: insightContext.snapshot.financialScore,
      yearsToGoal,
    },
    timelineSummary: timeline.milestones.map((m) => ({
      id: m.id,
      label: m.label,
      projectedScore: m.projectedScore,
    })),
    proofDelta,
    delivery: {
      channel: "email",
      scheduledAt: scheduledAt.toISOString(),
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Delivery mechanism (V1):
 * 1. Cron (Inngest/Vercel) runs Sunday 07:00 IST
 * 2. Query users with settings.notifications.weeklyBrief = true
 * 3. buildDecisionHomePayload per user → buildWeeklyCFOBrief
 * 4. Persist to `weekly_briefs` collection
 * 5. Enqueue to delivery worker → Resend (email) / FCM (push)
 * 6. Update status: scheduled → sent | failed
 */
export const BRIEF_DELIVERY_PIPELINE = {
  cron: "0 7 * * 0",
  timezone: "Asia/Jerusalem",
  collections: {
    briefs: "weekly_briefs",
    queue: "brief_delivery_queue",
  },
  deepLink: "/home#decision",
} as const;

/** Stub — marks brief ready without sending (Phase A) */
export function scheduleBrief(brief: WeeklyCFOBrief): WeeklyCFOBrief {
  return {
    ...brief,
    status: "scheduled",
    delivery: {
      ...brief.delivery,
      scheduledAt: brief.delivery.scheduledAt,
    },
  };
}
