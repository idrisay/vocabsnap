import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VocabSnap - German Vocabulary Trainer",
  description: "Learn German vocabulary with interactive flashcards",
  manifest: "/manifest.json",
  themeColor: "#9333ea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VocabSnap",
  },
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
