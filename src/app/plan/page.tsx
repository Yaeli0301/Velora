import type { Metadata } from "next";
import { PlanView } from "@/components/plan/plan-view";

export const metadata: Metadata = {
  title: "התוכנית שלך | Velora",
};

export default function PlanPage() {
  return <PlanView />;
}
