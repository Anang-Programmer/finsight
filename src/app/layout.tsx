import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finsight — Kelola Keuanganmu dengan Cerdas",
  description:
    "Platform literasi finansial berbasis AI. Catat transaksi, susun anggaran, dan dapatkan insight keuangan personal dari AI.",
  keywords: ["keuangan", "literasi finansial", "anggaran", "tabungan", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full">
        {children}
      </body>
    </html>
  );
}
