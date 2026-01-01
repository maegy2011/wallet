'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Eye, EyeOff, Check, X, BookOpen, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CustomCaptcha } from '@/components/CustomCaptcha';

export default function SignupPage() {
  const [isRTL, setIsRTL] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const router = useRouter();

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium';
    return 'strong';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = isRTL ? 'الاسم الكامل مطلوب' : 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'تأكيد كلمة المرور مطلوب' : 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    if (!captchaToken) {
      newErrors.captcha = isRTL ? 'يرجى إكمال التحقق من CAPTCHA' : 'Please complete the CAPTCHA verification';
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
        name: formData.fullName,
        captchaToken: captchaToken,
        isSignup: true,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: result.error });
      } else if (result?.ok) {
        // Redirect to onboarding after successful signup
        router.push('/onboarding');
      }
    } catch (error) {
      setErrors({ general: isRTL ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Signup failed. Please try again.' });
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

  const handleCaptchaChange = (success: boolean, token?: string) => {
    if (success && token) {
      setCaptchaToken(token);
      if (captchaError) {
        setCaptchaError('');
      }
      if (errors.captcha) {
        setErrors(prev => ({ ...prev, captcha: '' }));
      }
    } else {
      setCaptchaToken('');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = {
    weak: 'text-red-500',
    medium: 'text-yellow-500', 
    strong: 'text-green-500'
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
            {isRTL ? 'إنشاء حساب محفظة' : 'Create Mahfza Account'}
          </CardTitle>
          <p className="text-gray-600">
            {isRTL ? 'ابدأ في تتبع محفظتك اليوم' : 'Start tracking your portfolio today'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">
                {isRTL ? 'الاسم الكامل' : 'Full Name'}
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`mt-1 ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

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
              {formData.password && (
                <p className={`text-sm mt-1 ${strengthColors[passwordStrength]}`}>
                  {isRTL ? 
                    `Password strength: ${passwordStrength}` :
                    `Password strength: ${passwordStrength}`
                  }
                </p>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`mt-1 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'أكد كلمة المرور' : 'Confirm password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* CAPTCHA */}
            <div>
              <Label>
                {isRTL ? 'رمز التحقق' : 'Security Verification'}
              </Label>
              <div className="mt-2">
                <CustomCaptcha
                  onVerify={handleCaptchaChange}
                  theme="light"
                  lang="en"
                />
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
                (isRTL ? 'Creating...' : 'Creating...') : 
                (isRTL ? 'Create Account' : 'Create Account')
              }
            </Button>

            <div className="text-center">
              <Link 
                href="/signin" 
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {isRTL ? 'Already have an account? Sign In' : 'Already have an account? Sign In'}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}