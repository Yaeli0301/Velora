export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("he-IL").format(amount);
}

export function calcMonthsToGoal(
  target: number,
  current: number,
  monthly: number
): number {
  if (monthly <= 0) return Infinity;
  const gap = target - current;
  if (gap <= 0) return 0;
  return Math.ceil(gap / monthly);
}
