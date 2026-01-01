'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

export default function TestDropdownPage() {
  const { isRTL, currentLanguage, toggleLanguage, setLanguage } = useLanguage();
  const [selectedOption, setSelectedOption] = useState('option1');
  const [dropdownSelection, setDropdownSelection] = useState('item1');

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const selectOptions = [
    { value: 'option1', label: currentLanguage === 'ar' ? 'الخيار الأول' : 'First Option' },
    { value: 'option2', label: currentLanguage === 'ar' ? 'الخيار الثاني' : 'Second Option' },
    { value: 'option3', label: currentLanguage === 'ar' ? 'الخيار الثالث' : 'Third Option' }
  ];

  const dropdownItems = [
    { value: 'item1', label: currentLanguage === 'ar' ? 'العنصر الأول' : 'First Item' },
    { value: 'item2', label: currentLanguage === 'ar' ? 'العنصر الثاني' : 'Second Item' },
    { value: 'item3', label: currentLanguage === 'ar' ? 'العنصر الثالث' : 'Third Item' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          {currentLanguage === 'ar' ? 'اختبار القائمة المنسدلة' : 'Dropdown Test Page'}
        </h1>

        {/* Language Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'محدد اللغة' : 'Language Selector'}
          </h2>
          <Select value={currentLanguage} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Regular Select Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'قائمة منسدلة عادية' : 'Regular Select Dropdown'}
          </h2>
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر خياراً' : 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-sm text-gray-600">
            {currentLanguage === 'ar' ? 'الخيار المحدد:' : 'Selected:'} {selectedOption}
          </p>
        </div>

        {/* Dropdown Menu Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'قائمة منسدلة للقائمة' : 'Dropdown Menu'}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-64 justify-between">
                {dropdownItems.find(item => item.value === dropdownSelection)?.label || 
                 (currentLanguage === 'ar' ? 'اختر عنصراً' : 'Select an item')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {dropdownItems.map((item) => (
                <DropdownMenuItem 
                  key={item.value} 
                  onClick={() => setDropdownSelection(item.value)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="mt-2 text-sm text-gray-600">
            {currentLanguage === 'ar' ? 'العنصر المحدد:' : 'Selected:'} {dropdownSelection}
          </p>
        </div>

        {/* Language Toggle Button */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'تبديل اللغة' : 'Language Toggle'}
          </h2>
          <Button onClick={toggleLanguage} className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {currentLanguage === 'ar' ? 'EN' : 'العربية'}
          </Button>
        </div>

        {/* Current State Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'الحالة الحالية' : 'Current State'}
          </h2>
          <div className="space-y-2">
            <p><strong>{currentLanguage === 'ar' ? 'اللغة:' : 'Language:'}</strong> {currentLanguage}</p>
            <p><strong>{currentLanguage === 'ar' ? 'الاتجاه:' : 'Direction:'}</strong> {isRTL ? 'RTL' : 'LTR'}</p>
            <p><strong>{currentLanguage === 'ar' ? 'الخيار المحدد (Select):' : 'Selected Option (Select):'}</strong> {selectedOption}</p>
            <p><strong>{currentLanguage === 'ar' ? 'العنصر المحدد (Dropdown):' : 'Selected Item (Dropdown):'}</strong> {dropdownSelection}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {currentLanguage === 'ar' ? 'التعليمات' : 'Instructions'}
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>{currentLanguage === 'ar' ? 'استخدم قائمة اللغة لتبديل اللغة' : 'Use the language selector to switch languages'}</li>
            <li>{currentLanguage === 'ar' ? 'لاحظ كيف يتغير اتجاه النص في القوائم المنسدلة' : 'Notice how the text direction changes in dropdowns'}</li>
            <li>{currentLanguage === 'ar' ? 'سيتم حفظ لغتك المختارة' : 'Your language selection will be saved'}</li>
            <li>{currentLanguage === 'ar' ? 'تعمل جميع القوائم المنسدلة مع كلا اللغتين' : 'All dropdowns work with both languages'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}