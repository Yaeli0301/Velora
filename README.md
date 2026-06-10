# Velora

> היועץ הפיננסי האישי שלך — מערכת קבלת החלטות פיננסיות, לא מערכת פיננסית.

המשתמש נכנס ומקבל תשובה לשאלה אחת: **"האם אני בדרך הנכונה כלכלית, ומה לעשות כדי להגיע ליעדים שלי?"** — בלי צורך להבין פיננסים, השקעות או טכנולוגיה.

## עקרון מוצר

במקום נתונים גולמיים, המערכת מציגה החלטות:

- ❌ "הוצאות מזון עלו ב-13%"
- ✅ "אם תמשיך בקצב הנוכחי, יחסרו לך כ-18,000 ₪ למקדמה לדירה בעוד 5 שנים"

## קהל יעד

אנשים רגילים שרוצים לקנות דירה, להתחתן, לחסוך לילדים, לצאת מהמינוס או להגיע לעצמאות כלכלית.

## טכנולוגיות

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Hook Form, Zod
- **Backend:** Node.js, Next.js API Routes
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js (Google + Email)
- **Charts:** Recharts
- **AI:** OpenAI API

## מודולים

1. **Onboarding** — שאלון ידידותי בן 3 שלבים (הכנסה → מטרה → זמן)
2. **Dashboard** — מצב כללי, ציון פיננסי (0–100) ותחזית ל-1/3/5 שנים
3. **Goal Planner** — פערים, קצב חיסכון וזמן משוער ליעד
4. **AI Advisor** — צ'אט שמחזיר תשובות פשוטות ופעולות
5. **Smart Budget** — קטלוג הוצאות אוטומטי
6. **Forecast Engine** — מגמות ותחזיות (מוסתר מהמשתמש, מוצג בפשטות)

## הרצה מקומית

```bash
npm install
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000) בדפדפן.

### בדיקות ובנייה

```bash
npm run lint      # ESLint
npm run build     # Production build
```

## משתני סביבה

צור קובץ `.env.local`:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
```

## מבנה הפרויקט

```
src/
├── app/          # מסכים ו-API routes
├── components/   # רכיבי UI לשימוש חוזר
├── features/     # לוגיקה לפי מודול (dashboard, goals, budgeting...)
├── services/     # ai / forecast / finance
├── lib/          # utils, constants
└── types/        # טיפוסים משותפים
```
