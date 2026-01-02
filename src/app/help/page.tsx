'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, HelpCircle, Mail, Phone, MessageCircle, Video, FileText, Users, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelpPage() {
  const { isRTL, currentLanguage } = useLanguage();
  const router = useRouter();

  const helpCategories = [
    {
      icon: BookOpen,
      title: { en: 'Getting Started', ar: 'البدء' },
      color: 'bg-blue-100 text-blue-600',
      items: [
        {
          title: { en: '1. Create Account', ar: '1. إنشاء حساب' },
          description: { 
            en: 'Sign up for a new account using your email and a strong password.',
            ar: 'سجل حسابًا جديدًا باستخدام بريدك الإلكتروني وكلمة مرور قوية.'
          }
        },
        {
          title: { en: '2. Add Wallet', ar: '2. إضافة محفظة' },
          description: { 
            en: 'Add your brokerage accounts to start tracking balances.',
            ar: 'أضف حسابات الوساطة الخاصة بك لبدء تتبع الأرصدة.'
          }
        },
        {
          title: { en: '3. Log Transactions', ar: '3. تسجيل المعاملات' },
          description: { 
            en: 'Manually record deposits, withdrawals, and transfers.',
            ar: 'سجل الإيداعات والسحوبات والتحويلات يدويًا.'
          }
        }
      ]
    },
    {
      icon: TrendingUp,
      title: { en: 'Key Features', ar: 'الميزات الرئيسية' },
      color: 'bg-green-100 text-green-600',
      items: [
        {
          title: { en: 'Balance Tracking', ar: 'تتبع الرصيد' },
          description: { 
            en: 'Monitor your balances across multiple brokerage accounts.',
            ar: 'مراقبة أرصدتك عبر حسابات وساطة متعددة.'
          }
        },
        {
          title: { en: 'Transaction History', ar: 'سجل المعاملات' },
          description: { 
            en: 'Keep a complete record of all your financial transactions.',
            ar: 'احتفظ بسجل كامل لجميع معاملاتك المالية.'
          }
        },
        {
          title: { en: 'Performance Reports', ar: 'تقارير الأداء' },
          description: { 
            en: 'Get insights into your portfolio performance with clear reports.',
            ar: 'احصل على رؤى حول أداء محفظتك مع تقارير واضحة.'
          }
        }
      ]
    },
    {
      icon: Shield,
      title: { en: 'Security & Privacy', ar: 'الأمان والخصوصية' },
      color: 'bg-purple-100 text-purple-600',
      items: [
        {
          title: { en: 'Data Protection', ar: 'حماية البيانات' },
          description: { 
            en: 'Your data is encrypted and never shared with third parties.',
            ar: 'بياناتك مشفرة ولا تتم مشاركتها مع أطراف ثالثة.'
          }
        },
        {
          title: { en: 'Secure Login', ar: 'تسجيل دخول آمن' },
          description: { 
            en: 'Two-factor authentication and secure password storage.',
            ar: 'المصادقة الثنائية وتخزين كلمة المرور الآمن.'
          }
        }
      ]
    },
    {
      icon: Users,
      title: { en: 'Account Management', ar: 'إدارة الحساب' },
      color: 'bg-orange-100 text-orange-600',
      items: [
        {
          title: { en: 'Subscription Plans', ar: 'خطط الاشتراك' },
          description: { 
            en: 'Choose between Free and Pro plans based on your needs.',
            ar: 'اختر بين الخطط المجانية والاحترافية بناءً على احتياجاتك.'
          }
        },
        {
          title: { en: 'Settings & Preferences', ar: 'الإعدادات والتفضيلات' },
          description: { 
            en: 'Customize your account settings and notification preferences.',
            ar: 'تخصيص إعدادات حسابك وتفضيلات الإشعارات.'
          }
        }
      ]
    }
  ];

  const resources = [
    {
      icon: Video,
      title: { en: 'Video Tutorials', ar: 'دروس فيديو' },
      description: { 
        en: 'Watch step-by-step video guides to learn Mahfza features.',
        ar: 'شاهد أدلة فيديو خطوة بخطوة لتعلم ميزات محفظة.'
      },
      link: '#'
    },
    {
      icon: FileText,
      title: { en: 'Documentation', ar: 'الوثائق' },
      description: { 
        en: 'Browse comprehensive documentation for advanced features.',
        ar: 'تصفح الوثائق الشاملة للميزات المتقدمة.'
      },
      link: '#'
    },
    {
      icon: MessageCircle,
      title: { en: 'Community Forum', ar: 'المنتدى المجتمعي' },
      description: { 
        en: 'Connect with other users and share tips and experiences.',
        ar: 'تواصل مع المستخدمين الآخرين وشارك النصائح والتجارب.'
      },
      link: '#'
    }
  ];

  const faqItems = [
    {
      question: { en: 'How do I reset my password?', ar: 'كيف أقوم بإعادة تعيين كلمة المرور؟' },
      answer: { 
        en: 'Click on "Forgot Password" on the sign-in page and follow the instructions sent to your email.',
        ar: 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات المرسلة إلى بريدك الإلكتروني.'
      }
    },
    {
      question: { en: 'Can I use Mahfza on mobile?', ar: 'هل يمكنني استخدام محفظة على الجوال؟' },
      answer: { 
        en: 'Yes! Mahfza is fully responsive and works perfectly on all mobile devices.',
        ar: 'نعم! محفظة متجاوبة بالكامل وتعمل بشكل مثالي على جميع أجهزة الجوال.'
      }
    },
    {
      question: { en: 'How many wallets can I track?', ar: 'كم عدد المحافظ التي يمكنني تتبعها؟' },
      answer: { 
        en: 'Free users can track up to 2 wallets. Pro users can track unlimited wallets.',
        ar: 'المستخدمون المجانيون يمكنهم تتبع ما يصل إلى محفظتين. المستخدمون المحترفون يمكنهم تتبع عدد غير محدود من المحافظ.'
      }
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {isRTL ? 'مركز المساعدة' : 'Help Center'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isRTL ? 
                  'كل ما تحتاج لمعرفته لاستخدام محفظة بفعالية. ابحث عن إجابات، تعلم الميزات، واحصل على الدعم.' :
                  'Everything you need to know to use Mahfza effectively. Find answers, learn features, and get support.'
                }
              </p>
            </div>

            {/* Quick Search */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث عن مساعدة...' : 'Search for help...'}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <HelpCircle className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">
                          {category.title[isRTL ? 'ar' : 'en']}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.title[isRTL ? 'ar' : 'en']}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {item.description[isRTL ? 'ar' : 'en']}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isRTL ? 'موارد تعليمية' : 'Learning Resources'}
              </h2>
              <p className="text-gray-600">
                {isRTL ? 
                  'استكشف مواردنا التعليمية لتصبح خبيرًا في استخدام محفظة.' :
                  'Explore our learning resources to become a Mahfza expert.'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title[isRTL ? 'ar' : 'en']}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {resource.description[isRTL ? 'ar' : 'en']}
                      </p>
                      <Button variant="outline" size="sm">
                        {isRTL ? 'استكشف' : 'Explore'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-gray-600">
                {isRTL ? 
                  'إجابات سريعة على أكثر الأسئلة شيوعًا.' :
                  'Quick answers to the most common questions.'
                }
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {faq.question[isRTL ? 'ar' : 'en']}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer[isRTL ? 'ar' : 'en']}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline" size="lg">
                  {isRTL ? 'عرض المزيد من الأسئلة' : 'View More Questions'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {isRTL ? 'هل تحتاج إلى مساعدة إضافية؟' : 'Need Additional Help?'}
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              {isRTL ? 
                'فريق الدعم الخاص بنا هنا لمساعدتك على مدار الساعة.' :
                'Our support team is here to help you 24/7.'
              }
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Mail className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Support'}
                </h3>
                <p className="text-blue-100 mb-3">
                  {isRTL ? 'احصل على رد خلال 24 ساعة' : 'Get a response within 24 hours'}
                </p>
                <a 
                  href="mailto:support@mahfza.com" 
                  className="text-white font-medium hover:underline"
                >
                  support@mahfza.com
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Phone className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">
                  {isRTL ? 'الدعم الهاتفي' : 'Phone Support'}
                </h3>
                <p className="text-blue-100 mb-3">
                  {isRTL ? 'متاح من السبت إلى الخميس' : 'Available Saturday to Thursday'}
                </p>
                <a 
                  href="tel:+20123456789" 
                  className="text-white font-medium hover:underline"
                >
                  +20 123 456 789
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}