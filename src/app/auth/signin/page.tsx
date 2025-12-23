"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Building, Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Captcha } from "@/components/captcha"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")
  const message = searchParams.get("message")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    tenantSlug: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isCaptchaVerified) {
      setLoginError("يرجى إكمال التحقق من الكابتشا")
      return
    }
    
    setIsLoading(true)
    setLoginError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        tenantSlug: formData.tenantSlug,
        redirect: false,
      })

      if (result?.error) {
        setLoginError("فشل تسجيل الدخول. يرجى التحقق من بياناتك.")
      } else {
        // Get session to check if user needs tenant selection
        const session = await getSession()
        if (session && !session.user.tenantId) {
          router.push("/onboarding")
        } else {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setLoginError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">س</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ساسaaS</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بعودتك</h1>
          <p className="text-gray-600">سجل دخولك للوصول إلى حسابك</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message === "account_created" && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error === "CredentialsSignin" 
                      ? "بيانات الدخول غير صحيحة" 
                      : "حدث خطأ أثناء تسجيل الدخول"}
                  </AlertDescription>
                </Alert>
              )}

              {loginError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantSlug">اسم المؤسسة (اختياري)</Label>
                <div className="relative">
                  <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="tenantSlug"
                    name="tenantSlug"
                    type="text"
                    placeholder="اسم المؤسسة"
                    value={formData.tenantSlug}
                    onChange={handleInputChange}
                    className="pr-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  اتركه فارغاً إذا كنت تريد الوصول إلى جميع مؤسساتك
                </p>
              </div>

              <Captcha 
                onVerify={(isValid) => setIsCaptchaVerified(isValid)}
                onError={(errorMsg) => setLoginError(errorMsg)}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="mt-4 text-center space-y-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
                <div className="text-sm text-gray-600">
                  ليس لديك حساب؟{" "}
                  <Link href="/auth/signup" className="text-blue-600 hover:underline">
                    سجل الآن
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="ml-1 h-4 w-4" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}