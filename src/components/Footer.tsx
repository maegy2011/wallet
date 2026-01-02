'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { isRTL, currentLanguage } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Mahfza | محفظة</span>
            </div>
            <p className="text-gray-400 mb-4">
              {isRTL ?
                'منصة بسيطة وآمنة للوسطاء لتتبع أرصدتهم ومعاملاتهم وأداء محافظهم يدويًا.' :
                'A simple, secure platform for brokers to manually track their balances, transactions, and portfolio performance.'
              }
            </p>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <span className="text-sm">in</span>
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <span className="text-sm">𝕏</span>
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <span className="text-sm">📷</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? 'المنتج' : 'Product'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  {isRTL ? 'المميزات' : 'Features'}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors font-medium" style={{ fontWeight: 600 }}>
                  {isRTL ? 'كيف يعمل' : 'How It Works'}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition-colors">
                  {isRTL ? 'الأسعار' : 'Pricing'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {isRTL ? 'من نحن' : 'About'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? 'الدعم' : 'Support'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  {isRTL ? 'المساعدة' : 'Help'}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {isRTL ? 'تواصل معنا' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? 'تواصل معنا' : 'Contact'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="mailto:support@mahfza.com" className="hover:text-white transition-colors">
                  support@mahfza.com
                </a>
              </li>
              <li>
                <a href="tel:+20123456789" className="hover:text-white transition-colors">
                  {isRTL ? '+20 123 456 789' : '+20 123 456 789'}
                </a>
              </li>
              <li className="mt-2 text-sm">
                {isRTL ? 'العملة: جنيه' : 'Currency: EGP'}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2025 Mahfza. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                {isRTL ? 'سياسة الخصوصية' : 'Privacy'}
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                {isRTL ? 'شروط الخدمة' : 'Terms'}
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                {isRTL ? 'تواصل معنا' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}