'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Smartphone, Eye, EyeOff, User, Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatMobileNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 11) {
      return cleaned
    }
    return cleaned.slice(0, 11)
  }

  const validateEgyptianMobile = (mobile: string): boolean => {
    const egyptianRegex = /^01[0-9]{9}$/
    return egyptianRegex.test(mobile)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "رقم الموبايل مطلوب"
    } else if (!validateEgyptianMobile(formData.mobileNumber)) {
      newErrors.mobileNumber = "رقم الموبايل المصري غير صالح"
    }

    if (!formData.name) {
      newErrors.name = "الاسم مطلوب"
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة"
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "يجب الموافقة على الشروط والأحكام"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?message=تم إنشاء الحساب بنجاح')
      } else {
        setErrors({ general: data.error || 'حدث خطأ أثناء إنشاء الحساب' })
      }
    } catch (error) {
      setErrors({ general: 'حدث خطأ أثناء إنشاء الحساب' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

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
          <Link href="/login">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
              تسجيل الدخول
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              أنشئ حسابك لبدء استخدام خدماتنا المالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-right block">
                  رقم الموبايل *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", formatMobileNumber(e.target.value))}
                    className={`text-right pr-10 ${errors.mobileNumber ? "border-red-500" : ""}`}
                    maxLength={11}
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-sm text-red-500 text-right">{errors.mobileNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">
                  الاسم الكامل *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`text-right pr-10 ${errors.name ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 text-right">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">
                  البريد الإلكتروني (اختياري)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="text-right pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">
                  كلمة المرور *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`text-right pr-10 ${errors.password ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 text-right">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-right block">
                  تأكيد كلمة المرور *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="أعد إدخال كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`text-right pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 text-right">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start space-x-2 space-x-reverse">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  أوافق على{" "}
                  <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline">
                    الشروط والأحكام
                  </Link>{" "}
                  و{" "}
                  <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline">
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-red-500 text-right">{errors.agreeTerms}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>© 2024 فينتك. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}