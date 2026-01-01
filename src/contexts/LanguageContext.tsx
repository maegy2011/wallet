'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  currentLanguage: 'en' | 'ar';
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isRTL, setIsRTL] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');

  // Check for saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as 'en' | 'ar' | null;
      
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setCurrentLanguage(savedLanguage);
        const shouldBeRTL = savedLanguage === 'ar';
        setIsRTL(shouldBeRTL);
        document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLanguage;
      } else {
        // Set default language if none saved
        localStorage.setItem('language', 'en');
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  const setLanguage = (lang: 'en' | 'ar') => {
    setCurrentLanguage(lang);
    const shouldBeRTL = lang === 'ar';
    setIsRTL(shouldBeRTL);
    
    if (typeof window !== 'undefined') {
      document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      localStorage.setItem('language', lang);
      
      // Dispatch custom event for language change
      window.dispatchEvent(new CustomEvent('languageChange', { 
        detail: { language: lang, isRTL: shouldBeRTL } 
      }));
    }
  };

  return (
    <LanguageContext.Provider value={{ isRTL, currentLanguage, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}