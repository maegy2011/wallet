"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  ArrowLeft, 
  Smartphone, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Copy,
  QrCode
} from "lucide-react"
import Link from "next/link"

export default function TwoFactorPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const [twoFactorData, setTwoFactorData] = useState({
    enabled: false,
    secret: "",
    backupCodes: [],
  })

  const [setupStep, setSetupStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchTwoFactorSettings()
    }
  }, [session])

  const fetchTwoFactorSettings = async () => {
    try {
      const response = await fetch("/api/auth/two-factor")
      const data = await response.json()
      setTwoFactorData(data.twoFactor || { enabled: false, secret: "", backupCodes: [] })
    } catch (error) {
      console.error("Failed to fetch 2FA settings:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTwoFactorData({
      ...twoFactorData,
      [name]: value,
    })
  }

  const handleEnable2FA = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/two-factor/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setTwoFactorData({
          ...twoFactorData,
          enabled: true,
          secret: data.secret,
          backupCodes: data.backupCodes,
        })
        setSetupStep(2)
        setMessage("تم تفعيل المصادقة الثنائية بنجاح")
      } else {
        setMessage(data.error || "حدث خطأ أثناء تفعيل المصادقة الثنائية")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setTwoFactorData({
          ...twoFactorData,
          enabled: false,
          secret: "",
          backupCodes: [],
        })
        setMessage("تم تعطيل المصادقة الثنائية بنجاح")
      } else {
        setMessage(data.error || "حدث خطأ أثناء تعطيل المصادقة الثنائية")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage("تم التحقق من الكود بنجاح")
        setTimeout(() => {
          router.push("/settings")
        }, 2000)
      } else {
        setMessage(data.error || "كود التحقق غير صحيح")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>
              يجب تسجيل الدخول أولاً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/signin">تسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>تم بنجاح!</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">س</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ساسaaS</span>
            </Link>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-500">/</span>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                الإعدادات
              </Link>
              <span className="text-gray-500">/</span>
              <span className="font-semibold">المصادقة الثنائية</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/settings" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى الإعدادات
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المصادقة الثنائية (2FA)</h1>
          <p className="text-gray-600">
            إضافة طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة
          </p>
        </div>

        {message && (
          <Alert className={message.includes("نجاح") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("نجاح") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Setup 2FA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="ml-2 h-5 w-5" />
                إعداد المصادقة الثنائية
              </CardTitle>
              <CardDescription>
                {twoFactorData.enabled 
                  ? "المصادقة الثنائية مفعلة حالياً"
                  : "تفعيل المصادقة الثنائية لحماية حسابك"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!twoFactorData.enabled ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">لماذا المصادقة الثنائية؟</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• حماية إضافية لحسابك</li>
                      <li>• تتطلب كوداً من تطبيق المصادقة عند تسجيل الدخول</li>
                      <li>• مفيدة للمعاملات الحساسة</li>
                      <li>• تقلل من خطر الاختراق</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleEnable2FA}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      "جاري التفعيل..."
                    ) : (
                      <>
                        <Shield className="ml-2 h-4 w-4" />
                        تفعيل المصادقة الثنائية
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">المصادقة الثنائية مفعلة</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-800">الحالة:</span>
                        <span className="text-green-600 font-medium">مفعلة</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-800">التطبيق:</span>
                        <span className="text-green-600 font-medium">Google Authenticator</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">كود الطوارئ:</h4>
                    <div className="space-y-2">
                      {twoFactorData.backupCodes.map((code, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="font-mono text-sm">{code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    {isLoading ? (
                      "جاري التعطيل..."
                    ) : (
                      <>
                        <AlertTriangle className="ml-2 h-4 w-4" />
                        تعطيل المصادقة الثنائية
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification */}
          {twoFactorData.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="ml-2 h-5 w-5" />
                  التحقق من الكود
                </CardTitle>
                <CardDescription>
                  أدخل الكود المكون من تطبيق المصادقة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">كود التحقق</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-2xl font-mono tracking-widest"
                    />
                  </div>

                  <Button 
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    {isLoading ? (
                      "جاري التحقق..."
                    ) : (
                      <>
                        <Check className="ml-2 h-4 w-4" />
                        تحقق من الكود
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">كيفية الاستخدام:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 text-right">
                    <li>1. افتح تطبيق المصادقة (Google Authenticator)</li>
                    <li>2. انسخ الكود المعروض</li>
                    <li>3. أدخل الكود في الحقل أعلاه</li>
                    <li>4. اضغط على "تحقق من الكود" (أو امسح كود QR)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى الإعدادات
          </Link>
        </div>
      </main>
    </div>
  )
}