'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Globe, ArrowRight, Shield, Eye, Database, Lock, UserCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPage() {
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
      icon: Shield,
      title: { en: 'Introduction', ar: 'مقدمة' },
      content: {
        en: 'Mahfza respects your privacy and is committed to protecting your data. This Privacy Policy explains how we collect, use, and protect your information when you use our portfolio tracking service.',
        ar: 'تحترم محفظة خصوصيتك وتلتزم بحماية بياناتك. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك عند استخدامك لخدمة تتبع المحفظة.'
      }
    },
    {
      icon: Database,
      title: { en: 'Data Collection', ar: 'جمع البيانات' },
      content: {
        en: 'We collect data you provide to us directly, such as your name, email address, and financial information you manually input including balances, transactions, and portfolio details. We also collect usage data to improve our service.',
        ar: 'نجمع البيانات التي تقدمها لنا مباشرة، مثل اسمك وعنوان البريد الإلكتروني والمعلومات المالية التي تدخلها يدويًا بما في ذلك الأرصدة والمعاملات وتفاصيل المحفظة. نجمع أيضًا بيانات الاستخدام لتحسين خدمتنا.'
      }
    },
    {
      icon: Eye,
      title: { en: 'Data Usage', ar: 'استخدام البيانات' },
      content: {
        en: 'Your data is used to provide and improve our services, including portfolio tracking, generating reports, and enhancing user experience. We analyze usage patterns to optimize our platform and develop new features.',
        ar: 'يتم استخدام بياناتك لتقديم وتحسين خدماتنا، بما في ذلك تتبع المحفظة وإنشاء تقارير وتحسين تجربة المستخدم. نحلل أنماط الاستخدام لتحسين منصتنا وتطوير ميزات جديدة.'
      }
    },
    {
      icon: Lock,
      title: { en: 'Data Security', ar: 'أمان البيانات' },
      content: {
        en: 'Your data is encrypted and stored securely using industry-standard security measures. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, or disclosure.',
        ar: 'يتم تشفير بياناتك وتخزينها بأمان باستخدام إجراءات أمان معيارية في الصناعة. ننفذ تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك ضد الوصول أو التغيير أو الكشف غير المصرح به.'
      }
    },
    {
      icon: UserCheck,
      title: { en: 'Your Rights', ar: 'حقوقك' },
      content: {
        en: 'You have the right to access, update, or delete your data at any time. You can also request a copy of your data or object to certain processing activities. Contact us if you want to exercise these rights.',
        ar: 'لديك الحق في الوصول إلى بياناتك أو تحديثها أو حذفها في أي وقت. يمكنك أيضًا طلب نسخة من بياناتك أو الاعتراض على أنشطة معالجة معينة. تواصل معنا إذا كنت تريد ممارسة هذه الحقوق.'
      }
    },
    {
      icon: AlertCircle,
      title: { en: 'Third Parties', ar: 'الأطراف الثالثة' },
      content: {
        en: 'We do not sell, rent, or share your personal data with third parties for marketing purposes. We only share data with service providers who assist us in operating our service, subject to strict confidentiality obligations.',
        ar: 'نحن لا نبيع أو نؤجر أو نشارك بياناتك الشخصية مع أطراف ثالثة لأغراض التسويق. نشارك البيانات فقط مع مقدمي الخدمات الذين يساعدوننا في تشغيل خدمتنا، الخاضعة لالتزامات سرية صارمة.'
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
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {isRTL ? 
                'سياسة الخصوصية' :
                'Privacy Policy'
              }
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isRTL ? 
                'التزامنا بحماية خصوصيتك وأمان بياناتك' :
                'Our commitment to protecting your privacy and data security'
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

      {/* Privacy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                {isRTL ? 
                  'في محفظة، نأخذ خصوصيتك على محمل الجد. هذه السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتك. باستخدام خدمتنا، فإنك توافق على الممارسات الموصوفة في هذه السياسة.' :
                  'At Mahfza, we take your privacy seriously. This policy explains how we collect, use, and protect your information. By using our service, you agree to the practices described in this policy.'
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

            {/* Additional Information */}
            <Card className="mt-12 border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isRTL ? 'معلومات إضافية' : 'Additional Information'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'تغييرات على هذه السياسة' : 'Changes to This Policy'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {isRTL ? 
                        'قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنلزمك بأي تغييرات عن طريق نشر السياسة المحدثة على موقعنا وتحديث تاريخ "آخر تحديث".' :
                        'We may update this privacy policy from time to time. We will notify you of any changes by posting the updated policy on our website and updating the "Last updated" date.'
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'احتفاظ البيانات' : 'Data Retention'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {isRTL ? 
                        'نحتفظ ببياناتك فقط طالما كان ذلك ضروريًا لتقديم خدماتنا والامتثال للالتزامات القانونية. يمكنك حذف حسابك وبياناتك في أي وقت من إعدادات حسابك.' :
                        'We retain your data only as long as necessary to provide our services and comply with legal obligations. You can delete your account and data at any time from your account settings.'
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {isRTL ? 
                        'إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى التواصل معنا:' :
                        'If you have any questions or concerns about this privacy policy or our data practices, please contact us:'
                      }
                    </p>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</strong> privacy@mahfza.com</p>
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
              'بياناتك آمنة معنا' :
              'Your Data is Safe with Us'
            }
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isRTL ? 
              'انضم إلى آلاف المستخدمين الذين يثقون في محفظة لحماية بياناتهم المالية' :
              'Join thousands of users who trust Mahfza to protect their financial data'
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