import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers";
import Header from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "Mahfza | محفظة - Track Your Balances with Ease",
  description: "A simple, secure way for brokers to manually log and monitor their balances, transactions, and portfolio performance. مع محفظة، سجل أرصدتك وتابع أدائك المالي بسهولة وأمان.",
  keywords: ["Mahfza", "محفظة", "portfolio tracking", "balance tracking", "broker tools", "financial monitoring", "investment tracking", "Arabic finance", "brokerage accounts"],
  authors: [{ name: "Mahfza Team" }],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Mahfza | محفظة - Track Your Balances with Ease",
    description: "A simple, secure way for brokers to manually log and monitor their balances, transactions, and portfolio performance.",
    url: "https://mahfza.com",
    siteName: "Mahfza | محفظة",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Mahfza Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahfza | محفظة - Track Your Balances with Ease",
    description: "A simple, secure way for brokers to manually log and monitor their balances, transactions, and portfolio performance.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ErrorBoundary componentName="RootLayout">
          <LanguageProvider>
            <Providers>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster />
            </Providers>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
