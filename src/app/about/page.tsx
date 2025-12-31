'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Shield, TrendingUp, Globe, ArrowRight, Check, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ar') {
      setIsRTL(true);
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  const toggleLanguage = () => {
    const newRTL = !isRTL;
    setIsRTL(newRTL);
    document.documentElement.dir = newRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = newRTL ? 'ar' : 'en';
    localStorage.setItem('language', newRTL ? 'ar' : 'en');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {isRTL ? 
                'تمكين الوسطاء بتتبع بسيط وآمن' :
                'Empowering Brokers with Simple, Secure Tracking'
              }
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isRTL ? 
                'محفظة هي أداة مصممة للوسطاء والمستثمرين لتتبع أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا - دون إدارة أو التحكم في أصولك.' :
                'Mahfza is a tool designed for brokers and investors to manually track their balances, transactions, and portfolio performance—without managing or controlling your assets.'
              }
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              onClick={() => router.push('/signup')}
            >
              {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
              <ArrowRight className={`w-5 h-5 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {isRTL ? 'قصتنا' : 'Our Story'}
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  {isRTL ? 
                    'تم إنشاء محفظة لحل مشكلة بسيطة: احتاج الوسطاء والمستثمرون إلى طريقة سهلة لتسجيل ومراقبة أنشطتهم المالية دون أدوات معقدة.' :
                    'Mahfza was created to solve a simple problem: Brokers and investors needed an easy way to manually log and monitor their financial activities without complex tools.'
                  }
                </p>
                <p>
                  {isRTL ? 
                    'مهمتنا: توفير منصة آمنة وسهلة الاستخدام لتتبع رحلتك المالية.' :
                    'Our mission: To provide a secure, user-friendly platform for tracking your financial journey.'
                  }
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&crop=center"
                alt={isRTL ? 'فريق عمل يعمل على مشروع محفظة' : 'Team working on Mahfza project'}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Mahfza Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'لماذا تختار محفظة؟' : 'Why Choose Mahfza?'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'الميزات التي تجعلنا الخيار الأفضل للوسطاء' : 'Features that make us the best choice for brokers'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {isRTL ? 'بسيط' : 'Simple'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'لا توجد تكاملات معقدة - فقط تسجيل يدوي سهل.' :
                    'No complex integrations—just manual logging.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {isRTL ? 'آمن' : 'Secure'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'بياناتك مشفرة ولا تتم مشاركتها أبدًا.' :
                    'Your data is encrypted and never shared.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {isRTL ? 'مرن' : 'Flexible'}
                </h3>
                <p className="text-gray-600">
                  {isRTL ? 
                    'تتبع محافظ غير محدودة مع محفظة برو.' :
                    'Track unlimited wallets with Mahfza Pro.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'فريقنا' : 'Our Team'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'تأسيس على يد فريق من الوسطاء والمطورين' : 'Founded by a team of brokers and developers'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'فريق الخبراء' : 'Expert Team'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'متخصصون في التمويل والتكنولوجيا' :
                  'Specialists in finance and technology'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'ملتزمون بالأمان' : 'Security Committed'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'أمان بياناتك هو أولويتنا' :
                  'Your data security is our priority'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'مركزون على النجاح' : 'Success Focused'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'نساعدك على تحقيق أهدافك المالية' :
                  'We help you achieve your financial goals'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isRTL ? 
              'هل أنت مستعد للبدء في تتبع محفظتك؟' :
              'Ready to Start Your Free Trial?'
            }
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isRTL ? 
              'انضم إلى آلاف الوسطاء الذين يثقون في محفظة' :
              'Join thousands of brokers who trust Mahfza'
            }
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={() => router.push('/signup')}
          >
            {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
            <ArrowRight className={`w-5 h-5 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Mahfza | محفظة</span>
              </div>
              <p className="text-gray-400 text-sm">
                {isRTL ? 
                  'طريقة بسيطة وآمنة لتتبع محفظتك المالية.' :
                  'A simple, secure way to track your financial portfolio.'
                }
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {isRTL ? 'المنتج' : 'Product'}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    {isRTL ? 'المميزات' : 'Features'}
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    {isRTL ? 'الأسعار' : 'Pricing'}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {isRTL ? 'من نحن' : 'About'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {isRTL ? 'الدعم' : 'Support'}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    {isRTL ? 'تواصل معنا' : 'Contact'}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {isRTL ? 'تابعنا' : 'Follow Us'}
              </h3>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">in</span>
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">𝕏</span>
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">📷</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Mahfza. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}