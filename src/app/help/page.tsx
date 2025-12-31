'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, ArrowLeft, BookOpen, HelpCircle, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const [isRTL, setIsRTL] = useState(false);
  const router = useRouter();

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {isRTL ? 'العودة' : 'Back'}
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Mahfza | محفظة</span>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {isRTL ? 'EN' : 'العربية'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRTL ? 'دليل المستخدم' : 'User Guide'}
          </h1>
          <p className="text-gray-600">
            {isRTL ? 
              'كل ما تحتاج لمعرفته لاستخدام محفظة بفعالية.' :
              'Everything you need to know to use Mahfza effectively.'
            }
          </p>
        </div>

        <div className="grid gap-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'البدء' : 'Getting Started'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? '1. إنشاء حساب' : '1. Create Account'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'سجل حسابًا جديدً باستخدام بريدك الإلكتروني وكلمة مرور قوية.' :
                    'Sign up for a new account using your email and a strong password.'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? '2. إضافة محفظة' : '2. Add Wallet'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'أضف حسابات الوساطة الخاصة بك لبدء تتبع الأرصدة.' :
                    'Add your brokerage accounts to start tracking balances.'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? '3. تسجيل المعاملات' : '3. Log Transactions'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'سجل الإيداعات والسحوبات والتحويلات يدويًا.' :
                    'Manually record deposits, withdrawals, and transfers.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الميزات الرئيسية' : 'Key Features'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? 'تتبع الرصيد' : 'Balance Tracking'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'مراقبة أرصدتك عبر حسابات وساطة متعددة.' :
                    'Monitor your balances across multiple brokerage accounts.'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? 'سجل المعاملات' : 'Transaction History'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'احتفظ بسجل كامل لجميع معاملاتك المالية.' :
                    'Keep a complete record of all your financial transactions.'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? 'تقارير الأداء' : 'Performance Reports'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'احصل على رؤى حول أداء محفظتك مع تقارير واضحة.' :
                    'Get insights into your portfolio performance with clear reports.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الدعم والاتصال' : 'Support & Contact'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>
                  {isRTL ? 'البريد الإلكتروني:' : 'Email:'}
                  <a href="mailto:support@mahfza.com" className="text-blue-600 hover:underline ml-1">
                    support@mahfza.com
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>
                  {isRTL ? 'الهاتف:' : 'Phone:'}
                  <span className="ml-1">+20 123 456 7890</span>
                </span>
              </div>
              <div className="pt-4">
                <Link href="/dashboard">
                  <Button className="w-full">
                    {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}