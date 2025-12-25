'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم تسجيل الدخول بنجاح')
        
        // Store user info in localStorage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          if (data.tenant) {
            localStorage.setItem('tenant', JSON.stringify(data.tenant))
          }
          if (data.company) {
            localStorage.setItem('company', JSON.stringify(data.company))
          }
          if (data.branch) {
            localStorage.setItem('branch', JSON.stringify(data.branch))
          }
        }

        // Redirect to dashboard or home
        const redirectUrl = new URL('/dashboard', window.location.href)
        router.push(redirectUrl.toString())
      } else {
        setError(data.error || 'فشل في تسجيل الدخول')
        
        if (data.loginAttempts) {
          setLoginAttempts(data.loginAttempts)
          if (data.loginAttempts >= 3) {
            toast.warning(\`تنبيه: \${data.lockedUntil ? 'الحساب مقفل مؤقتاً' : 'بقي ' + (5 - data.loginAttempts) + ' محاولات قبل قفل الحساب'}\`)
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ في الاتصال بالسيرفر')
      toast.error('حدث خطأ في الاتصال بالسيرفر')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">مرحباً بعودتك 👋</h1>
          <p className="text-slate-400">سجل الدخول للوصول إلى حسابك</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              {error}
              {loginAttempts >= 3 && (
                <span className="block mt-1 text-amber-400">
                  ⚠️ بقي {5 - loginAttempts} محاولات قبل قفل الحساب
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-white text-2xl font-bold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-slate-400">
              أدخل بيانات الدخول الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white pr-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300 font-medium">
                    كلمة المرور
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        إخفاء
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        إظهار
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white pr-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900/50 text-blue-400 focus:ring-blue-500/20 focus:ring-2"
                />
                <Label
                  htmlFor="remember"
                  className="text-slate-300 font-medium cursor-pointer"
                >
                  تذكرني على هذا الجهاز
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    تسجيل الدخول
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-slate-400 hover:text-blue-400 transition-colors font-medium"
            >
              ليس لديك حساب؟ سجل الآن
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-slate-500 hover:text-slate-400 transition-colors text-sm"
            >
              ← العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
