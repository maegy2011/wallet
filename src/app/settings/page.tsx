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
  User, 
  Mail, 
  Shield, 
  ArrowLeft, 
  Save, 
  Camera,
  Edit,
  Lock,
  Check,
  Building,
  Users,
  Settings,
  Smartphone
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [hasSecurityQuestions, setHasSecurityQuestions] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.avatar || "",
      })
    }

    // Check if user has security questions
    fetchSecurityQuestions()
  }, [session])

  const fetchSecurityQuestions = async () => {
    try {
      const response = await fetch("/api/auth/security-questions")
      const data = await response.json()
      setHasSecurityQuestions(data.hasSecurityQuestions)
    } catch (error) {
      console.error("Failed to fetch security questions:", error)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field as keyof typeof showPasswords],
    })
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: "ضعيفة", color: "text-red-500" }
    if (password.length < 10) return { strength: 1, text: "متوسطة", color: "text-yellow-500" }
    return { strength: 2, text: "قوية", color: "text-green-500" }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage("تم تحديث الملف الشخصي بنجاح")
        setTimeout(() => {
          router.push("/settings")
        }, 2000)
      } else {
        setMessage(data.error || "حدث خطأ أثناء تحديث الملف الشخصي")
      }
    } catch (error) {
      setMessage("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setIsLoading(true)
    setMessage("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("كلمات المرور الجديدة غير متطابقة")
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage("تم تغيير كلمة المرور بنجاح")
        setTimeout(() => {
          router.push("/settings")
        }, 2000)
      } else {
        setMessage(data.error || "حدث خطأ أثناء تغيير كلمة المرور")
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
            <CardTitle>تم التحديث بنجاح!</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

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
              <span className="font-semibold">الإعدادات</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
          <p className="text-gray-600">
            إدارة إعدادات حسابك ومؤسستك
          </p>
        </div>

        {message && (
          <Alert className={message.includes("نجاح") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("نجاح") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="two-factor">المصادقة الثنائية</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="ml-2 h-5 w-5" />
                  إعدادات المؤسسة
                </CardTitle>
                <CardDescription>
                  تحديث معلومات مؤسستك الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم المؤسسة</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="أدخل اسم المؤسسة"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="min-w-32"
                    >
                      {isLoading ? (
                        "جاري التحديث..."
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="ml-2 h-5 w-5" />
                    إدارة المستخدمين
                  </CardTitle>
                  <CardDescription>
                    دعوة مستخدمين جدد وإدارة صلاحياتهم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button asChild>
                      <Link href="/users/invite">دعوة مستخدم جديد</Link>
                    </Button>
                    <Separator />
                    <div className="text-center py-8 text-gray-500">
                      لا يوجد مستخدمون آخرون في المؤسسة
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="ml-2 h-5 w-5" />
                  معلومات الاشتراك
                </CardTitle>
                <CardDescription>
                  عرض وإدارة اشتراكك الحالي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="text-sm">الخطة الحالية</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="text-sm">المستخدمون</span>
                    <span className="font-semibold">5 من 5</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="text-sm">المشاريع</span>
                    <span className="font-semibold">3 من 3</span>
                  </div>
                </div>
                <div className="text-center">
                  <Button className="w-full">
                    ترقية الخطة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="ml-2 h-5 w-5" />
                    تغيير كلمة المرور
                  </CardTitle>
                  <CardDescription>
                    قم بتغيير كلمة المرور الخاصة بك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="أدخل كلمة المرور الحالية"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-2 h-6 w-6 p-0"
                          onClick={() => togglePasswordVisibility("current")}
                        >
                          {showPasswords.current ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="أدخل كلمة المرور الجديدة"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-2 h-6 w-6 p-0"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="flex items-center space-x-2 space-x-reverse mt-2">
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
                      <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="أعد إدخال كلمة المرور الجديدة"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-2 h-6 w-6 p-0"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        "جاري تغيير كلمة المرور..."
                      ) : (
                        <>
                          <Lock className="ml-2 h-4 w-4" />
                          تغيير كلمة المرور
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="ml-2 h-5 w-5" />
                      أسئلة الأمان
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings/security-questions">
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </Link>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {hasSecurityQuestions ? "لقد قمت بإعداد أسئلة الأمان" : "لم تقم بإعداد أسئلة الأمان بعد"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-center py-8 ${hasSecurityQuestions ? "text-green-600" : "text-gray-500"}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      hasSecurityQuestions ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      {hasSecurityQuestions ? (
                        <Check className="h-8 w-8 text-green-600" />
                      ) : (
                        <Shield className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">
                      {hasSecurityQuestions ? "أسئلة الأمان مفعلة" : "أسئلة الأمان غير مفعلة"}
                    </h3>
                    <p className="text-sm">
                      {hasSecurityQuestions 
                        ? "يمكنك استخدام أسئلة الأمان لاستعادة كلمة المرور"
                        : "قم بإعداد أسئلة الأمان لحماية حسابك بشكل أفضل"
                      }
                    </p>
                    {!hasSecurityQuestions && (
                      <Button asChild className="mt-4">
                        <Link href="/settings/security-questions">
                          <Shield className="ml-2 h-4 w-4" />
                          إعداد أسئلة الأمان
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="two-factor">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="ml-2 h-5 w-5" />
                    المصادقة الثنائية
                  </CardTitle>
                  <CardDescription>
                    إضافة طبقة حماية إضافية لحسابك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Button asChild>
                      <Link href="/settings/two-factor">
                        <Smartphone className="ml-2 h-4 w-4" />
                        إعداد المصادقة الثنائية
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}