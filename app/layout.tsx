import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Grit Academy — AI-Powered Exam Preparation",
  description:
    "Master JAMB, WAEC, NECO, and Post UTME with adaptive AI-generated questions, real-time analytics, and performance tracking. Built for ambitious Nigerian students.",
  keywords:
    "CBT, JAMB, WAEC, NECO, Post UTME, AI Exam Prep, Grit Academy, Nigerian Exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body
        className={`${manrope.className} min-h-full flex flex-col bg-[#FAFAFA] text-[#111827] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
