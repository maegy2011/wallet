'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PieChart, Clock, Lock, Check, X, Menu, ChevronDown, Globe, Shield, TrendingUp, FileText, Users, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRTL, setIsRTL] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  useEffect(() => {
    // Check if user has already consented to cookies
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowCookieConsent(true);
    }
  }, []);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowCookieConsent(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
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
                  'محفظة | Mahfza – تتبع أرصدتك بسهولة' :
                  'Mahfza | محفظة – Track Your Balances with Ease'
                }
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                {isRTL ? 
                  'طريقة بسيطة وآمنة للوسطاء لتسجيل ومراقبة أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا. مع محفظة، سجل أرصدتك وتابع أدائك المالي بسهولة وأمان.' :
                  'A simple, secure way for brokers to manually log and monitor their balances, transactions, and portfolio performance. مع محفظة، سجل أرصدتك وتابع أدائك المالي بسهولة وأمان.'
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
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  {isRTL ? 'كيف يعمل' : 'How It Works'}
                </Button>
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
              {isRTL ? 'لماذا يحب الوسطاء محفظة' : 'Why Brokers Love Mahfza'}
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
              {isRTL ? 'خطوات بسيطة للبدء' : 'Simple Steps to Get Started'}
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
              {isRTL ? 'أسعار بسيطة وشفافة' : 'Simple, Transparent Pricing'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {isRTL ? 'اختر الخطة التي تناسب احتياجاتك' : 'Choose the plan that fits your needs'}
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isAnnualBilling ? 'text-blue-600' : 'text-gray-600'}`}>
                {isRTL ? 'شهري' : 'Monthly'}
              </span>
              <button
                onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnualBilling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnualBilling ? 'text-blue-600' : 'text-gray-600'}`}>
                {isRTL ? 'سنوي (وفر 17%)' : 'Annual (Save 17%)'}
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
                      {isAnnualBilling ? '500' : '60'} {isRTL ? 'جنيه مصري' : 'EGP'}
                    </div>
                    <div className="text-lg text-gray-600">
                      {isAnnualBilling ? 
                        (isRTL ? '/سنة' : '/year') : 
                        (isRTL ? '/شهر' : '/month')
                      }
                    </div>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      {isRTL ? 'توفير 220 جنيه مصري سنويًا' : 'Save 220 EGP annually'}
                    </div>
                  )}
                  <p className="text-gray-600">
                    {isRTL ? 'للمحترفين والنمو' : 'For professionals and growth'}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'محافظ غير محدودة' : 'Unlimited wallets'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'جميع الميزات (تقارير متقدمة، سجل المعاملات، نظرة عامة على المحفظة)' : 'All features (advanced reports, transaction history, portfolio overview)'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {isRTL ? 'دعم أولوي' : 'Priority support'}
                    </span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                  {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'محفظة مجانية مقابل محفظة برو' : 'Mahfza Free vs. Mahfza Pro'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'اختر الخطة المناسبة لاحتياجاتك' : 'Choose the right plan for your needs'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    {isRTL ? 'الميزة' : 'Feature'}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {isRTL ? 'محفظة مجانية' : 'Mahfza Free'}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    {isRTL ? 'محفظة برو' : 'Mahfza Pro'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'السعر' : 'Price'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">{isRTL ? 'مجاني' : 'Free'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>
                      <span className="text-blue-600 font-semibold">
                        {isAnnualBilling ? '500' : '60'} {isRTL ? 'جنيه' : 'EGP'}
                      </span>
                      <div className="text-xs text-gray-600">
                        {isAnnualBilling ? 
                          (isRTL ? '/سنة' : '/year') : 
                          (isRTL ? '/شهر' : '/month')
                        }
                      </div>
                      {isAnnualBilling && (
                        <div className="text-xs text-green-600">
                          {isRTL ? 'وفر 220 جنيه سنويًا' : 'Save 220 EGP annually'}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'عدد المحافظ' : 'Number of Wallets'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-700">2</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">{isRTL ? 'غير محدود' : 'Unlimited'}</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'تتبع الرصيد اليدوي' : 'Manual Balance Tracking'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'التقارير الأساسية' : 'Basic Reports'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'التقارير المتقدمة' : 'Advanced Reports'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'سجل المعاملات' : 'Transaction History'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'نظرة عامة على المحفظة' : 'Portfolio Overview'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'تشفير البيانات الآمن' : 'Secure Data Encryption'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isRTL ? 'دعم أولوي' : 'Priority Support'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 'موثوق من قبل الوسطاء' : 'Trusted by Brokers'}
            </h2>
            <p className="text-lg text-gray-600">
              {isRTL ? 'ماذا يقول عملاؤنا' : 'What our clients say'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{isRTL ? 
                    'محفظة جعلت تتبع أرصدتي أسهل بكثير. لا مزيد من جداول البيانات!' :
                    'Mahfza simplified how I track my balances. No more spreadsheets!'
                  } {isRTL ? 'محفظة جعلت تتبع أرصدتي أسهل بكثير.' : 'Mahfza simplified how I track my balances.'}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Omar T.</p>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'وسيط، دبي' : 'Broker, Dubai'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{isRTL ? 
                    'أخيرًا، أداة تسمح لي بتسجيل معاملاتي بشكل آمن وخصوصي.' :
                    'Finally, a tool that lets me log my transactions securely and privately.'
                  } {isRTL ? 'أداة موثوقة لتسجيل صفقاتي.' : 'A reliable tool for logging my trades.'}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Leila A.</p>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'مستثمرة، الرياض' : 'Investor, Riyadh'}
                    </p>
                  </div>
                </div>
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
              'انضم إلى آلاف الوسطاء الذين يثقون في محفظة' :
              'Join thousands of brokers who trust Mahfza'
            }
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={() => router.push('/signup')}
          >
            {isRTL ? 'ابدأ التجربة المجانية' : 'Start free trial'}
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
                {isRTL ? 'الشركة' : 'Company'}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {isRTL ? 'من نحن' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    {isRTL ? 'اتصل بنا' : 'Contact'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {isRTL ? 'قانوني' : 'Legal'}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
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