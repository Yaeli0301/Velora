"use client";

import { useState, useRef, useEffect } from "react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { DEMO_USER, DEMO_TRANSACTIONS, DEMO_GOALS } from "@/lib/demo-data";
import { buildSnapshot } from "@/services/finance/financeService";
import {
  answer,
  SUGGESTED_QUESTIONS,
} from "@/services/ai/advisorService";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "היי! אני היועץ של Velora. שאל אותי כל דבר על הכסף והיעדים שלך — בשפה רגילה.",
  timestamp: "",
};

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const snapshot = buildSnapshot(DEMO_USER.monthlyIncome, DEMO_TRANSACTIONS);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: "",
    };

    const reply = answer(trimmed, { snapshot, goals: DEMO_GOALS });
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: reply.action
        ? `${reply.answer}\n\n💡 ${reply.action}`
        : reply.answer,
      timestamp: "",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
            <ChatIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold">היועץ החכם</h1>
            <p className="text-xs text-muted-foreground">
              תשובות פשוטות, מבוססות על הנתונים שלך
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-soft">
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
                  "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
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
            placeholder="שאל אותי משהו…"
            aria-label="שאלה ליועץ"
            className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
          <Button type="submit" disabled={!input.trim()}>
            שלח
          </Button>
        </form>
      </main>
    </div>
  );
}
