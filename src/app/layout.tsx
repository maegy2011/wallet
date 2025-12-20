import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "محفظة ذكية | نظام إدارة المحافظ الإلكترونية",
  description: "نظام متكامل لإدارة المحافظ الإلكترونية والمعاملات المالية للشركات والمؤسسات التجارية",
  keywords: ["محافظ", "محفظة إلكترونية", "إدارة معاملات", "محفظة", "نظام مالي"],
  authors: [{ name: "Smart Wallet Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "محفظة ذكية | نظام إدارة المحافظ الإلكترونية",
    description: "نظام متكامل لإدارة المحافظ الإلكترونية والمعاملات المالية للشركات والمؤسسات التجارية",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}