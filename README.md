# Velora

> היועץ הפיננסי האישי שלך — מערכת קבלת החלטות פיננסיות, לא מערכת פיננסית.

המשתמש נכנס ומקבל תשובה לשאלה אחת: **"האם אני בדרך הנכונה כלכלית, ומה לעשות כדי להגיע ליעדים שלי?"**

## עקרון מוצר

במקום נתונים גולמיים, המערכת מציגה החלטות:

- ❌ "הוצאות מזון עלו ב-13%"
- ✅ "אם תמשיך בקצב הנוכחי, יחסרו לך כ-18,000 ₪ למקדמה לדירה בעוד 5 שנים"

## טכנולוגיות

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js (Google + Resend magic link + Dev credentials)
- **Email:** Resend (בריף שבועי + magic link)
- **AI:** OpenAI API (עם fallback ל-rule engine)

## מסכים עיקריים

| נתיב | תיאור |
|------|--------|
| `/onboarding` | שאלון 6 שלבים — הכנסה, יעד, זמן, החלטה ראשונה, שמירה |
| `/home` | בית החלטות — ציון, verdict, בריף שבועי, timeline |
| `/cfo` | צ'אט CFO (OpenAI + כלים פיננסיים) |
| `/plan` | תוכנית ויעדים |
| `/data` | הזנת נתונים ידנית |
| `/settings` | התראות (בריף שבועי) וחשבון |
| `/login` | Google / magic link / אורח |

## API עיקרי

- `POST /api/cfo/chat` — שיחה עם ה-CFO
- `GET|PATCH /api/settings` — העדפות משתמש
- `POST /api/brief/send` — שליחת בריף לדוגמה
- `GET /api/cron/weekly-brief` — cron (Vercel, `CRON_SECRET`)

## הרצה מקומית

```bash
cd personal-cfo
npm install
cp .env.example .env.local
npm run dev
```

פתח [http://localhost:3001](http://localhost:3001).

### משתני סביבה

ראה `.env.example` — מינימום: `AUTH_SECRET`, `NEXTAUTH_URL`.  
ל-auth מלא: `MONGODB_URI`, Google OAuth.  
למייל: `RESEND_API_KEY`, `EMAIL_FROM`.  
ל-CFO חכם: `OPENAI_API_KEY`.

### בדיקות ובנייה

```bash
npm test        # Vitest
npm run lint
npm run build
```

## Deploy (Vercel)

1. חבר MongoDB Atlas + משתני סביבה
2. `vercel.json` מפעיל cron לבריף שבועי (ראשון 07:00 IST)
3. הגדר `CRON_SECRET` ב-Vercel

## מבנה הפרויקט

```
src/
├── app/          # מסכים ו-API routes
├── components/   # UI (home, cfo, plan, settings, layout)
├── services/     # finance, forecast, decisions, ai, brief
├── lib/          # db, email, stores
└── types/
```

## PWA

`public/manifest.json` + `icon.svg` — ניתן להוסיף למסך הבית במובייל.
