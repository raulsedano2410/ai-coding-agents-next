import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Coding Agents Industry Analysis",
  description: "Track and compare how AI coding assistants (Claude Code, GitHub Copilot, OpenAI Codex, Cursor AI) are being adopted across different industries using NAICS classification.",
  keywords: ["AI coding", "Claude Code", "GitHub Copilot", "Cursor AI", "OpenAI Codex", "industry analysis", "NAICS"],
  authors: [{ name: "Alexander Quispe" }],
  openGraph: {
    title: "AI Coding Agents Industry Analysis",
    description: "Track and compare AI coding assistant adoption across industries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-zinc-950`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
