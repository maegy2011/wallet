import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "فينتك - تطبيقك المالي الموثوق",
  description: "تطبيق مالي متقدم يسهل إدارة أمورك المالية بكل أمان وسرعة",
  keywords: ["فينتك", "تطبيق مالي", "موبايل", "مصر", "دفعات", "محفظة إلكترونية"],
  authors: [{ name: "فينتك" }],
  openGraph: {
    title: "فينتك - تطبيقك المالي الموثوق",
    description: "تطبيق مالي متقدم يسهل إدارة أمورك المالية بكل أمان وسرعة",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "فينتك - تطبيقك المالي الموثوق",
    description: "تطبيق مالي متقدم يسهل إدارة أمورك المالية بكل أمان وسرعة",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
