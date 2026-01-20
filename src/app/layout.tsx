import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VocabSnap - Personal Vocabulary Trainer",
  description: "Learn any language vocabulary with interactive flashcards",
  manifest: "/manifest.json",
  themeColor: "#9333ea",
  icons: {
    icon: "/favicon.png?v=1",
    apple: "/icon-192.png?v=1",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VocabSnap",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "VocabSnap",
  }
};

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ServiceWorkerRegistration />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
