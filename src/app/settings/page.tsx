import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "הגדרות | Velora",
};

export default function SettingsPage() {
  return <SettingsView />;
}
