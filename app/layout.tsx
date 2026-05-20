import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notlar — Full-stack başlangıç",
  description: "Next.js + Vercel + Supabase ile ilk full-stack uygulamam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
