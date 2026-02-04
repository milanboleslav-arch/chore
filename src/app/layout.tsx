import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Chore | Level Up Your Home",
  description: "The ultimate gamified task management system for families. Turn chores into tasks, earn rewards, and stay organized.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chore",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f111a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { PWAProvider } from "@/components/PWAContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[#0f111a] text-slate-100`}
      >
        <PWAProvider>
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />
          <main className="relative min-h-screen">
            {children}
          </main>
        </PWAProvider>
      </body>
    </html>
  );
}

