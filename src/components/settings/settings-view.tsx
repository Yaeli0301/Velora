"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardLabel, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SettingsView() {
  const { data: session } = useSession();
  const [weeklyBrief, setWeeklyBrief] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings?.notifications?.weeklyBrief !== undefined) {
          setWeeklyBrief(data.settings.notifications.weeklyBrief);
        }
      })
      .finally(() => setLoading(false));
  }, [session?.user]);

  async function saveSettings(next: boolean) {
    setWeeklyBrief(next);
    setSaving(true);
    setMessage("");
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyBrief: next }),
      });
      setMessage("ההגדרות נשמרו");
    } catch {
      setMessage("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  async function sendTestBrief() {
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/brief/send", { method: "POST" });
      const data = await res.json();
      if (data.email?.sent) {
        setMessage("הבריף נשלח למייל שלך");
      } else if (data.email?.error === "email_not_configured") {
        setMessage("שליחת מייל לא מוגדרת — הוסף RESEND_API_KEY");
      } else {
        setMessage("שליחה נכשלה");
      }
    } catch {
      setMessage("שגיאה בשליחה");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          התראות וחשבון
        </p>

        {!session?.user ? (
          <Card className="mt-6">
            <p className="text-sm text-muted-foreground">
              התחבר/י כדי לנהל הגדרות ולקבל בריף שבועי במייל.
            </p>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            <Card>
              <CardTitle>בריף שבועי מה-CFO</CardTitle>
              <CardLabel className="mt-1">
                כל יום ראשון — סיכום ההחלטה והמצב שלך
              </CardLabel>
              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm">קבל/י במייל</span>
                <input
                  type="checkbox"
                  checked={weeklyBrief}
                  disabled={loading || saving}
                  onChange={(e) => saveSettings(e.target.checked)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>
              {session.user.email && (
                <p className="mt-2 text-xs text-muted-foreground">
                  נשלח ל: {session.user.email}
                </p>
              )}
            </Card>

            <Card>
              <CardTitle>בדיקת בריף</CardTitle>
              <CardLabel className="mt-1">
                שלח/י בריף לדוגמה למייל שלך עכשיו
              </CardLabel>
              <Button
                className="mt-4"
                variant="secondary"
                disabled={sending}
                onClick={sendTestBrief}
              >
                {sending ? "שולח…" : "שלח בריף לדוגמה"}
              </Button>
            </Card>

            <Card>
              <CardTitle>חשבון</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {session.user.name ?? session.user.email}
              </p>
            </Card>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-primary">
            {message}
          </p>
        )}
      </main>
    </AppLayout>
  );
}
