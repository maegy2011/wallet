'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Check, X, BookOpen, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CustomCaptcha } from '@/components/CustomCaptcha';
import { LoadingButton } from '@/components/ui/loading';
import { FormValidator, useValidation } from '@/lib/validation';
import { apiClient } from '@/lib/apiClient';
import { errorHandler } from '@/lib/errorHandler';
import { useNotifications } from '@/lib/notifications';
import { useNetworkStatus, useRetry } from '@/hooks/useNetworkStatus';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const { retry } = useRetry();
  const { success, error, handleValidationError, handleNetworkError } = useNotifications();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Form validation
  const { values, errors, handleChange, handleBlur, validateForm, resetForm } = useValidation(
    { fullName: '', email: '', password: '', confirmPassword: '' },
    {
      fullName: FormValidator.rules.name,
      email: FormValidator.rules.email,
      password: FormValidator.rules.password,
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (value !== values.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      }
    }
  );

  // Check password strength
  useEffect(() => {
    if (values.password) {
      if (values.password.length < 6) {
        setPasswordStrength('weak');
      } else if (values.password.length < 10 || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('strong');
      }
    }
  }, [values.password]);

  const handleCaptchaChange = (success: boolean, token?: string) => {
    if (success && token) {
      setCaptchaToken(token);
      setGeneralError('');
    } else {
      setCaptchaToken('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Check network status
    if (!isOnline) {
      handleNetworkError(new Error('No internet connection'), () => handleSubmit(e));
      return;
    }

    // Validate form
    if (!validateForm()) {
      handleValidationError(errors);
      return;
    }

    // Validate captcha
    if (!captchaToken) {
      setGeneralError('Please complete the CAPTCHA verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await retry(async () => {
        return await signIn('credentials', {
          email: values.email,
          password: values.password,
          name: values.fullName,
          captchaToken: captchaToken,
          isSignup: true,
          redirect: false,
        });
      });

      if (result?.error) {
        // Handle specific error types
        if (result.error.includes('Email already exists')) {
          setGeneralError('An account with this email already exists');
        } else if (result.error.includes('Invalid email')) {
          setGeneralError('Please enter a valid email address');
        } else if (result.error.includes('Password too weak')) {
          setGeneralError('Password does not meet security requirements');
        } else if (result.error.includes('CAPTCHA')) {
          setGeneralError('CAPTCHA verification failed. Please try again.');
        } else {
          setGeneralError('Registration failed. Please try again.');
        }
        
        // Log error
        errorHandler.serverError(result.error, {
          email: values.email,
          timestamp: new Date().toISOString()
        });
        
        // Reset captcha on error
        setCaptchaToken('');
      } else if (result?.ok) {
        // Successful registration
        success('Account created successfully! Redirecting to onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError('An unexpected error occurred. Please try again.');
      
      // Log unexpected error
      errorHandler.serverError('Unexpected registration error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: values.email,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    handleChange(field, value);
    if (generalError) {
      setGeneralError('');
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Mahfza Account
            </CardTitle>
            <p className="text-gray-600">
              Start tracking your portfolio today
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Network Status */}
              {!isOnline && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You are currently offline. Please check your internet connection.
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error Alert */}
              {generalError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {generalError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={values.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`mt-1 ${errors.fullName ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`mt-1 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {values.password && (
                  <p className={`text-sm mt-1 ${getStrengthColor()}`}>
                    Password strength: {passwordStrength}
                  </p>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`mt-1 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
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
                <Label>Security Verification</Label>
                <div className="mt-2">
                  <CustomCaptcha
                    onVerify={handleCaptchaChange}
                    theme="light"
                    lang="en"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || !captchaToken || !isOnline}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </LoadingButton>

              {/* Sign In Link */}
              <div className="text-center">
                <Link href="/signin">
                  <Button variant="ghost" className="w-full">
                    Already have an account? Sign In
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}