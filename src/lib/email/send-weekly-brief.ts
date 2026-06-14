import { Resend } from "resend";
import type { WeeklyCFOBrief } from "@/types/decisions";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function buildBriefHtml(brief: WeeklyCFOBrief, appUrl: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;">
    <p style="color:#0d9488;font-weight:bold;margin:0;">Velora · הבריף השבועי</p>
    <h1 style="font-size:20px;margin:16px 0 8px;">${brief.headline}</h1>
    <p style="color:#334155;margin:0 0 16px;"><strong>${brief.decision.title}</strong><br>${brief.decision.rationale}</p>
    <p style="color:#64748b;font-size:14px;">ציון: ${brief.verdict.score}/100 · ליעד: ${brief.verdict.yearsToGoal.toFixed(1)} שנים</p>
    <a href="${appUrl}/home" style="display:inline-block;margin-top:20px;background:#0d9488;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">פתח/י את Velora</a>
    <p style="color:#94a3b8;font-size:11px;margin-top:24px;">Velora אינה ייעוץ השקעות. הנתונים מבוססים על מה שסיפקת.</p>
  </div>
</body>
</html>`;
}

export async function sendWeeklyBriefEmail(
  to: string,
  brief: WeeklyCFOBrief
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM;

  if (!resend || !from) {
    return { sent: false, error: "email_not_configured" };
  }

  const appUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3001");

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Velora: ${brief.headline.slice(0, 60)}`,
      html: buildBriefHtml(brief, appUrl),
    });

    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "send_failed",
    };
  }
}
