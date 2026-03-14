import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { BookmarkProvider } from "@/components/BookmarkProvider";
import { ActivityProvider } from "@/components/ActivityLogger";
import { OfflineEventProvider } from "@/components/OfflineEventProvider";
import { DatabaseSeeder } from "@/components/DatabaseSeeder";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BimtekKita - Pelatihan Konstruksi Indonesia",
  description: "Platform pelatihan dan sertifikasi bidang konstruksi Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BimtekKita",
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
          <OfflineEventProvider>
            <BookmarkProvider>
              <ActivityProvider>
              <ServiceWorkerRegistration />
              <DatabaseSeeder />
              <Navbar />
                <main>{children}</main>
              </ActivityProvider>
            </BookmarkProvider>
          </OfflineEventProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
