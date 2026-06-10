export type GoalType = "apartment" | "wedding" | "car" | "savings" | "debt" | "independence";
export type TransactionType = "income" | "expense";
export type BudgetCategory =
  | "food"
  | "transport"
  | "fuel"
  | "housing"
  | "entertainment"
  | "education"
  | "health"
  | "other";

export interface User {
  _id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  financialScore: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  category: BudgetCategory;
  type: TransactionType;
  description: string;
  date: string;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
}

export interface Budget {
  _id: string;
  userId: string;
  category: BudgetCategory;
  limit: number;
  spent: number;
  month: string;
}

export interface ForecastPoint {
  year: number;
  savings: number;
  income: number;
  expenses: number;
  netWorth: number;
}

export interface FinancialInsight {
  id: string;
  type: "warning" | "success" | "info" | "action";
  title: string;
  message: string;
  priority: number;
}

export interface DashboardSummary {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  financialScore: number;
  status: "on-track" | "at-risk" | "off-track";
  headline: string;
  forecasts: ForecastPoint[];
  insights: FinancialInsight[];
}

export interface OnboardingData {
  monthlyIncome: number;
  goalType: GoalType;
  timelineYears: number;
  targetAmount?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
