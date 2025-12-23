"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Mail, User, ArrowLeft, ArrowRight, Send, Check } from "lucide-react"
import Link from "next/link"

export default function InviteUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [invitedUsers, setInvitedUsers] = useState<Array<{email: string, role: string}>>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
    })
  }

  const handleSendInvite = async () => {
    if (!formData.email) {
      setMessage("يرجى إدخال البريد الإلكتروني")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setInvitedUsers([...invitedUsers, { email: formData.email, role: formData.role }])
        setFormData({ email: "", role: "MEMBER" })
        setMessage("تم إرسال الدعوة بنجاح")
      } else {
        setMessage(data.error || "حدث خطأ أثناء إرسال الدعوة")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "مالك"
      case "ADMIN":
        return "مدير"
      case "MEMBER":
        return "عضو"
      default:
        return role
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "OWNER":
        return "صلاحية كاملة على المؤسسة"
      case "ADMIN":
        return "إدارة المستخدمين والمشاريع"
      case "MEMBER":
        return "وصول محدد للمشاريع"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/settings" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى الإعدادات
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">دعوة مستخدم جديد</h1>
          <p className="text-gray-600">أضف أعضاء جدد إلى مؤسستك</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="ml-2 h-5 w-5" />
              إرسال دعوة
            </CardTitle>
            <CardDescription>
              أدخل البريد الإلكتروني للمستخدم الذي تريد دعوته
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert className={message.includes("نجاح") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={message.includes("نجاح") ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">الدور</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">
                      <div className="flex items-center justify-between w-full">
                        <span>عضو</span>
                        <span className="text-xs text-gray-500 mr-2">وصول محدود</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center justify-between w-full">
                        <span>مدير</span>
                        <span className="text-xs text-gray-500 mr-2">صلاحيات عالية</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OWNER">
                      <div className="flex items-center justify-between w-full">
                        <span>مالك</span>
                        <span className="text-xs text-gray-500 mr-2">صلاحية كاملة</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.role && (
                  <p className="text-sm text-gray-600">
                    {getRoleDescription(formData.role)}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleSendInvite} 
                className="w-full" 
                disabled={isLoading || !formData.email}
              >
                {isLoading ? (
                  "جاري الإرسال..."
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    إرسال الدعوة
                  </>
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">معلومات الدعوة</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">ماذا يحدث بعد الإرسال؟</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• سيتم إرسال بريد إلكتروني يحتوي على رابط الدعوة</li>
                  <li>• الرابط صالح لمدة 7 أيام فقط</li>
                  <li>• يمكن للمستخدم قبول الدعوة أو رفضها</li>
                  <li>• سيتم إضافة المستخدم تلقائياً بعد قبول الدعوة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {invitedUsers.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="ml-2 h-5 w-5 text-green-600" />
                الدعوات المرسلة
              </CardTitle>
              <CardDescription>
                المستخدمون الذين تمت دعوتهم مؤخراً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitedUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      تم الإرسال الآن
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}