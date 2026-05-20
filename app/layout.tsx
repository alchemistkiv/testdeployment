import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Yalla — birlikte karar ver",
  description: "Grupça kaydır, eşleş, nereye gideceğinize birlikte karar verin.",
};

export const viewport: Viewport = {
  themeColor: "#ff4d6d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={poppins.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
