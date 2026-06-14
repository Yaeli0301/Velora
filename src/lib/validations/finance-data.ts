import { z } from "zod";

const categorySchema = z.enum([
  "food",
  "transport",
  "fuel",
  "housing",
  "entertainment",
  "education",
  "health",
  "other",
]);

export const manualFinanceSchema = z.object({
  monthlyIncome: z.number().min(3000).max(500000).optional(),
  totalMonthlyExpenses: z.number().min(0).max(500000).optional(),
  expensesByCategory: z.record(categorySchema, z.number().min(0)).optional(),
});

export type ManualFinancePayload = z.infer<typeof manualFinanceSchema>;
