'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Check, X, BookOpen, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { CustomCaptcha } from '@/components/CustomCaptcha';
import { LoadingButton } from '@/components/ui/loading';
import { FormValidator, useValidation } from '@/lib/validation';
import { apiClient } from '@/lib/apiClient';
import { errorHandler } from '@/lib/errorHandler';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SigninPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const { values, errors, handleChange, handleBlur, validateForm, resetForm } = useValidation(
    { email: '', password: '' },
    {
      email: FormValidator.rules.email,
      password: {
        required: true,
        minLength: 6,
        maxLength: 128
      }
    }
  );

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

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Validate captcha
    if (!captchaToken) {
      setGeneralError('Please complete the CAPTCHA verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signIn('credentials', {
        email: values.email,
        password: values.password,
        captchaToken: captchaToken,
        isSignup: false,
        redirect: false,
      });

      if (response?.error) {
        // Handle specific error types
        if (response.error.includes('Invalid credentials')) {
          setGeneralError('Invalid email or password');
        } else if (response.error.includes('CAPTCHA')) {
          setGeneralError('CAPTCHA verification failed. Please try again.');
        } else if (response.error.includes('Too many attempts')) {
          setGeneralError('Too many login attempts. Please try again later.');
        } else {
          setGeneralError('Login failed. Please try again.');
        }
        
        // Log error
        errorHandler.authenticationError(response.error, {
          email: values.email,
          timestamp: new Date().toISOString()
        });
        
        // Reset captcha on error
        setCaptchaToken('');
      } else if (response?.ok) {
        // Successful login
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('An unexpected error occurred. Please try again.');
      
      // Log unexpected error
      errorHandler.serverError('Unexpected login error', {
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

  const handleForgotPassword = async () => {
    if (!values.email) {
      setGeneralError('Please enter your email address first');
      return;
    }

    try {
      // Call password reset API
      const result = await apiClient.post('/auth/forgot-password', {
        email: values.email
      });

      if (result.success) {
        setGeneralError('Password reset instructions have been sent to your email.');
      } else {
        setGeneralError(result.error?.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      setGeneralError('Failed to send reset instructions. Please try again.');
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
              Sign In to Mahfza
            </CardTitle>
            <p className="text-gray-600">
              Welcome back
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error Alert */}
              {generalError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {generalError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
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

              {/* Password Field */}
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
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
                disabled={isSubmitting || !captchaToken}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </LoadingButton>

              {/* Additional Actions */}
              <div className="space-y-2 text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:text-blue-700 text-sm w-full"
                  disabled={isSubmitting}
                >
                  Forgot Password?
                </button>
                
                <Link href="/signup" className="block">
                  <Button variant="ghost" className="w-full">
                    Don't have an account? Sign Up
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