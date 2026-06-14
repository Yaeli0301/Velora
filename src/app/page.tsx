import Link from "next/link";
import { DashboardPreview } from "@/components/dashboard-preview";
import {
  ArrowLeftIcon,
  ChatIcon,
  CheckIcon,
  GaugeIcon,
  ShieldIcon,
  TargetIcon,
  TrendIcon,
} from "@/components/icons";

const FEATURES = [
  {
    icon: TargetIcon,
    title: "יעדים שמתגשמים",
    desc: "דירה, חתונה, רכב או עצמאות כלכלית — נראה לך בדיוק כמה חסר ובכמה זמן תגיע לשם.",
  },
  {
    icon: GaugeIcon,
    title: "ציון פיננסי",
    desc: "מספר אחד בין 0 ל-100 שמראה אם אתה בדרך הנכונה — בלי גרפים מסובכים.",
  },
  {
    icon: TrendIcon,
    title: "תחזית לעתיד",
    desc: "איך ייראה המצב שלך בעוד שנה, 3 ו-5 שנים — אם תמשיך בקצב הנוכחי.",
  },
  {
    icon: ChatIcon,
    title: "יועץ חכם",
    desc: "שאל בשפה פשוטה וקבל תשובה ברורה: כמה לחסוך כל חודש כדי לעמוד ביעד.",
  },
];

const STEPS = [
  { num: "1", title: "כמה אתה מרוויח?", desc: "שאלה אחת קצרה — בלי טפסים ארוכים." },
  { num: "2", title: "מה המטרה שלך?", desc: "דירה, חתונה, רכב או חיסכון." },
  { num: "3", title: "כמה זמן יש לך?", desc: "ונבנה לך תוכנית אישית מיד." },
];

const STATS = [
  { value: "0–100", label: "ציון פיננסי ברור" },
  { value: "5 שנים", label: "תחזית קדימה" },
  { value: "< דקה", label: "להתחלה" },
];

const TRUST = [
  "אבטחה ברמת בנק",
  "הנתונים שלך נשארים פרטיים",
  "בלי עמלות נסתרות",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
              V
            </span>
            <span className="text-xl font-bold tracking-tight">Velora</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground sm:flex">
            <Link href="#how" className="transition hover:text-foreground">
              איך זה עובד
            </Link>
            <Link href="#features" className="transition hover:text-foreground">
              יכולות
            </Link>
          </nav>
          <Link
            href="/onboarding"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            התחל עכשיו
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="animate-fade-in text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
            <span className="h-2 w-2 rounded-full bg-primary" />
            היועץ הפיננסי האישי שלך
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            האם אתה בדרך הנכונה{" "}
            <span className="text-primary">מבחינה כלכלית?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
            בלי להבין פיננסים, בלי גרפים מסובכים. Velora נותנת לך תשובה ברורה אחת
            — ומראה לך מה לעשות כדי להגיע ליעדים שלך.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-card transition hover:opacity-90"
            >
              בוא נבדוק את המצב שלך
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <Link
              href="#how"
              className="rounded-full border border-border bg-card px-8 py-4 text-base font-semibold transition hover:bg-muted"
            >
              איך זה עובד?
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <ShieldIcon className="h-4 w-4 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex animate-fade-in-delay justify-center lg:justify-end">
          <DashboardPreview />
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-3 gap-6 px-6 py-10 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">איך זה עובד?</h2>
            <p className="mt-3 text-muted-foreground">
              שלושה שלבים קצרים — ויש לך תוכנית.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">
                  {step.num}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">מה תקבל</h2>
            <p className="mt-3 text-muted-foreground">
              כלים שמדברים בשפה שלך, לא בשפה של רואי חשבון.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-3xl bg-accent px-8 py-16 text-center text-white shadow-card">
          <h2 className="text-3xl font-bold sm:text-4xl">
            מוכן לגלות לאן הכסף שלך הולך?
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            תוך פחות מדקה תדע אם אתה בדרך הנכונה — ומה הצעד הבא שלך.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-accent transition hover:bg-white/90"
          >
            התחל עכשיו — בחינם
            <CheckIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              V
            </span>
            <span className="font-semibold text-foreground">Velora</span>
          </div>
          <p>נבנה למשתמשים אמיתיים, לא לרואי חשבון.</p>
        </div>
      </footer>
    </div>
  );
}
