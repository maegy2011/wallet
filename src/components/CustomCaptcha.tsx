'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';

interface CustomCaptchaProps {
  onVerify: (success: boolean, token?: string) => void;
  theme?: 'light' | 'dark';
  lang?: string;
}

export function CustomCaptcha({ onVerify, theme = 'light', lang = 'en' }: CustomCaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateCaptchaSvg = (text: string): string => {
    const width = 200;
    const height = 60;
    const chars = text.split('');
    
    // Generate random colors and positions for each character
    const charElements = chars.map((char, index) => {
      const x = 20 + (index * 30) + Math.random() * 10;
      const y = 35 + Math.random() * 10;
      const rotation = (Math.random() - 0.5) * 30;
      const fontSize = 20 + Math.random() * 10;
      const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return `
        <text 
          x="${x}" 
          y="${y}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="${color}"
          transform="rotate(${rotation} ${x} ${y})"
          style="user-select: none;"
        >
          ${char}
        </text>
      `;
    }).join('');

    // Generate noise lines
    const noiseLines = Array.from({ length: 4 }, () => {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e5e7eb" stroke-width="1"/>`;
    }).join('');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: white; border: 1px solid #e5e7eb; border-radius: 4px;">
        ${noiseLines}
        ${charElements}
      </svg>
    `;
  };

  const generateCaptcha = () => {
    setIsLoading(true);
    setError('');
    setUserInput('');
    setIsVerified(false);
    
    try {
      const newText = generateRandomString(6);
      const newSvg = generateCaptchaSvg(newText);
      
      setCaptchaText(newText);
      setCaptchaSvg(newSvg);
    } catch (error) {
      console.error('Error generating captcha:', error);
      setError('Failed to generate captcha');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCaptcha = () => {
    if (!userInput.trim()) {
      setError('Please enter the captcha text');
      return;
    }

    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      setIsVerified(true);
      setError('');
      // Create a simple token for verification
      const token = btoa(`captcha_verified:${Date.now()}:${captchaText.slice(0, 5)}`);
      onVerify(true, token);
    } else {
      setError('Incorrect captcha text. Please try again.');
      setIsVerified(false);
      onVerify(false);
      // Generate new captcha after failed attempt
      setTimeout(() => generateCaptcha(), 1000);
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
          Security Check
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
        <div className="flex justify-center">
          {isLoading ? (
            <div className="text-gray-500 text-sm p-4">Loading...</div>
          ) : captchaSvg ? (
            <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          ) : (
            <div className="text-gray-500 text-sm p-4">Failed to load captcha</div>
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
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={verifyCaptcha}
            disabled={!userInput.trim() || isLoading || isVerified}
            size="sm"
            className="px-4"
          >
            {isLoading ? '...' : 'Verify'}
          </Button>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {isVerified && (
          <div className="text-green-500 text-sm flex items-center gap-1">
            ✓ Verified
          </div>
        )}
      </div>
    </div>
  );
}