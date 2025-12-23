"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Building, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Plus,
  Users,
  Rocket
} from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tenantName: "",
    tenantSlug: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

  const handleCreateTenant = async () => {
    if (!formData.tenantName || !formData.tenantSlug) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Refresh session and redirect
        setTimeout(() => {
          signIn("credentials", {
            email: session?.user?.email,
            password: "", // Will need to handle this properly
            tenantSlug: formData.tenantSlug,
            redirect: false,
          }).then(() => {
            router.push("/dashboard")
          })
        }, 2000)
      } else {
        setError(data.error || "حدث خطأ أثناء إنشاء المؤسسة")
      }
    } catch (error) {
      setError("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinExisting = () => {
    router.push("/auth/signin")
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
            <CardTitle>تم إنشاء المؤسسة بنجاح!</CardTitle>
            <CardDescription>
              جاري تحويلك إلى لوحة التحكم...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">س</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ساسaaS</span>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="ml-2 h-4 w-4" />
              الخروج
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            لنبدأ بإعداد مؤسستك الأولى
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="ml-2 h-5 w-5" />
              إنشاء مؤسسة جديدة
            </CardTitle>
            <CardDescription>
              قم بإعداد مؤسستك الأولى لبدء استخدام المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">ما هي المؤسسة؟</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    المؤسسة هي مساحة عمل خاصة بك وفريقك، حيث يمكنك إدارة المشاريع والمستخدمين والبيانات بشكل منفصل تماماً عن المؤسسات الأخرى
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">إنشاء جديد</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      ابدأ مؤسسة خاصة بك من الصفر
                    </p>
                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء مؤسسة
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">الانضمام لموجودة</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      إذا كنت مدعواً لمؤسسة موجودة
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleJoinExisting}
                      className="w-full"
                    >
                      <Users className="ml-2 h-4 w-4" />
                      الانضمام لمؤسسة
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">اسم المؤسسة *</Label>
                    <Input
                      id="tenantName"
                      name="tenantName"
                      type="text"
                      placeholder="أدخل اسم المؤسسة"
                      value={formData.tenantName}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500">
                      اسم المؤسسة الذي سيظهر للجميع
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenantSlug">معرف المؤسسة *</Label>
                    <Input
                      id="tenantSlug"
                      name="tenantSlug"
                      type="text"
                      placeholder="company-name"
                      value={formData.tenantSlug}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500">
                      سيتم استخدامه في الرابط الفريد لمؤسستك. استخدم فقط أحرف إنجليزية وأرقام وشرطات.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">ماذا ستحصل عليه؟</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• مساحة عمل خاصة ومؤمنة</li>
                    <li>• إدارة كاملة للمشاريع والمهام</li>
                    <li>• إدارة المستخدمين والصلاحيات</li>
                    <li>• تحليلات وإحصائيات مفصلة</li>
                    <li>• 5 مستخدمين و3 مشاريع مجاناً</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة
                  </Button>
                  <Button 
                    onClick={handleCreateTenant}
                    disabled={isLoading || !formData.tenantName.trim() || !formData.tenantSlug.trim()}
                    className="min-w-32"
                  >
                    {isLoading ? (
                      "جاري الإنشاء..."
                    ) : (
                      <>
                        <Rocket className="ml-2 h-4 w-4" />
                        إنشاء المؤسسة
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Separator className="mb-4" />
          <p className="text-sm text-gray-600">
            لديك أسئلة؟{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              تواصل مع الدعم الفني
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}