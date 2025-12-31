'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Plus, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const { data: session } = useSession();
  const [isRTL, setIsRTL] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!session?.user) {
      router.push('/signin');
      return;
    }
  }, [session, router]);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const handleAddWallet = () => {
    // Redirect to dashboard (where wallet addition would happen)
    router.push('/dashboard');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {isRTL ? 'EN' : 'العربية'}
      </button>

      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {isRTL ? 'مرحبًا بك في محفظة!' : 'Welcome to Mahfza!'}
            </CardTitle>
            
            <p className="text-gray-600">
              {isRTL ? 
                `Hi ${session?.user?.name || 'User'}! You're all set. Let's add your first wallet.` :
                `Hi ${session?.user?.name || 'User'}! You're all set. Let's add your first wallet.`
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {isRTL ? 'ما التالي؟' : 'What\'s Next?'}
              </h3>
              <ul className={`text-sm text-blue-800 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  {isRTL ? 'أضف محافظ الوساطة الخاصة بك' : 'Add your brokerage wallets'}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  {isRTL ? 'سجل معاملاتك الأولى' : 'Log your first transactions'}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  {isRTL ? 'شاهد أداء محفظتك' : 'Track your portfolio performance'}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddWallet}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isRTL ? 'Add Wallet Now' : 'Add Wallet Now'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  {isRTL ? 'Go to Dashboard' : 'Go to Dashboard'}
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isRTL ? 
                  'تحتاج مساعدة؟ تحقق من دليلنا.' :
                  'Need help? Check out our guide.'
                }
              </p>
              <Link 
                href="/help" 
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {isRTL ? 'دليل المستخدم' : 'User Guide'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">
              {isRTL ? 'محافظ' : 'Wallets'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">
              {isRTL ? 'معاملات' : 'Transactions'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0%</div>
            <div className="text-sm text-gray-600">
              {isRTL ? 'نمو' : 'Growth'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}