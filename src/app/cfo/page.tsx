import type { Metadata } from "next";
import { Suspense } from "react";
import { CFOChatView } from "@/components/cfo/cfo-chat-view";

export const metadata: Metadata = {
  title: "ה-CFO שלך | Velora",
};

export default function CFOPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center">טוען…</div>}>
      <CFOChatView />
    </Suspense>
  );
}
