import type { Goal, Transaction } from "@/types";
import { answer } from "@/services/ai/advisorService";
import { buildSnapshot } from "@/services/finance/financeService";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import {
  CFO_TOOL_DEFINITIONS,
  executeCFOTool,
  type CFOToolContext,
} from "@/services/ai/cfoTools";

type ChatRole = "system" | "user" | "assistant" | "tool";

interface ChatMessage {
  role: ChatRole;
  content?: string;
  tool_call_id?: string;
  name?: string;
}

interface OpenAIToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface OpenAIChoice {
  message: {
    role: string;
    content?: string | null;
    tool_calls?: OpenAIToolCall[];
  };
  finish_reason: string;
}

export interface CFOChatInput {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  context: CFOToolContext;
}

export interface CFOChatResult {
  answer: string;
  action?: string;
  source: "openai" | "rules";
}

function buildSystemPrompt(ctx: CFOToolContext): string {
  const decision = buildDecisionHomePayload({
    monthlyIncome: ctx.monthlyIncome,
    transactions: ctx.transactions,
    goals: ctx.goals,
    onboardingOnly: ctx.fromOnboarding,
  });

  return `אתה Velora — ה-CFO האישי של המשתמש. עונה בעברית, בפשטות, בגובה העיניים.
כללים:
- לא ייעוץ השקעות. לא המלצות על מניות/קריפטו.
- אל תחשב מספרים בעצמך — השתמש בכלים.
- המלצה אחת עיקרית בכל תשובה.
- קצר: 2-4 משפטים + פעולה אחת אם רלוונטי.

הקשר נוכחי (JSON):
${JSON.stringify({
  decision: {
    title: decision.decision.title,
    rationale: decision.decision.rationale,
  },
  snapshot: decision.insightContext.snapshot,
  yearsToGoal: decision.yearsToGoal,
})}`;
}

async function callOpenAI(
  messages: ChatMessage[],
  apiKey: string
): Promise<OpenAIChoice> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      tools: CFO_TOOL_DEFINITIONS,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices: OpenAIChoice[] };
  return data.choices[0];
}

export async function handleCFOMessage(input: CFOChatInput): Promise<CFOChatResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [], context } = input;

  if (!apiKey) {
    return fallbackRules(message, context);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(context) },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  try {
    for (let i = 0; i < 4; i++) {
      const choice = await callOpenAI(messages, apiKey);
      const assistantMsg = choice.message;

      if (assistantMsg.tool_calls?.length) {
        messages.push({
          role: "assistant",
          content: assistantMsg.content ?? null,
          ...({ tool_calls: assistantMsg.tool_calls } as Record<string, unknown>),
        } as ChatMessage & { tool_calls: OpenAIToolCall[] });

        for (const toolCall of assistantMsg.tool_calls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            args = {};
          }

          const result = executeCFOTool(toolCall.function.name, args, context);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      if (assistantMsg.content) {
        return {
          answer: assistantMsg.content.trim(),
          source: "openai",
        };
      }
    }

    return fallbackRules(message, context);
  } catch {
    return fallbackRules(message, context);
  }
}

function fallbackRules(message: string, context: CFOToolContext): CFOChatResult {
  const snapshot = buildSnapshot(context.monthlyIncome, context.transactions);
  const reply = answer(message, { snapshot, goals: context.goals });
  return {
    answer: reply.answer,
    action: reply.action,
    source: "rules",
  };
}

export function toToolContext(
  monthlyIncome: number,
  transactions: Transaction[],
  goals: Goal[],
  fromOnboarding: boolean
): CFOToolContext {
  return { monthlyIncome, transactions, goals, fromOnboarding };
}
