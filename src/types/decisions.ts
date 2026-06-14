import type { Goal, FinancialInsight } from "@/types";

export type DecisionStatus = "pending" | "accepted" | "dismissed" | "completed";
export type ConfidenceLevel = "high" | "medium" | "low";
export type TimelineMilestoneId = "today" | "6m" | "1y" | "goal";

export interface RecommendationImpact {
  /** Monthly ₪ change if user follows the recommendation */
  financialImpact: number;
  /** Months saved toward primary goal */
  timeSavedMonths: number;
  /** Percentage acceleration toward goal (0–100) */
  goalAccelerationPercent: number;
}

export interface DataConfidence {
  level: ConfidenceLevel;
  /** 0–100 completeness score */
  score: number;
  missingFactors: string[];
  message: string;
}

export interface TimelineMilestone {
  id: TimelineMilestoneId;
  label: string;
  dateIso: string;
  projectedSavings: number;
  projectedScore: number;
  status: "on-track" | "at-risk" | "off-track";
  goalProgressPercent: number;
}

export interface FinancialHealthTimeline {
  milestones: TimelineMilestone[];
  goalDateIso: string;
}

export interface Decision {
  id: string;
  title: string;
  rationale: string;
  impact: RecommendationImpact;
  confidence: DataConfidence;
  status: DecisionStatus;
  validUntil: string;
  planType?: Goal["type"];
}

export interface InsightContext {
  snapshot: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    financialScore: number;
    status: "on-track" | "at-risk" | "off-track";
  };
  insights: FinancialInsight[];
  confidence: DataConfidence;
  headline: string;
}

export interface DecisionHomePayload {
  decision: Decision;
  timeline: FinancialHealthTimeline;
  insightContext: InsightContext;
  topInsight: FinancialInsight | null;
  yearsToGoal: number;
}

export type BriefDeliveryChannel = "email" | "push";
export type BriefStatus = "draft" | "scheduled" | "sent" | "failed";

/** Weekly CFO Brief — data model (delivery deferred to V1) */
export interface WeeklyCFOBrief {
  id: string;
  userId: string;
  weekOf: string;
  status: BriefStatus;
  headline: string;
  decision: Pick<Decision, "title" | "rationale" | "impact" | "confidence">;
  verdict: {
    status: InsightContext["snapshot"]["status"];
    score: number;
    yearsToGoal: number;
  };
  timelineSummary: Pick<TimelineMilestone, "id" | "label" | "projectedScore">[];
  proofDelta?: {
    savingsChange: number;
    scoreChange: number;
  };
  delivery: {
    channel: BriefDeliveryChannel;
    scheduledAt: string;
    sentAt?: string;
  };
  createdAt: string;
}
