import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wallets | إدارة المحافظ الإلكترونية",
  description: "تطبيق إدارة المحافظ الإلكترونية الشامل",
  keywords: ["محافظ", "محفظة إلكترونية", "إدارة معاملات", "محفظة"],
  authors: [{ name: "Mohamed Adel" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Wallets | إدارة المحافظ الإلكترونية",
    description: "تطبيق إدارة المحافظ الإلكترونية الشامل",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          <p>Mohamed adel 2025</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
