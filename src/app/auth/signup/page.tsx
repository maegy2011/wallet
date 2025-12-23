"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Building, Mail, Lock, User, ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { Captcha } from "@/components/captcha"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "free"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantName: "",
    tenantSlug: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value,
    })

    // Auto-generate slug from tenant name
    if (name === "tenantName") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-")
      setFormData(prev => ({ ...prev, tenantSlug: slug }))
    }
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return false
    }
    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("البريد الإلكتروني غير صحيح")
      return false
    }
    if (!isCaptchaVerified) {
      setError("يرجى إكمال التحقق من الكابتشا")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.tenantName || !formData.tenantSlug) {
      setError("يرجى إدخال اسم المؤسسة")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
      setError("")
    } else if (step === 2 && validateStep2()) {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      // First create the user account
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          tenantName: formData.tenantName,
          tenantSlug: formData.tenantSlug,
          plan,
        }),
      })

      const data = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(data.error || "حدث خطأ أثناء إنشاء الحساب")
        return
      }

      // Redirect to sign in with success message
      router.push(`/auth/signin?message=account_created`)
    } catch (error) {
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: "ضعيفة", color: "text-red-500" }
    if (password.length < 10) return { strength: 1, text: "متوسطة", color: "text-yellow-500" }
    return { strength: 2, text: "قوية", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
          <p className="text-gray-600">انضم إلينا وابدأ إدارة أعمالك بكفاءة</p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={`w-16 h-1 ${step > 1 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 1 ? "معلوماتك الشخصية" : "معلومات المؤسسة"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "أدخل معلوماتك لإنشاء حسابك الشخصي"
                : "أنشئ مؤسستك الأولى للبدء"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pr-10"
                        required
                      />
                    </div>
                  </div>

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
                    {formData.password && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              passwordStrength.strength === 0 ? "bg-red-500 w-1/3" :
                              passwordStrength.strength === 1 ? "bg-yellow-500 w-2/3" :
                              "bg-green-500 w-full"
                            }`}
                          />
                        </div>
                        <span className={`text-xs ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Captcha 
                    onVerify={(isValid) => setIsCaptchaVerified(isValid)}
                    onError={(errorMsg) => setError(errorMsg)}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">اسم المؤسسة</Label>
                    <div className="relative">
                      <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="tenantName"
                        name="tenantName"
                        type="text"
                        placeholder="اسم شركتك أو مؤسستك"
                        value={formData.tenantName}
                        onChange={handleInputChange}
                        className="pr-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenantSlug">معرف المؤسسة</Label>
                    <div className="relative">
                      <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="tenantSlug"
                        name="tenantSlug"
                        type="text"
                        placeholder="company-name"
                        value={formData.tenantSlug}
                        onChange={handleInputChange}
                        className="pr-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      سيتم استخدام هذا المعرف في رابط حسابك. استخدم فقط أحرف إنجليزية وأرقام وشرطات.
                    </p>
                  </div>

                  {plan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">الخطة المختارة</h4>
                      <p className="text-blue-800">
                        {plan === "free" ? "مجاني" : plan === "pro" ? "احترافي" : "مؤسسي"}
                      </p>
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={handleNext} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading 
                  ? "جاري إنشاء الحساب..." 
                  : step === 1 ? "التالي" : "إنشاء الحساب"
                }
              </Button>
            </div>

            <div className="mt-6">
              <Separator />
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/auth/signin" className="text-blue-600 hover:underline">
                    سجل دخولك
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