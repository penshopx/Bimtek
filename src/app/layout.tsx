import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { BookmarkProvider } from "@/components/BookmarkProvider";
import { ActivityProvider } from "@/components/ActivityLogger";
import { OfflineEventProvider } from "@/components/OfflineEventProvider";
import { AgenticAIProvider } from "@/components/AgenticAIProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { DatabaseSeeder } from "@/components/DatabaseSeeder";
import { SkkSelectionModal } from "@/components/SkkSelectionModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIAP SKK — Sistem Intensif Asistensi Pra-Uji Kompetensi SKK",
  description: "Platform persiapan uji kompetensi SKK konstruksi Indonesia — materi SKKNI, simulasi asesmen, AI tutor, dan panduan sertifikasi lengkap.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIAP SKK",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-900`}
      >
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <AgenticAIProvider>
                <OfflineEventProvider>
                  <BookmarkProvider>
                    <ActivityProvider>
                      <ServiceWorkerRegistration />
                      <DatabaseSeeder />
                      <SkkSelectionModal />
                      <Navbar />
                      <main>{children}</main>
                    </ActivityProvider>
                  </BookmarkProvider>
                </OfflineEventProvider>
              </AgenticAIProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
