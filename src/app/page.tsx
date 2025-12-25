'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Shield, TrendingUp, ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"
import { UserProfile } from "@/components/auth/user-profile"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">فينتك</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : session ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {session.user.name || session.user.mobileNumber}
                </span>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-sm">
                  لوحتي
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-sm">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm">
                  حساب جديد
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {session ? (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                مرحباً بك، {session.user.name || session.user.mobileNumber}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                إدارة حسابك المالي بكل سهولة وأمان
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <UserProfile />
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">خدمات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>تحويل فوري</span>
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>دفع الفواتير</span>
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>شحن الرصيد</span>
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">روابط سريعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href="/transactions" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        المعاملات الأخيرة
                      </Link>
                      <Link href="/accounts" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        إدارة الحسابات
                      </Link>
                      <Link href="/profile" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        إعدادات الحساب
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              مرحباً بك في
              <span className="text-emerald-600 dark:text-emerald-400"> فينتك</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              التطبيق المالي الموثوق الذي يسهل إدارة أمورك المالية بكل أمان وسرعة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  ابدأ الآن
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  تسجيل الدخول
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Features - Show for all users */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mt-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">سهل الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                واجهة مستخدم بسيطة ومصممة خصيصاً لتجربة استخدام سلسة على الموبايل
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">آمن وموثوق</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                أحدث تقنيات الأمان لحماية بياناتك المالية وضمان خصوصيتك
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">سريع وفوري</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                تنفيذ المعاملات المالية فوراً وبأعلى سرعة ممكنة
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>© 2024 فينتك. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}