"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FolderOpen, Save, Plus } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleStatusChange = (status: string) => {
    setFormData({
      ...formData,
      status,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/projects/${data.project.id}`)
        }, 1500)
      } else {
        setError(data.error || "حدث خطأ أثناء إنشاء المشروع")
      }
    } catch (error) {
      setError("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user?.tenantId) {
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
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>تم إنشاء المشروع بنجاح!</CardTitle>
            <CardDescription>
              جاري تحويلك إلى صفحة المشروع...
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
              <Link href="/projects" className="text-gray-600 hover:text-gray-900">
                المشاريع
              </Link>
              <span className="text-gray-500">/</span>
              <span className="font-semibold">مشروع جديد</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/projects" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى المشاريع
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء مشروع جديد</h1>
          <p className="text-gray-600">
            ابدأ مشروعاً جديداً في {session.user.tenantName}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="ml-2 h-5 w-5" />
              معلومات المشروع
            </CardTitle>
            <CardDescription>
              أدخل التفاصيل الأساسية للمشروع الجديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المشروع *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="أدخل اسم المشروع"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">
                    يجب أن يكون الاسم فريداً ووصفياً
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="صف المشروع وأهدافه الرئيسية..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    وصف اختياري للمساعدة في توضيح أهداف المشروع
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
                          نشط
                        </div>
                      </SelectItem>
                      <SelectItem value="ARCHIVED">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-500 rounded-full ml-2" />
                          مؤرشف
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الإعدادات الأولية</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">ماذا بعد الإنشاء؟</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• سيتم إنشاء المشروع في مؤسستك الحالية</li>
                    <li>• يمكنك إضافة مهام وأعضاء لاحقاً</li>
                    <li>• يمكن تعديل الإعدادات في أي وقت</li>
                    <li>• ستصبح مالك المشروع تلقائياً</li>
                  </ul>
                </div>
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
                  disabled={isLoading || !formData.name.trim()}
                  className="min-w-32"
                >
                  {isLoading ? (
                    "جاري الإنشاء..."
                  ) : (
                    <>
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء المشروع
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