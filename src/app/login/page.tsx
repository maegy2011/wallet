'use client'

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Smartphone } from "lucide-react"
import { NextAuthLoginForm } from "@/components/auth/nextauth-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">فينتك</span>
        </Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Link href="/register">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
              حساب جديد
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <NextAuthLoginForm />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>© 2024 فينتك. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}