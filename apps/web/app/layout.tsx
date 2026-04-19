import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Source_Serif_4 } from "next/font/google";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "TenderMind",
    template: "%s | TenderMind"
  },
  description: "Internal tender intelligence platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
