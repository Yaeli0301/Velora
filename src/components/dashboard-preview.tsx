import { TrendIcon, WalletIcon } from "@/components/icons";

const SCORE = 78;

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="12"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">ציון פיננסי</span>
      </div>
    </div>
  );
}

const BARS = [38, 52, 46, 64, 58, 72, 80];

export function DashboardPreview() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
            <WalletIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">הסקירה החודשית שלך</span>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
          בדרך הנכונה
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-muted/60 p-4">
        <ScoreRing score={SCORE} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">חיסכון החודש</p>
            <p className="text-lg font-bold text-foreground">3,240 ₪</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">צפי בעוד 5 שנים</p>
            <p className="flex items-center gap-1 text-lg font-bold text-primary">
              <TrendIcon className="h-4 w-4" />
              412,000 ₪
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">יעד: דירה</p>
          <p className="text-xs text-muted-foreground">64%</p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[64%] rounded-full bg-primary" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          עוד <span className="font-semibold text-foreground">320,000 ₪</span> ·
          כ-6.2 שנים בקצב הנוכחי
        </p>
      </div>

      <div className="mt-4 flex h-20 items-end gap-1.5 rounded-2xl bg-muted/60 px-4 pb-3 pt-2">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-primary/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
