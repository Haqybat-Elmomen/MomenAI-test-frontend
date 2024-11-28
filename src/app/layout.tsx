import type { Metadata } from "next";
import "./globals.css";
import Head from 'next/head'

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
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    </Head>
      <body>
        {children}
      </body>
    </html>
  );
}
