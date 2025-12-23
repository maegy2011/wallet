import { requireAuth, getCurrentTenant } from "@/lib/tenant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowRight, CreditCard } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function SubscriptionPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()

  if (!tenant) {
    redirect("/onboarding")
  }

  const plans = [
    {
      name: "مجاني",
      price: "0",
      description: "مثالي للمشاريع الصغيرة والفرق المبتدئة",
      features: [
        "5 مستخدمين كحد أقصى",
        "3 مشاريع",
        "100 مهمة شهرياً",
        "تحليلات أساسية",
        "دعم عبر البريد الإلكتروني",
      ],
      notIncluded: [
        "دعم فوري",
        "تكامل متقدم",
        "واجهة برمجة التطبيقات",
        "تصدير البيانات",
      ],
      popular: false,
      current: tenant.plan === "FREE",
    },
    {
      name: "احترافي",
      price: "29",
      description: "مثالي للشركات المتنامية والفرق المتوسطة",
      features: [
        "25 مستخدم كحد أقصى",
        "مشاريع غير محدودة",
        "مهام غير محدودة",
        "تحليلات متقدمة",
        "دعم فوري عبر الدردشة",
        "تكامل مع أدوات أخرى",
        "واجهة برمجة التطبيقات",
        "تصدير البيانات",
      ],
      notIncluded: [
        "مدير حساب مخصص",
        "تدريب مخصص",
      ],
      popular: true,
      current: tenant.plan === "PRO",
    },
    {
      name: "مؤسسي",
      price: "99",
      description: "مثالي للمؤسسات الكبيرة والمشاريع المعقدة",
      features: [
        "مستخدمون غير محدودون",
        "مشاريع غير محدودة",
        "مهام غير محدودة",
        "تحليلات متقدمة مع تقارير مخصصة",
        "دعم فوري على مدار الساعة",
        "تكامل متقدم مع أدوات أخرى",
        "واجهة برمجة التطبيقات المتقدمة",
        "تصدير البيانات المتقدم",
        "مدير حساب مخصص",
        "تدريب مخصص للفريق",
        "ضمان وقت تشغيل 99.9%",
      ],
      notIncluded: [],
      popular: false,
      current: tenant.plan === "ENTERPRISE",
    },
  ]

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
            <div className="h-6 w-px bg-gray-200" />
            <span className="font-semibold">ترقية الخطة</span>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/settings">
              العودة إلى الإعدادات
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ترقية خطتك الاشتراكية
          </h1>
          <p className="text-gray-600">
            اختر الخطة التي تناسب احتياجات {tenant.name}
          </p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الخطة الحالية</CardTitle>
            <CardDescription>
              أنت مشترك حالياً في خطة {tenant.plan === "FREE" ? "مجاني" : tenant.plan === "PRO" ? "احترافي" : "مؤسسي"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Badge variant={tenant.plan === "FREE" ? "secondary" : tenant.plan === "PRO" ? "default" : "outline"}>
                    {tenant.plan}
                  </Badge>
                  <span className="font-semibold text-lg">
                    {tenant.plan === "FREE" ? "مجاني" : tenant.plan === "PRO" ? "احترافي" : "مؤسسي"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  خطة نشطة حتى {new Date().toLocaleDateString("ar-SA")}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  إدارة الاشتراك
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">خطط متاحة</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.current ? "ring-2 ring-green-500 shadow-xl" : "shadow-lg"
              }`}
            >
              {plan.popular && !plan.current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    <Check className="w-4 h-4 ml-1" />
                    الخطة الحالية
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/شهرياً</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 ml-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start opacity-50">
                      <X className="w-5 h-5 text-red-500 ml-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${
                    plan.current
                      ? "bg-green-600 hover:bg-green-700"
                      : plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
                  variant={plan.current || plan.popular ? "default" : "outline"}
                  disabled={plan.current}
                  asChild
                >
                  <Link href="/settings">
                    {plan.current ? "أنت مشترك حالياً" : "ترقية إلى هذه الخطة"}
                    {plan.current || <ArrowRight className="ml-2 h-4 w-4" />}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Billing Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <CreditCard className="h-5 w-5" />
              معلومات الفوترة
            </CardTitle>
            <CardDescription>
              طريقة الدفع وتاريخ التجديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">طريقة الدفع</span>
                <span className="font-medium">بطاقة ائتمان (****4242)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">تاريخ التجديد القادم</span>
                <span className="font-medium">
                  {new Date(
                    new Date().setMonth(new Date().getMonth() + 1)
                  ).toLocaleDateString("ar-SA")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المبلغ التالي</span>
                <span className="font-medium">
                  $
                  {tenant.plan === "FREE"
                    ? "0"
                    : tenant.plan === "PRO"
                    ? "29"
                    : "99"}
                  .00}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t space-y-2">
              <Button variant="outline" className="w-full">
                تحديث معلومات الدفع
              </Button>
              <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                إلغاء الاشتراك
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
