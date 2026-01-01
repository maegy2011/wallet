'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Check, X, Shield, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomCaptcha } from '@/components/CustomCaptcha';

export default function VerifyPage() {
  const [isRTL, setIsRTL] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user came from signup
    const userData = localStorage.getItem('mahfza_user');
    if (!userData) {
      router.push('/signup');
      return;
    }
  }, [router]);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const handleVerify = () => {
    if (!captchaToken) {
      setError(isRTL ? 'يرجى إكمال التحقق من CAPTCHA' : 'Please complete the CAPTCHA verification');
      return;
    }

    setIsLoading(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsLoading(false);
      // Mark user as verified and redirect to onboarding
      const userData = JSON.parse(localStorage.getItem('mahfza_user') || '{}');
      localStorage.setItem('mahfza_user', JSON.stringify({
        ...userData,
        verified: true
      }));
      router.push('/onboarding');
    }, 1500);
  };

  const handleCaptchaChange = (success: boolean, token?: string) => {
    if (success && token) {
      setCaptchaToken(token);
      if (error) {
        setError('');
      }
    } else {
      setCaptchaToken('');
    }
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

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRTL ? 'تحقق من حسابك' : 'Verify Your Account'}
          </CardTitle>
          <p className="text-gray-600">
            {isRTL ? 'يرجى إكمال التحقق لتأكيد أنك لست روبوتًا.' : 'Please complete the CAPTCHA to verify you\'re not a robot.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* CAPTCHA */}
          <div>
            <Label className="text-base font-medium">
              {isRTL ? 'رمز التحقق' : 'Security Verification'}
            </Label>
            <div className="mt-4">
              <CustomCaptcha
                onVerify={handleCaptchaChange}
                theme="light"
                lang="en"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || !captchaToken}
          >
            {isLoading ? 
              (isRTL ? 'جاري التحقق...' : 'Verifying...') : 
              (isRTL ? 'تحقق ومتابعة' : 'Verify & Continue')
            }
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.push('/signup')}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {isRTL ? 'العودة إلى التسجيل' : 'Back to signup'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}