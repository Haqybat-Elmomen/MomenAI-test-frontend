import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مؤمن AI",
  description: "مؤمن AI, المساعد الذكي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
