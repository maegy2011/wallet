'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Eye, EyeOff, Check, X, BookOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { loadCaptchaEnginge, validateCaptcha, LoadCanvasTemplate } from 'react-simple-captcha';

export default function SigninPage() {
  const { data: session } = useSession();
  const [isRTL, setIsRTL] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (session?.user) {
      if (session.user.onboarded) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [session, router]);

  useEffect(() => {
    // Generate initial CAPTCHA
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const captcha = loadCaptchaEnginge(6, 'white', 'black', 'upper');
    setCaptchaText(captcha);
    setCaptchaValue('');
    setCaptchaError('');
  };

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    }

    if (!captchaValue || !validateCaptcha(captchaValue, false)) {
      newErrors.captcha = isRTL ? 'رمز التحقق غير صحيح' : 'Invalid CAPTCHA code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        isSignup: false,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: result.error });
      } else if (result?.ok) {
        // Let the session hook handle the redirect
        router.refresh();
      }
    } catch (error) {
      setErrors({ general: isRTL ? 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.' : 'Sign in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    if (captchaError) {
      setCaptchaError('');
    }
    if (errors.captcha) {
      setErrors(prev => ({ ...prev, captcha: '' }));
    }
  };

  const handleForgotPassword = () => {
    // Placeholder for future feature
    alert(isRTL ? 'Feature coming soon' : 'Feature coming soon');
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
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRTL ? 'تسجيل الدخول إلى محفظة' : 'Sign In to Mahfza'}
          </CardTitle>
          <p className="text-gray-600">
            {isRTL ? 'مرحبًا بعودتك' : 'Welcome back'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`mt-1 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* CAPTCHA */}
            <div>
              <Label>
                {isRTL ? 'رمز التحقق' : 'CAPTCHA Verification'}
              </Label>
              <div className="mt-2">
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
              {errors.captcha && (
                <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>
              )}
            </div>

            {errors.general && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 
                (isRTL ? 'Signing in...' : 'Signing in...') : 
                (isRTL ? 'Sign In' : 'Sign In')
              }
            </Button>

            <div className="space-y-2 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-700 text-sm w-full"
              >
                {isRTL ? 'Forgot Password?' : 'Forgot Password?'}
              </button>
              
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-700 text-sm block"
              >
                {isRTL ? "Don't have an account? Sign Up" : "Don't have an account? Sign Up"}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}