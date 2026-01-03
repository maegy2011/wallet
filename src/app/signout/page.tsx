'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { signOutAdmin, isAdminUser } from '@/lib/auth-utils';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you out...');
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    const performSignout = async () => {
      let isAdmin = false;
      
      try {
        // Determine user type BEFORE clearing auth
        isAdmin = isAdminUser();
        setUserType(isAdmin ? 'admin' : 'user');
        
        if (isAdmin) {
          // Admin signout - clear token and call API
          await signOutAdmin();
          setStatus('success');
          setMessage('You have been successfully signed out.');
          
          // Redirect to admin login after delay
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1500);
        } else {
          // User signout - use NextAuth
          setStatus('success');
          setMessage('You have been successfully signed out.');
          
          // Use NextAuth signOut with redirect to signin page
          setTimeout(() => {
            nextAuthSignOut({ callbackUrl: '/signin' });
          }, 1500);
        }
        
      } catch (error) {
        console.error('Signout error:', error);
        setStatus('error');
        setMessage('An error occurred during signout. Please try again.');
        
        // Still redirect after error - go to admin for admin users, signin for regular users
        setTimeout(() => {
          if (isAdmin) {
            window.location.href = '/admin';
          } else {
            router.push('/signin');
          }
        }, 3000);
      }
    };

    performSignout();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {status === 'loading' && (
                <LogOut className="w-8 h-8 text-white animate-pulse" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-8 h-8 text-white" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'loading' && 'Signing Out...'}
              {status === 'success' && 'Signed Out Successfully'}
              {status === 'error' && 'Signout Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{message}</p>
            
            {status === 'success' && (
              <p className="text-sm text-gray-500">
                Redirecting you {userType === 'admin' ? 'to admin login' : 'to sign in page'}...
              </p>
            )}
            
            {status === 'error' && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}