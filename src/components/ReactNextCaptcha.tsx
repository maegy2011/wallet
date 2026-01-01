'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ReactNextCaptchaProps {
  onVerify: (success: boolean, captchaId?: string, captchaAnswer?: string) => void;
  theme?: 'light' | 'dark';
  lang?: string;
}

export function ReactNextCaptcha({ onVerify, theme = 'light', lang = 'en' }: ReactNextCaptchaProps) {
  const [captchaData, setCaptchaData] = useState<{ svg: string; hash: string; text: string } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [hasLoadError, setHasLoadError] = useState(false);

  const generateCaptcha = async () => {
    setIsLoading(true);
    setError('');
    setUserInput('');
    setIsVerified(false);
    onVerify(false);

    try {
      const response = await fetch('/api/admin/captcha');
      const result = await response.json();

      if (result.success && result.data) {
        setCaptchaData({
          svg: result.data.question, // This contains the SVG data
          hash: result.data.id,
          text: result.data.question, // Store SVG as text for comparison
        });
      } else {
        setHasLoadError(true);
        setError('Failed to generate captcha');
      }
    } catch (error) {
      console.error('Error generating captcha:', error);
      setHasLoadError(true);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCaptcha = async () => {
    if (!userInput.trim() || !captchaData) {
      setError('Please enter the captcha text');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: captchaData.hash,
          answer: userInput.trim(),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.valid) {
          setIsVerified(true);
          setError('');
          onVerify(true, captchaData.hash, userInput.trim());
        } else {
          setError('Incorrect captcha. Please try again.');
          setIsVerified(false);
          onVerify(false);
          // Generate new captcha after failed attempt
          setTimeout(() => generateCaptcha(), 1000);
        }
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying captcha:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    setError('');
    if (isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-sm font-medium ${textColor}`}>
          Security Verification
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateCaptcha}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Captcha Display */}
        <div className="flex justify-center bg-white p-4 rounded border border-gray-200 min-h-[60px] items-center">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-gray-500 text-sm">Loading captcha...</span>
            </div>
          ) : captchaData?.svg ? (
            <div
              dangerouslySetInnerHTML={{ __html: captchaData.svg }}
              className="flex items-center justify-center w-full"
            />
          ) : hasLoadError ? (
            <div className="text-red-500 text-sm">Failed to load captcha</div>
          ) : (
            <div className="text-gray-500 text-sm">Loading...</div>
          )}
        </div>

        {/* User Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter the text shown above"
            className="flex-1"
            disabled={isLoading || isVerified}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                verifyCaptcha();
              }
            }}
          />
          <Button
            type="button"
            onClick={verifyCaptcha}
            disabled={!userInput.trim() || isLoading || isVerified}
            size="sm"
            className="px-4"
          >
            {isLoading ? '...' : isVerified ? 'Verified' : 'Verify'}
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {isVerified && (
          <div className="text-green-500 text-sm flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Captcha verified successfully
          </div>
        )}
      </div>
    </div>
  );
}
