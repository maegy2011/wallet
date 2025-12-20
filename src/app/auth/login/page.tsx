'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Wallet, Home } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to summary page
    if (isAuthenticated) {
      router.push('/summary')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Create user object for auth context
        const userObject = {
          id: data.user.id || '1',
          name: data.user.name || formData.identifier,
          email: data.user.email || formData.identifier,
          businessName: data.user.businessName || '',
          createdAt: new Date().toLocaleDateString('ar-EG')
        }
        
        // Use auth context login
        login(userObject)
        
        // Also store additional data if needed
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userRoles', JSON.stringify(data.roles || []))
        localStorage.setItem('businessAccounts', JSON.stringify(data.businessAccounts || []))
        localStorage.setItem('branches', JSON.stringify(data.branches || []))
        
        setSuccess('تم تسجيل الدخول بنجاح')
        
        // Redirect to summary page after successful login
        setTimeout(() => {
          router.push('/summary')
        }, 1000)
      } else {
        setError(data.error || 'فشل تسجيل الدخول')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Wallet className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أو{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              إنشاء حساب جديد
            </Link>
          </p>
          <div className="mt-4 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>مرحباً بعودتك</CardTitle>
            <CardDescription>
              قم بتسجيل الدخول باستخدام اسم المستخدم أو رقم الهاتف أو الرقم القومي أو البريد الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">اسم المستخدم / رقم الهاتف / الرقم القومي / البريد الإلكتروني</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="أدخل أحد البيانات المذكورة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة المرور"
                    className="text-right pr-10"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Link
                href="/auth/reset-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}