import { z } from "zod";

export const onboardingSchema = z.object({
  monthlyIncome: z.number().min(3000).max(500000),
  goalType: z.enum([
    "apartment",
    "wedding",
    "car",
    "savings",
    "debt",
    "independence",
  ]),
  timelineYears: z.number().min(1).max(40),
  targetAmount: z.number().min(1000).max(50_000_000).optional(),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;
