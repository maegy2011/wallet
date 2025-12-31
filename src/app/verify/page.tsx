'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Check, X, Shield, BookOpen, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadCaptchaEnginge, validateCaptcha, LoadCanvasTemplate } from 'react-simple-captcha';

export default function VerifyPage() {
  const [isRTL, setIsRTL] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaText, setCaptchaText] = useState('');
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
    // Generate initial CAPTCHA
    generateCaptcha();
  }, [router]);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const generateCaptcha = () => {
    const captcha = loadCaptchaEnginge(6, 'white', 'black', 'upper');
    setCaptchaText(captcha);
    setCaptchaValue('');
    setError('');
  };

  const handleVerify = () => {
    if (!captchaValue || !validateCaptcha(captchaValue, false)) {
      setError(isRTL ? 'فشل التحقق. يرجى المحاولة مرة أخرى.' : 'Verification failed. Please try again.');
      generateCaptcha(); // Reload CAPTCHA on failure
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

  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    if (error) {
      setError('');
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
              {isRTL ? 'رمز التحقق' : 'CAPTCHA Verification'}
            </Label>
            <div className="mt-4">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <LoadCanvasTemplate 
                  reloadText={isRTL ? 'تحديث' : 'Reload Captcha'}
                  reloadColor="blue"
                />
              </div>
              <Input
                type="text"
                value={captchaValue}
                onChange={(e) => handleCaptchaChange(e.target.value)}
                placeholder={isRTL ? 'أدخل الرمز' : 'Enter the code'}
                className="mt-2 w-full"
              />
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isRTL ? 'تحديث الرمز' : 'Reload Code'}
              </button>
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
            disabled={isLoading || !captchaValue}
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