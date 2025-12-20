import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import MobileMenuToggle from "@/components/mobile-menu-toggle";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Left Side Navigation */}
          <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl z-50 fixed lg:relative lg:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out lg:hidden" id="mobile-sidebar">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0c-3.31 0-6.47 1.34-9 3.54l-4.17 4.17a1 1 0 00-.71.29l-4.17-4.17a1 1 0 00-1.42 0l-4.16 4.16c-2.53 0-5.23-1.54-7.46-3.54A9 9 0 013 12c2.23 0 4.29.77 6.23 1.54l4.16-4.16a1 1 0 001.42 0l4.17 4.17c2.53 0 5.23 1.54 7.46 3.54A9 9 0 011 12z"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">محافظي</span>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="flex-1 p-4 space-y-2">
                <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l2-2M3 12l6-6m-6 6l6-6" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الرئيسية</span>
                </a>
                
                <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0c-3.31 0-6.47 1.34-9 3.54l-4.17 4.17a1 1 0 00-.71.29l-4.17-4.17a1 1 0 00-1.42 0l-4.16 4.16c-2.53 0-5.23-1.54-7.46-3.54A9 9 0 013 12c2.23 0 4.29.77 6.23 1.54l4.16-4.16a1 1 0 001.42 0l4.17 4.17c2.53 0 5.23 1.54 7.46 3.54A9 9 0 011 12z"/>
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">المحافظ</span>
                </a>
                
                <a href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6m-6 6h6m-6 6h6" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">المصروفات</span>
                </a>
                
                <a href="/cash-treasury" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2zm-2 0h12v4h-2V9z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الخزينة</span>
                </a>
                
                <a href="/summary" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2v2a2 2 0 002 2h4a2 2 0 002 2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v6z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">التقارير</span>
                </a>
                
                <a href="/branches" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 0h4m2 0h2" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الفروع</span>
                </a>
                
                <a href="/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2H3v2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-2-2h-1l-5-5v5a2 2 0 002 2h8a2 2 0 002 2v-5l-5-5v5a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">المستخدمون</span>
                </a>
                
                <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00-.573-.619L5.96 14.78l1.286 1.286a1 1 0 001.724 1.724h8.017a1 1 0 001.724-1.724l1.286-1.286a1.724 1.724 0 00-.573-.619l5.008-5.007c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00.573.619l5.008-5.007c-.426-1.756-2.924-1.756-3.35 0z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الإعدادات</span>
                </a>
              </nav>
            </div>
          </div>
          
          {/* Desktop Sidebar - Always Visible */}
          <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl z-50 hidden lg:block lg:fixed lg:top-0 lg:right-0 lg:h-full">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0c-3.31 0-6.47 1.34-9 3.54l-4.17 4.17a1 1 0 00-.71.29l-4.17-4.17a1 1 0 00-1.42 0l-4.16 4.16c-2.53 0-5.23-1.54-7.46-3.54A9 9 0 013 12c2.23 0 4.29.77 6.23 1.54l4.16-4.16a1 1 0 001.42 0l4.17 4.17c2.53 0 5.23 1.54 7.46 3.54A9 9 0 011 12z"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">محافظي</span>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="flex-1 p-4 space-y-2">
                <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l2-2M3 12l6-6m-6 6l6-6" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الرئيسية</span>
                </a>
                
                <a href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6m-6 6h6m-6 6h6" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">المصروفات</span>
                </a>
                
                <a href="/cash-treasury" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2zm-2 0h12v4h-2V9z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الخزينة</span>
                </a>
                
                <a href="/summary" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2v2a2 2 0 002 2h4a2 2 0 002 2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v6z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">التقارير</span>
                </a>
                
                <a href="/branches" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 0h4m2 0h2" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الفروع</span>
                </a>
                
                <a href="/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2H3v2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-2-2h-1l-5-5v5a2 2 0 002 2h8a2 2 0 002 2v-5l-5-5v5a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">المستخدمون</span>
                </a>
                
                <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 group">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00-.573-.619L5.96 14.78l1.286 1.286a1 1 0 001.724 1.724h8.017a1 1 0 001.724-1.724l1.286-1.286a1.724 1.724 0 00-.573-.619l5.008-5.007c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00.573.619l5.008-5.007c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00.573.619l5.008-5.007c-.426-1.756-2.924-1.756-3.35 0z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-white font-medium">الإعدادات</span>
                </a>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Menu Toggle Button */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {/* Menu Toggle Button - Moved to Left Side */}
                  <MobileMenuToggle />
                  
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-semibold text-gray-800">نظام إدارة المحافظ الإلكترونية</h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:block text-sm text-gray-600">
                    {new Date().toLocaleDateString('ar-EG', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <footer className="border-t bg-white/80 backdrop-blur-sm py-3 text-center text-sm text-muted-foreground">
              <p>© 2025 Mohamed Adel - نظام إدارة المحافظ الإلكترونية</p>
            </footer>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}