'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowRight, HelpCircle, CreditCard, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FAQPage() {
  const router = useRouter();
  const [isRTL, setIsRTL] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([]);

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

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: { en: 'General Questions', ar: 'الأسئلة العامة' },
      icon: HelpCircle,
      items: [
        {
          question: { en: 'What is Mahfza?', ar: 'ما هي محفظة؟' },
          answer: { 
            en: 'Mahfza is a tool for brokers to manually track their balances, transactions, and portfolio performance. It provides a simple, secure way to monitor your financial activities without managing or controlling your assets.',
            ar: 'محفظة هي أداة للوسطاء لتتبع أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا. توفر طريقة بسيطة وآمنة لمراقبة أنشطتك المالية دون إدارة أو التحكم في أصولك.'
          }
        },
        {
          question: { en: 'Is Mahfza free?', ar: 'هل محفظة مجانية؟' },
          answer: { 
            en: 'Yes! Mahfza Free lets you track up to 2 wallets. Upgrade to Mahfza Pro for unlimited wallets and advanced features like advanced reports, transaction history, and portfolio overview.',
            ar: 'نعم! محفظة المجانية تتيح لك تتبع ما يصل إلى 2 محفظة. ترقية إلى محفظة برو للحصول على محافظ غير محدودة وميزات متقدمة مثل التقارير المتقدمة وسجل المعاملات ونظرة عامة على المحفظة.'
          }
        },
        {
          question: { en: 'How secure is my data?', ar: 'مدى أمان بياناتي؟' },
          answer: { 
            en: 'Your data is encrypted and never shared with third parties. We use industry-standard encryption to protect your information and ensure your privacy and data security are our top priorities.',
            ar: 'بياناتك مشفرة ولا تتم مشاركتها مع أطراف ثالثة. نستخدم تشفيرًا معياريًا في الصناعة لحماية معلوماتك وضمان أن خصوصيتك وأمان بياناتنا هي أولويتنا القصوى.'
          }
        },
        {
          question: { en: 'Who can use Mahfza?', ar: 'من يمكنه استخدام محفظة؟' },
          answer: { 
            en: 'Mahfza is designed for brokers, investors, and anyone who needs to manually track their financial portfolios and transactions. It\'s perfect for those who want a simple, secure way to monitor their financial activities.',
            ar: 'محفظة مصممة للوسطاء والمستثمرين وأي شخص يحتاج إلى تتبع محافظه ومعاملاته المالية يدويًا. مثالية لأولئك الذين يريدون طريقة بسيطة وآمنة لمراقبة أنشطتهم المالية.'
          }
        }
      ]
    },
    {
      title: { en: 'Account & Billing', ar: 'الحساب والفوترة' },
      icon: CreditCard,
      items: [
        {
          question: { en: 'How do I sign up?', ar: 'كيف أقوم بالتسجيل؟' },
          answer: { 
            en: 'Click "Start Free Trial" on our homepage and follow the simple registration process. You\'ll need to provide your name, email, and create a password. The entire process takes less than 2 minutes.',
            ar: 'انقر على "ابدأ التجربة المجانية" على صفحتنا الرئيسية واتبع عملية التسجيل البسيطة. ستحتاج إلى تقديم اسمك والبريد الإلكتروني وإنشاء كلمة مرور. العملية بأكملها تستغرق أقل من دقيقتين.'
          }
        },
        {
          question: { en: 'Can I cancel my subscription?', ar: 'هل يمكنني إلغاء اشتراكي؟' },
          answer: { 
            en: 'Yes, you can cancel anytime from your account settings. There are no cancellation fees, and you\'ll continue to have access to Pro features until the end of your billing period.',
            ar: 'نعم، يمكنك الإلغاء في أي وقت من إعدادات حسابك. لا توجد رسوم إلغاء، وستستمر في الوصول إلى ميزات برو حتى نهاية فترة الفوترة الخاصة بك.'
          }
        },
        {
          question: { en: 'What payment methods do you accept?', ar: 'ما هي طرق الدفع التي تقبلونها؟' },
          answer: { 
            en: 'We accept all major credit cards, debit cards, and popular digital payment methods. All payments are processed securely through our payment partners.',
            ar: 'نقبل جميع بطاقات الائتمان الرئيسية وبطاقات الخصم وطرق الدفع الرقمية الشائعة. تتم معالجة جميع المدفوعات بأمان من خلال شركاء الدفع لدينا.'
          }
        },
        {
          question: { en: 'Can I change my plan?', ar: 'هل يمكنني تغيير خطتي؟' },
          answer: { 
            en: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and we\'ll prorate any billing adjustments.',
            ar: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت من إعدادات حسابك. التغييرات سارية المفعول فورًا، وسنقوم بحساب أي تعديلات على الفواتير.'
          }
        }
      ]
    },
    {
      title: { en: 'Features', ar: 'المميزات' },
      icon: Settings,
      items: [
        {
          question: { en: 'How do I add a wallet?', ar: 'كيف أضيف محفظة؟' },
          answer: { 
            en: 'Go to your dashboard and click "Add Wallet." You can name your wallet, set initial balance, and start tracking transactions immediately. Free users can add up to 2 wallets.',
            ar: 'اذهب إلى لوحة التحكم وانقر على "إضافة محفظة". يمكنك تسمية محفظتك وتعيين الرصيد الأولي وبدء تتبع المعاملات فورًا. يمكن للمستخدمين المجانيين إضافة ما يصل إلى محفظتين.'
          }
        },
        {
          question: { en: 'Can I export my data?', ar: 'هل يمكنني تصدير بياناتي؟' },
          answer: { 
            en: 'Yes, you can export your transaction history as a CSV file from your dashboard. This allows you to analyze your data in spreadsheet applications or keep backup records.',
            ar: 'نعم، يمكنك تصدير سجل المعاملات كملف CSV من لوحة التحكم. يتيح لك ذلك تحليل بياناتك في تطبيقات الجداول أو الحفاظ على سجلات النسخ الاحتياطي.'
          }
        },
        {
          question: { en: 'What reports are available?', ar: 'ما هي التقارير المتاحة؟' },
          answer: { 
            en: 'Mahfza Free offers basic reports, while Mahfza Pro provides advanced reports including portfolio performance charts, transaction categorization, and detailed analytics to help you make informed decisions.',
            ar: 'محفظة المجانية تقدم تقارير أساسية، بينما توفر محفظة برو تقارير متقدمة بما في ذلك رسوم أداء المحفظة وتصنيف المعاملات وتحليلات مفصلة لمساعدتك في اتخاذ قرارات مستنيرة.'
          }
        },
        {
          question: { en: 'Is there a mobile app?', ar: 'هل هناك تطبيق جوال؟' },
          answer: { 
            en: 'Currently, Mahfza is available as a web application that works perfectly on all devices. We\'re working on mobile apps for iOS and Android and will announce their release soon.',
            ar: 'حاليًا، محفظة متاحة كتطبيق ويب يعمل بشكل مثالي على جميع الأجهزة. نحن نعمل على تطبيقات الجوال لنظامي iOS و Android وسنعلن عن إصدارها قريبًا.'
          }
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {isRTL ? 
                  'الأسئلة الشائعة' :
                  'Frequently Asked Questions'
                }
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {isRTL ? 
                  'كل ما تحتاج لمعرفته حول محفظة - من البدء إلى الميزات المتقدمة' :
                  'Everything you need to know about Mahfza - from getting started to advanced features'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  onClick={() => router.push('/signup')}
                >
                  {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                  <ArrowRight className={`w-5 h-5 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                  onClick={() => router.push('/contact')}
                >
                  {isRTL ? 'اسأل سؤالاً' : 'Ask a Question'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="mb-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {category.title[isRTL ? 'ar' : 'en']}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      const isOpen = openItems.includes(categoryIndex * 100 + itemIndex);
                      const globalIndex = categoryIndex * 100 + itemIndex;
                      
                      return (
                        <Card key={itemIndex} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 pr-4">
                                {item.question[isRTL ? 'ar' : 'en']}
                              </h3>
                              <div className="flex-shrink-0">
                                {isOpen ? (
                                  <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                            </button>
                            
                            {isOpen && (
                              <div className="px-6 pb-4">
                                <div className="border-t border-gray-100 pt-4">
                                  <p className="text-gray-600 leading-relaxed">
                                    {item.answer[isRTL ? 'ar' : 'en']}
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Still Have Questions Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? 
                'هل لا تزال لديك أسئلة؟' :
                'Still Have Questions?'
              }
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {isRTL ? 
                'فريق الدعم الخاص بنا هنا لمساعدتك' :
                'Our support team is here to help'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => router.push('/contact')}
              >
                {isRTL ? 'تواصل معنا' : 'Contact Support'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                onClick={() => router.push('/signup')}
              >
                {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}