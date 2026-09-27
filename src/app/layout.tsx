import type { Metadata } from "next";
import { Providers } from "@/providers/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Majestic | Full Restaurant Management & POS",
  description: "Next-generation Restaurant Management System, Point of Sale, Table Management, and Kitchen Display System.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
