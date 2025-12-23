"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Check, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني")
      } else {
        setMessage(data.error || "حدث خطأ أثناء إرسال رابط إعادة التعيين")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>تم الإرسال بنجاح!</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">الخطوات التالية:</h4>
              <ol className="text-sm text-blue-800 space-y-1 text-right">
                <li>1. تحقق من بريدك الإلكتروني</li>
                <li>2. اضغط على رابط إعادة التعيين</li>
                <li>3. قم بتعيين كلمة مرور جديدة</li>
                <li>4. سجل دخولك باستخدام كلمة المرور الجديدة</li>
              </ol>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  العودة لتسجيل الدخول
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">س</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ساسaaS</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-gray-600">لا تقلق، سنساعدك في استعادتها</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription className="text-center">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert className={message.includes("نجاح") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("نجاح") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !email}>
                {isLoading ? (
                  "جاري الإرسال..."
                ) : (
                  <>
                    <Mail className="ml-2 h-4 w-4" />
                    إرسال رابط إعادة التعيين
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div className="text-sm text-gray-600">
                تتذكر كلمة المرور؟{" "}
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  سجل دخولك
                </Link>
              </div>
              
              <Separator />
              
              <div className="text-sm text-gray-500">
                <p>تحتاج مساعدة؟</p>
                <Link href="/contact" className="text-blue-600 hover:underline">
                  تواصل مع الدعم الفني
                </Link>
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