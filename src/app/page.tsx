"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Shield, Zap, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "مجاني",
    description: "مثالي للمشاريع الصغيرة والفرق المبتدئة",
    price: "0",
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
    color: "border-gray-200",
    popular: false,
  },
  {
    name: "احترافي",
    description: "مثالي للشركات المتنامية والفرق المتوسطة",
    price: "29",
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
    color: "border-blue-200",
    popular: true,
  },
  {
    name: "مؤسسي",
    description: "مثالي للمؤسسات الكبيرة والمشاريع المعقدة",
    price: "99",
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
    color: "border-purple-200",
    popular: false,
  },
]

const features = [
  {
    icon: Users,
    title: "إدارة متعددة المستأجرين",
    description: "نظام متكامل لإدارة عدة مؤسسات وفروع بسهولة وأمان",
  },
  {
    icon: Shield,
    title: "أمان متقدم",
    description: "تشفير البيانات، صلاحيات متقدمة، وعزل كامل بين المستأجرين",
  },
  {
    icon: Zap,
    title: "أداء عالي",
    description: "بنية تحتية حديثة تضمن سرعة واستجابة ممتازة",
  },
]

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">س</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ساسaaS</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
              المميزات
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              الأسعار
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              اتصل بنا
            </a>
          </nav>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">ابدأ مجاناً</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            🚀 أحدث منصة SaaS متعددة المستأجرين
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            منصة متكاملة لإدارة
            <span className="text-blue-600"> أعمالك المتعددة</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            حل سحابي متطور يتيح لك إدارة عدة مؤسسات وفريق عمل من لوحة تحكم واحدة، مع أمان متقدم ومرونة لا مثيل لها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/signup">
                ابدأ مجاناً
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#demo">شاهد عرضاً توضيحياً</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مميزات تجعلنا مختلفين
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نقدم أفضل المميزات التي تحتاجها لإدارة أعمالك بكفاءة وأمان
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              خطط أسعار تناسب الجميع
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              اختر الخطة التي تناسب حجم عملك واحتياجاتك
            </p>
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("monthly")}
                className="px-6"
              >
                شهري
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("yearly")}
                className="px-6"
              >
                سنوي (وفر 20%)
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.color} ${
                  plan.popular ? "ring-2 ring-blue-500 shadow-xl" : "shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 ml-1" />
                      الأكثر شعبية
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
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 ml-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start opacity-50">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full ml-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/auth/signup?plan=${plan.name.toLowerCase()}`}>
                      {plan.name === "مجاني" ? "ابدأ مجاناً" : "اختر الخطة"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف الشركات التي تثق في منصتنا لإدارة أعمالها
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/auth/signup">
              ابدأ تجربتك المجانية اليوم
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">س</span>
                </div>
                <span className="text-xl font-bold text-white">ساسaaS</span>
              </div>
              <p className="text-gray-400">
                منصة متكاملة لإدارة الأعمال المتعددة بأمان وكفاءة
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">المنتج</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">المميزات</a></li>
                <li><a href="#" className="hover:text-white transition">الأسعار</a></li>
                <li><a href="#" className="hover:text-white transition">الشركاء</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition">التوثيق</a></li>
                <li><a href="#" className="hover:text-white transition">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition">المدونة</a></li>
                <li><a href="#" className="hover:text-white transition">الوظائف</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2024 ساسaaS. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}