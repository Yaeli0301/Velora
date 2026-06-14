import type { DecisionStatus } from "@/types/decisions";

const STORAGE_KEY = "velora:decision-status";

export function getDecisionStatus(): DecisionStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "pending";
    const status = raw as DecisionStatus;
    if (status === "accepted" || status === "dismissed" || status === "completed") {
      return status;
    }
    return "pending";
  } catch {
    return "pending";
  }
}

export function saveDecisionStatus(status: DecisionStatus): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, status);
}

export function notifyDecisionUpdated(): void {
  window.dispatchEvent(new Event("velora:decision-updated"));
}
