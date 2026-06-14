"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getOnboardingData } from "@/lib/onboarding-store";
import { getManualFinanceData } from "@/lib/finance-data-store";
import { SUGGESTED_QUESTIONS } from "@/services/ai/advisorService";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "היי! אני ה-CFO של Velora. שאל/י אותי על ההחלטה, היעדים או ההוצאות — בשפה רגילה.",
  timestamp: "",
};

export function CFOChatView() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill") ?? "";
  const { user, goals, transactions, fromOnboarding, usesManualData } =
    useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState(prefill);
  const [thinking, setThinking] = useState(false);
  const [aiMode, setAiMode] = useState<"openai" | "rules" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentPrefill = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (prefill && !sentPrefill.current) {
      sentPrefill.current = true;
      send(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: "",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const onboarding = getOnboardingData();
    const manualFinance = getManualFinanceData();

    try {
      const res = await fetch("/api/cfo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          onboarding,
          manualFinance: manualFinance
            ? {
                monthlyIncome: manualFinance.monthlyIncome,
                totalMonthlyExpenses: manualFinance.totalMonthlyExpenses,
                expensesByCategory: manualFinance.expensesByCategory,
              }
            : null,
        }),
      });

      if (!res.ok) throw new Error("chat failed");

      const data = (await res.json()) as {
        answer: string;
        action?: string;
        source: "openai" | "rules";
      };

      setAiMode(data.source);

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.action
          ? `${data.answer}\n\n💡 ${data.action}`
          : data.answer,
        timestamp: "",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "משהו השתבש. נסה/י שוב בעוד רגע.",
        timestamp: "",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <ChatIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold">ה-CFO שלך</h1>
              <p className="text-xs text-muted-foreground">
                {aiMode === "openai"
                  ? "מופעל ב-AI · מספרים מהמנוע שלנו"
                  : usesManualData || fromOnboarding
                    ? "מבוסס על הנתונים שלך"
                    : "מצב demo · עדכן/י נתונים לדיוק"}
              </p>
            </div>
          </div>
          <ButtonLink href="/data" variant="ghost" size="sm">
            עדכן נתונים
          </ButtonLink>
        </div>

        <div className="flex-1 min-h-[320px] space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-soft">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {thinking && (
            <p className="text-center text-xs text-muted-foreground">חושב…</p>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל/י את ה-CFO…"
            aria-label="שאלה ל-CFO"
            className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
          <Button type="submit" disabled={!input.trim() || thinking}>
            שלח
          </Button>
        </form>
      </main>
    </AppLayout>
  );
}
