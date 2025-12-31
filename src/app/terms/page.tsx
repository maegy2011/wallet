'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Globe, ArrowRight, FileText, User, CreditCard, AlertTriangle, Scale, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TermsPage() {
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

  const sections = [
    {
      icon: FileText,
      title: { en: 'Acceptance of Terms', ar: 'قبول الشروط' },
      content: {
        en: 'By using Mahfza, you agree to these terms of service. If you do not agree to these terms, please do not use our service. We may update these terms from time to time, and your continued use of the service constitutes acceptance of any changes.',
        ar: 'باستخدام محفظة، فإنك توافق على شروط الخدمة هذه. إذا لم توافق على هذه الشروط، يرجى عدم استخدام خدمتنا. قد نحدث هذه الشروط من وقت لآخر، ويشكل استخدامك المستمر للخدمة قبولًا لأي تغييرات.'
      }
    },
    {
      icon: User,
      title: { en: 'User Responsibilities', ar: 'مسؤوليات المستخدم' },
      content: {
        en: 'You are responsible for the accuracy of your manually logged data. You must ensure that all information you provide is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials.',
        ar: 'أنت مسؤول عن دقة بياناتك التي تسجلها يدويًا. يجب أن تضمن أن جميع المعلومات التي تقدمها دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك.'
      }
    },
    {
      icon: AlertTriangle,
      title: { en: 'Prohibited Activities', ar: 'الأنشطة المحظورة' },
      content: {
        en: 'You may not use Mahfza for illegal activities, fraud, or to violate any laws. You cannot attempt to gain unauthorized access to our systems, interfere with service operation, or use the service to transmit harmful content.',
        ar: 'لا يجوز لك استخدام محفظة لأنشطة غير قانونية أو احتيال أو انتهاك أي قوانين. لا يمكنك محاولة الوصول غير المصرح به إلى أنظمتنا أو التدخل في تشغيل الخدمة أو استخدام الخدمة لنقل محتوى ضار.'
      }
    },
    {
      icon: CreditCard,
      title: { en: 'Subscription & Payments', ar: 'الاشتراك والمدفوعات' },
      content: {
        en: 'Mahfza Pro is billed annually at 500 EGP. Payments are processed securely through our payment providers. Subscription fees are non-refundable except as required by law. You can cancel your subscription at any time from your account settings.',
        ar: 'محفظة برو تُفوتر سنويًا بمبلغ 500 جنيه مصري. تتم معالجة المدفوعات بأمان من خلال مقدمي الدفع لدينا. رسوم الاشتراك غير قابلة للاسترداد إلا كما يتطلبه القانون. يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك.'
      }
    },
    {
      icon: Scale,
      title: { en: 'Limitation of Liability', ar: 'تحدد المسؤولية' },
      content: {
        en: 'Mahfza is not liable for inaccuracies in manually logged data, financial losses, or damages resulting from your use of the service. We provide the service "as is" without warranties of any kind. Our total liability shall not exceed the amount you paid for the service.',
        ar: 'محفظة غير مسؤولة عن عدم الدقة في البيانات التي تم تسجيلها يدويًا أو الخسائر المالية أو الأضرار الناتجة عن استخدامك للخدمة. نقدم الخدمة "كما هي" بدون ضمانات من أي نوع. لا يجب أن تتجاوز مسؤوليتنا الإجمالية المبلغ الذي دفعته للخدمة.'
      }
    },
    {
      icon: Calendar,
      title: { en: 'Termination', ar: 'الإنهاء' },
      content: {
        en: 'We reserve the right to terminate accounts for violations of these terms. You may terminate your account at any time. Upon termination, your right to use the service ceases immediately, but these terms shall remain in effect.',
        ar: 'نحن نحتفظ بالحق في إنهاء الحسابات لانتهاك هذه الشروط. يمكنك إنهاء حسابك في أي وقت. عند الإنهاء، ينتهي حقك في استخدام الخدمة فورًا، ولكن تظل هذه الشروط سارية المفعول.'
      }
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {isRTL ? 
                'شروط الخدمة' :
                'Terms of Service'
              }
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isRTL ? 
                'القواعد والشروط التي تحكم استخدامك لخدمة محفظة' :
                'The rules and conditions governing your use of Mahfza service'
              }
            </p>
            <p className="text-sm text-gray-500">
              {isRTL ? 
                'آخر تحديث: 15 يناير 2025' :
                'Last updated: January 15, 2025'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-12 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                {isRTL ? 
                  'يرجى قراءة شروط الخدمة هذه بعناية. باستخدام خدمة محفظة، فإنك تقر بأنك قد قرأت وفهمت وتوافق على الالتزام بهذه الشروط.' :
                  'Please read these terms of service carefully. By using Mahfza service, you acknowledge that you have read, understood, and agree to be bound by these terms.'
                }
              </p>
            </div>

            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index} className="mb-8 border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {section.title[isRTL ? 'ar' : 'en']}
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {section.content[isRTL ? 'ar' : 'en']}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Additional Terms */}
            <Card className="mt-12 border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isRTL ? 'شروط إضافية' : 'Additional Terms'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'الملكية الفكرية' : 'Intellectual Property'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {isRTL ? 
                        'تحتفظ محفظة بجميع الحقوق في الملكية الفكرية في الخدمة. لا يجوز لك نسخ أو تعديل أو توزيع الخدمة دون موافقتنا الكتابية.' :
                        'Mahfza retains all intellectual property rights in the service. You may not copy, modify, or distribute the service without our written consent.'
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'الخصوصية' : 'Privacy'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {isRTL ? 
                        'يخضع استخدامك للخدمة لسياسة الخصوصية الخاصة بنا. باستخدام الخدمة، فإنك توافق بذلك على جمع واستخدام بياناتك كما هو موضح في سياسة الخصوصية.' :
                        'Your use of the service is subject to our Privacy Policy. By using the service, you consent to the collection and use of your data as described in the Privacy Policy.'
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'القانون الواجب التطبيق' : 'Governing Law'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {isRTL ? 
                        'تخضع هذه الشروط وتفسر وفقًا لقوانين مصر. أي نزاع ينشأ عن هذه الشروط سيتم حله في محاكم مصر.' :
                        'These terms shall be governed by and construed in accordance with the laws of Egypt. Any dispute arising from these terms shall be resolved in the courts of Egypt.'
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {isRTL ? 
                        'إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى التواصل معنا:' :
                        'If you have any questions about these terms of service, please contact us:'
                      }
                    </p>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</strong> legal@mahfza.com</p>
                      <p><strong>{isRTL ? 'الهاتف:' : 'Phone:'}</strong> +20 123 456 789</p>
                      <p><strong>{isRTL ? 'العنوان:' : 'Address:'}</strong> {isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
                    </div>
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
              'هل أنت مستعد للبدء؟' :
              'Ready to Get Started?'
            }
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isRTL ? 
              'انضم إلى محفظة اليوم وابدأ في تتبع محفظتك بثقة' :
              'Join Mahfza today and start tracking your portfolio with confidence'
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