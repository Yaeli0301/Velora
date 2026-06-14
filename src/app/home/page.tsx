import type { Metadata } from "next";
import { DecisionHomeView } from "@/components/home/decision-home-view";

export const metadata: Metadata = {
  title: "הבית שלך | Velora",
};

export default function HomePage() {
  return <DecisionHomeView />;
}
