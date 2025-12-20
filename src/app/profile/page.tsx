'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Mail, Calendar, CreditCard, LogOut, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalBalance: 0,
    accountCreated: new Date().toLocaleDateString('ar-EG')
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Simulate fetching user stats - in real app, this would come from API
    setStats({
      totalTransactions: 156,
      totalBalance: 25680.50,
      accountCreated: user.createdAt || new Date().toLocaleDateString('ar-EG')
    })
  }, [user, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة حسابك ومعلوماتك الشخصية</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ الإنشاء: {stats.accountCreated}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>نوع الحساب: أساسي</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push('/dashboard')}
                >
                  لوحة التحكم
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحساب</CardTitle>
                <CardDescription>نظرة عامة على نشاط حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalTransactions.toLocaleString('ar-EG')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">إجمالي المعاملات</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.totalBalance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">الرصيد الإجمالي (ج.م)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
                <CardDescription>الوصول السريع إلى الميزات الرئيسية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => router.push('/dashboard')}
                  >
                    <CreditCard className="h-6 w-6" />
                    <div className="text-right">
                      <div className="font-medium">إدارة المعاملات</div>
                      <div className="text-sm text-gray-600">عرض وإدارة جميع المعاملات</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => router.push('/dashboard')}
                  >
                    <User className="h-6 w-6" />
                    <div className="text-right">
                      <div className="font-medium">إعدادات الحساب</div>
                      <div className="text-sm text-gray-600">تخصيص إعدادات الملف الشخصي</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-900">تسجيل الخروج</h3>
                    <p className="text-sm text-red-700 mt-1">تسجيل الخروج من حسابك الحالي</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري تسجيل الخروج...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 ml-2" />
                        تسجيل الخروج
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}