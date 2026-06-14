import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-geist-sans",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Velora | היועץ הפיננסי האישי שלך",
  description:
    "הבינו את העתיד הכלכלי שלכם, הגיעו ליעדי חיסכון וקבלו המלצות פיננסיות חכמות — בפשטות.",
  keywords: ["פיננסים", "חיסכון", "תכנון פיננסי", "יעדים", "Velora"],
  openGraph: {
    title: "Velora",
    description: "מערכת קבלת החלטות פיננסיות — לא מערכת פיננסית",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
