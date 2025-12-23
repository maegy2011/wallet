"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, Check, ArrowLeft, Save, Lock } from "lucide-react"
import Link from "next/link"

const securityQuestions = [
  "ما هو اسم حيوانك الأول؟",
  "في أي مدينة ولدت؟",
  "ما هو اسم مدرستك الابتدائية؟",
  "ما هو لونك المفضل؟",
  "ما هو اسم أفضل صديق لك؟",
  "ما هو رقم هاتفك الأول؟",
  "ما هي علامة تجارية مفضلة لك؟",
  "ما هو اسم أول مدرسة درستها؟",
  "ما هو طعامك المفضل؟",
]

export default function SecurityQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
    securityQuestion3: "",
    securityAnswer3: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Validate at least one question is set
    const hasAtLeastOneQuestion = 
      (formData.securityQuestion1 && formData.securityAnswer1) ||
      (formData.securityQuestion2 && formData.securityAnswer2) ||
      (formData.securityQuestion3 && formData.securityAnswer3)

    if (!hasAtLeastOneQuestion) {
      setMessage("يرجى تعيين سؤال أمان واحد على الأقل")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/security-questions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage("تم حفظ أسئلة الأمان بنجاح")
        setTimeout(() => {
          router.push("/settings")
        }, 2000)
      } else {
        setMessage(data.error || "حدث خطأ أثناء حفظ أسئلة الأمان")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle>تم الحفظ بنجاح!</CardTitle>
            <CardDescription>
              تم حفظ أسئلة الأمان الخاصة بك
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
              <span className="font-semibold">أسئلة الأمان</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">أسئلة الأمان</h1>
          <p className="text-gray-600">
            قم بإعداد أسئلة الأمان لحماية حسابك. يمكنك استخدامها لاستعادة كلمة المرور في المستقبل.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="ml-2 h-5 w-5" />
              إعداد أسئلة الأمان
            </CardTitle>
            <CardDescription>
              اختر 3 أسئلة أمان وإجاباتها. ستستخدم هذه للتحقق من هويتك عند نسيان كلمة المرور.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <Alert className={message.includes("نجاح") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("نجاح") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Question 1 */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">السؤال الأول</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="securityQuestion1">اختر السؤال</Label>
                    <Select 
                      value={formData.securityQuestion1} 
                      onValueChange={(value) => handleSelectChange("securityQuestion1", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سؤال الأمان" />
                      </SelectTrigger>
                      <SelectContent>
                        {securityQuestions.map((question, index) => (
                          <SelectItem key={index} value={question}>
                            {question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer1">الإجابة</Label>
                    <Input
                      id="securityAnswer1"
                      name="securityAnswer1"
                      type="text"
                      placeholder="أدخل الإجابة"
                      value={formData.securityAnswer1}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">السؤال الثاني</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="securityQuestion2">اختر السؤال</Label>
                    <Select 
                      value={formData.securityQuestion2} 
                      onValueChange={(value) => handleSelectChange("securityQuestion2", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سؤال الأمان" />
                      </SelectTrigger>
                      <SelectContent>
                        {securityQuestions.map((question, index) => (
                          <SelectItem key={index} value={question}>
                            {question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer2">الإجابة</Label>
                    <Input
                      id="securityAnswer2"
                      name="securityAnswer2"
                      type="text"
                      placeholder="أدخل الإجابة"
                      value={formData.securityAnswer2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">السؤال الثالث</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="securityQuestion3">اختر السؤال</Label>
                    <Select 
                      value={formData.securityQuestion3} 
                      onValueChange={(value) => handleSelectChange("securityQuestion3", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سؤال الأمان" />
                      </SelectTrigger>
                      <SelectContent>
                        {securityQuestions.map((question, index) => (
                          <SelectItem key={index} value={question}>
                            {question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer3">الإجابة</Label>
                    <Input
                      id="securityAnswer3"
                      name="securityAnswer3"
                      type="text"
                      placeholder="أدخل الإجابة"
                      value={formData.securityAnswer3}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">معلومات هامة:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• اختر أسئلة سهلة التذكر وإجاباتها</li>
                  <li>• لا تستخدم معلومات شخصية حساسة</li>
                  <li>• يمكنك استخدام هذه الأسئلة لاستعادة كلمة المرور</li>
                  <li>• يفضل تعيين 3 أسئلة مختلفة</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-32"
                >
                  {isLoading ? (
                    "جاري الحفظ..."
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ أسئلة الأمان
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}