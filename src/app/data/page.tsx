import type { Metadata } from "next";
import { ManualDataEntryView } from "@/components/data/manual-data-entry-view";

export const metadata: Metadata = {
  title: "עדכון נתונים | Velora",
};

export default function DataPage() {
  return <ManualDataEntryView />;
}
