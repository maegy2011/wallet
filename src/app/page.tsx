'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users, 
  Smartphone, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Lock,
  RefreshCw,
  Eye,
  Building,
  Store,
  CreditCard,
  FileText,
  PiggyBank,
  AlertCircle,
  Home
} from 'lucide-react'
import ProtectedEmail from '@/components/protected-email'

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [expectedAnswer, setExpectedAnswer] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Generate simple captcha - only on client side
  useEffect(() => {
    setIsClient(true)
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setExpectedAnswer(num1 + num2)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple captcha validation
    if (parseInt(captchaAnswer) !== expectedAnswer) {
      setSubmitMessage('الإجابة على السؤال التأكيدي غير صحيحة')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Here you would normally send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSubmitMessage('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.')
      setFormData({ name: '', email: '', phone: '', message: '' })
      setCaptchaAnswer('')
      // Generate new captcha after successful submission
      const num1 = Math.floor(Math.random() * 10) + 1
      const num2 = Math.floor(Math.random() * 10) + 1
      setCaptchaQuestion(`${num1} + ${num2} = ?`)
      setExpectedAnswer(num1 + num2)
    } catch (error) {
      setSubmitMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    {
      icon: Wallet,
      title: 'إدارة المحافظ',
      description: 'إنشاء وإدارة عدد غير محدود من المحافظ الإلكترونية لمنشأتك'
    },
    {
      icon: Building,
      title: 'إدارة متعددة الفروع',
      description: 'إدارة فروع متعددة بسهولة تامة مع تحكم كامل في الصلاحيات'
    },
    {
      icon: BarChart3,
      title: 'تقارير مفصلة',
      description: 'تقارير مالية شاملة يومية، أسبوعية، شهرية وسنوية'
    },
    {
      icon: Shield,
      title: 'أمان متقدم',
      description: 'تشفير البيانات وحماية كاملة لجميع المعاملات المالية'
    },
    {
      icon: Smartphone,
      title: 'واجهة محمولة',
      description: 'تصميم متجاوب يعمل على جميع الأجهزة المحمولة والحواسيب'
    },
    {
      icon: Zap,
      title: 'سرعة فائقة',
      description: 'معالجة فورية للمعاملات وتحديثات لحظية للرصيد'
    },
    {
      icon: Users,
      title: 'إدارة المستخدمين',
      description: 'تحكم كامل في صلاحيات المستخدمين والفرق العمل'
    },
    {
      icon: CreditCard,
      title: 'رسوم مرنة',
      description: 'نظام رسوم متعدد الخيارات يناسب احتياجات عملك'
    },
    {
      icon: PiggyBank,
      title: 'خزينة نقدية',
      description: 'إدارة الخزينة النقدية وتتبع التدفقات المالية'
    }
  ]

  const stats = [
    { label: 'منشأة', value: '500+' },
    { label: 'فرع', value: '1000+' },
    { label: 'معاملة شهرية', value: '50,000+' },
    { label: 'دولة', value: '10+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Quick Navigation for Authenticated Users */}
      {isAuthenticated && (
        <div className="bg-emerald-600 text-white py-3 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">مرحباً بك، {user?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/summary" 
                  className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  التقارير
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
                >
                  الملف الشخصي
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-emerald-50 to-teal-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {isAuthenticated ? (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  أهلاً بعودتك،
                  <span className="text-emerald-600"> {user?.name}</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  استمر في إدارة أعمالك بكفاءة. استخدم الأزرار بالأعلى للوصول السريع إلى التقارير والملف الشخصي.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/summary">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
                      عرض التقارير
                      <BarChart3 className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                      الملف الشخصي
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  نظام متكامل لإدارة
                  <span className="text-emerald-600"> المحافظ الإلكترونية</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  حل ذكي وشامل لإدارة المعاملات المالية لمنشأتك. تحكم كامل في المحافظ، الفروع، والمستخدمين 
                  مع تقارير مفصلة ورسوم مرنة.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
                      ابدأ مجاناً
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                      تعرف على المميزات
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مميزات نظام المحفظة الذكية
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نظام شامل يوفر جميع الأدوات التي تحتاجها لإدارة أعمالك المالية بكفاءة وأمان
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              خطة أسعار بسيطة وشفافة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              سعر واحد يناسب جميع احتياجاتك بدون تعقيدات أو رسوم خفية
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-emerald-600 shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-bold">الخطة الكاملة</CardTitle>
                <CardDescription className="text-lg">كل ما تحتاجه لإدارة أعمالك</CardDescription>
                <div className="mt-6">
                  <div className="text-5xl font-bold text-emerald-600">
                    50 جنيه
                  </div>
                  <div className="text-gray-600 text-lg mt-2">شهرياً فقط</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">منشأة واحدة فقط</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">عدد غير محدود من الفروع</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">عدد غير محدود من المعاملات</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">بدون نسبة من إجمالي المعاملات</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">جميع المميزات متاحة</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 ml-3" />
                    <span className="text-gray-700">دعم فني متخصص</span>
                  </div>
                </div>
                <Link href="/auth/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-3">
                    ابدأ الآن
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              تواصل معنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو اقتراحات
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6">معلومات التواصل</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-emerald-600 ml-3" />
                      <span className="text-gray-700" dir="ltr">+20 123 456 7890</span>
                    </div>
                    <div className="flex items-center">
                      <ProtectedEmail 
                        email="info@smartwallet.com"
                        className="text-gray-700 flex items-center gap-3"
                      />
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-emerald-600 ml-3" />
                      <span className="text-gray-700">القاهرة، مصر</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">ساعات العمل</h3>
                  <div className="text-gray-700">
                    <p>الأحد - الخميس: 9:00 ص - 6:00 م</p>
                    <p>الجمعة - السبت: 10:00 ص - 4:00 م</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>أرسل لنا رسالة</CardTitle>
                  <CardDescription>
                    سنرد على رسالتك في أقرب وقت ممكن
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">الاسم *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">الهاتف *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">الرسالة *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="captcha">
                        سؤال تأكيدي: <span className="inline-block min-h-[1.5rem]">{isClient ? captchaQuestion : '\u00A0'}</span> *
                      </Label>
                      <Input
                        id="captcha"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        required
                        className="mt-1"
                        placeholder="أدخل الإجابة"
                      />
                    </div>
                    
                    {submitMessage && (
                      <Alert className={submitMessage.includes('نجاح') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitMessage}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}