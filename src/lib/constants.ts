import type { BudgetCategory, GoalType } from "@/types";

export const GOAL_LABELS: Record<GoalType, string> = {
  apartment: "דירה",
  wedding: "חתונה",
  car: "רכב",
  savings: "חיסכון",
  debt: "יציאה ממינוס",
  independence: "עצמאות כלכלית",
};

export const GOAL_ICONS: Record<GoalType, string> = {
  apartment: "🏠",
  wedding: "💍",
  car: "🚗",
  savings: "💰",
  debt: "📉",
  independence: "🎯",
};

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  food: "מזון",
  transport: "רכב",
  fuel: "דלק",
  housing: "דיור",
  entertainment: "בילויים",
  education: "חינוך",
  health: "בריאות",
  other: "אחר",
};

export const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  food: "#10b981",
  transport: "#3b82f6",
  fuel: "#f59e0b",
  housing: "#8b5cf6",
  entertainment: "#ec4899",
  education: "#06b6d4",
  health: "#ef4444",
  other: "#6b7280",
};

export const DEFAULT_GOAL_TARGETS: Record<GoalType, number> = {
  apartment: 500000,
  wedding: 150000,
  car: 120000,
  savings: 100000,
  debt: 30000,
  independence: 2000000,
};

export const FEATURE_FLAGS = {
  aiAdvisor: true,
  openBanking: false,
  darkMode: true,
  demoMode: true,
} as const;
