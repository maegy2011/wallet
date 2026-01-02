'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PieChart, Clock, Lock, TrendingUp, FileText, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const router = useRouter();
  const { isRTL, currentLanguage } = useLanguage();
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`text-center lg:text-left ${isRTL ? 'lg:text-right' : ''}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {isRTL ? 
                  'محفظة – تتبع أرصدتك بسهولة' :
                  'Mahfza – Track Your Balances with Ease'
                }
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                {isRTL ? 
                  'طريقة بسيطة وآمنة للوسطاء لتسجيل ومراقبة أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا.' :
                  'A simple, secure way for brokers to manually log and monitor their balances, transactions, and portfolio performance.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  onClick={() => router.push('/signup')}
                >
                  {isRTL ? 'ابدأ التجربة المجانية' : 'Start free trial'}
                </Button>
                <button
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-lg font-medium transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-8 py-4 h-12"
                style={{ 
                  fontWeight: 600,
                  color: '#2563eb !important'
                }}
              >
                {isRTL ? 'كيف يعمل' : 'How It Works'}
              </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center"
                  alt={isRTL ? 'وسيط يراجع البيانات المالية' : 'Broker reviewing financial data'}
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">{isRTL ? 'أداء المحفظة' : 'Portfolio Performance'}</p>
                    <p className="text-2xl font-bold">+24.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'المميزات' : 'Features'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'أدوات قوية مصممة خصيصًا لاحتياجاتك' : 'Powerful tools designed specifically for your needs'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isRTL ? 'تتبع الرصيد اليدوي' : 'Manual Balance Tracking'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isRTL ? 
                    'سجل أرصدتك وصفقاتك يدويًا بكل سهولة من أي حساب وساطة.' :
                    'Easily log your balances and transactions from any brokerage account.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isRTL ? 'نظرة عامة على المحفظة' : 'Portfolio Overview'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isRTL ? 
                    'رؤية شاملة لأدائك المالي في مكان واحد.' :
                    'Get a clear, visual summary of your portfolio performance.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isRTL ? 'سجل المعاملات' : 'Transaction History'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isRTL ? 
                    'سجل كامل لصفقاتك في أي وقت للمرجعية السهلة.' :
                    'Keep a detailed record of all your transactions for easy reference.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isRTL ? 'آمن وخصوصي' : 'Secure & Private'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isRTL ? 
                    'بياناتك مشفرة ولا تتم مشاركتها أبدًا. خصوصيتك وأمان بياناتك هي الأولوية.' :
                    'Your data is encrypted and never shared. Your privacy and data security are our priority.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'كيف يعمل' : 'How It Works'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'ابدأ في دقائق قليلة' : 'Get started in minutes'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'سجل' : 'Sign Up'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'أنشئ حسابك في أقل من دقيقتين.' :
                  'Create your account in under 2 minutes.'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'أضف أرصدتك' : 'Add Your Balances'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'أدخل أرصدتك ومعاملات الوساطة يدويًا.' :
                  'Manually enter your brokerage balances and transactions.'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRTL ? 'تتبع وحلل' : 'Track & Analyze'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 
                  'راقب أداء محفظتك بمرئيات وتقارير واضحة.' :
                  'Monitor your portfolio performance with clear visuals and reports.'
                }
              </p>
            </div>
          </div>

          {/* Demo Video Placeholder */}
          <div className="mt-12 bg-gray-100 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isRTL ? 'شاهد كيف يعمل' : 'See How It Works'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isRTL ? 
                'فيديو قصير يوضح كيفية تسجيل معاملة' :
                'Short video showing how to log a transaction'
              }
            </p>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              {isRTL ? 'مشاهدة الفيديو التوضيحي' : 'Watch Demo Video'}
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'الأسعار' : 'Pricing'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {isRTL ? 'اختر الخطة التي تناسب احتياجاتك' : 'Choose the plan that fits your needs'}
            </p>
            
            {/* Billing Toggle */}
            <div className={`flex items-center justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`text-sm font-medium transition-colors ${
                !isAnnualBilling ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {isRTL ? 'شهري' : 'Monthly'}
              </span>
              <button
                onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAnnualBilling ? 'bg-green-600' : 'bg-blue-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                    // For LTR (English): translate-x works left-to-right as expected
                    // For RTL (Arabic): we need to reverse the logic
                    isRTL 
                      ? (isAnnualBilling ? '-translate-x-6' : '-translate-x-1')  // RTL: move from right to left
                      : (isAnnualBilling ? 'translate-x-6' : 'translate-x-1')   // LTR: move from left to right
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${
                isAnnualBilling ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isRTL ? 'سنوي (وفر 220 جنيه)' : 'Annual (Save 220 EGP)'}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className={`bg-white border-2 shadow-lg hover:shadow-xl transition-shadow ${isRTL ? 'border-r-4' : 'border-l-4'} border-blue-600`}>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isRTL ? 'محفظة مجانية' : 'Mahfza Free'}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {isRTL ? 'مجانية للأبد' : 'Free Forever'}
                  </div>
                  <p className="text-gray-600">
                    {isRTL ? 'مثالية للبدء' : 'Perfect for getting started'}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'تتبع حتى محفظتين' : 'Track up to 2 wallets'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'الميزات الأساسية (تتبع الرصيد اليدوي، تقارير أساسية)' : 'Core features (manual balance tracking, basic reports)'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'تشفير البيانات الآمن' : 'Secure data encryption'}
                    </span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                  {isRTL ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={`bg-white border-2 shadow-lg hover:shadow-xl transition-shadow relative ${isRTL ? 'border-r-4' : 'border-l-4'} border-blue-600`}>
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isRTL ? 'محفظة برو' : 'Mahfza Pro'}
                  </h3>
                  <div className="mb-2">
                    <div className="text-4xl font-bold text-blue-600">
                      {isAnnualBilling ? '500' : '60'} {isRTL ? 'جنيه' : 'EGP'}
                      {isAnnualBilling && (
                        <span className="text-lg font-normal text-gray-400 line-through ml-2">
                          720 {isRTL ? 'جنيه' : 'EGP'}
                        </span>
                      )}
                    </div>
                    <div className="text-lg text-gray-600">
                      {isAnnualBilling ? 
                        (isRTL ? 'سنوياً' : '/year') : 
                        (isRTL ? 'شهرياً' : '/month')
                      }
                    </div>
                    {isAnnualBilling && (
                      <div className="mt-2 text-sm text-green-600 font-semibold">
                        {isRTL ? 'توفير 220 جنيه سنوياً (27%)' : 'Save 220 EGP yearly (27%)'}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {isRTL ? 'للمحترفين والشركات' : 'For professionals and businesses'}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'تتبع غير محدود للمحافظ' : 'Unlimited wallet tracking'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'تقارير متقدمة وتحليلات' : 'Advanced reports and analytics'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'تصدير البيانات (CSV, PDF)' : 'Data export (CSV, PDF)'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'دعم فني مخصص' : 'Priority customer support'}
                    </span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                  {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                </Button>
              </CardContent>
            </Card>
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
              'انضم إلى آلاف الوسطاء الذين يثقون في محفظة لإدارة أرصدتهم' :
              'Join thousands of brokers who trust Mahfza to manage their balances'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={() => router.push('/signup')}
            >
              {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
            </Button>
            <button
              onClick={() => scrollToSection('features')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-lg font-medium transition-all border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 h-12"
              style={{ 
                fontWeight: 600,
                color: '#ffffff !important'
              }}
            >
              {isRTL ? 'تعلم المزيد' : 'Learn More'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Mahfza | محفظة</span>
              </div>
              <p className="text-gray-400 mb-4">
                {isRTL ?
                  'منصة بسيطة وآمنة للوسطاء لتتبع أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا.' :
                  'A simple, secure platform for brokers to manually track their balances, transactions, and portfolio performance.'
                }
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? 'المنتج' : 'Product'}
              </h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isRTL ? 'المميزات' : 'Features'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isRTL ? 'كيف يعمل' : 'How It Works'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isRTL ? 'الأسعار' : 'Pricing'}
                  </button>
                </li>
                <li>
                  <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                    {isRTL ? 'من نحن' : 'About'}
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-gray-400 hover:text-white transition-colors">
                    {isRTL ? 'المساعدة' : 'Help'}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? 'الدعم' : 'Support'}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-gray-400 hover:text-white transition-colors">
                    {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? 'تواصل معنا' : 'Contact'}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:support@mahfza.com" className="hover:text-white transition-colors">
                    support@mahfza.com
                  </a>
                </li>
                <li>
                  <a href="tel:+20123456789" className="hover:text-white transition-colors">
                    {isRTL ? '+20 123 456 789' : '+20 123 456 789'}
                  </a>
                </li>
              </ul>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
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
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Mahfza. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}