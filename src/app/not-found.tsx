'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          الصفحة غير موجودة
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          <br />
          يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Home className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          
          <Link href="/search">
            <Button variant="outline" className="flex items-center gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              <Search className="h-4 w-4" />
              البحث في الموقع
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            إذا كنت تعتقد أن هناك خطأ، يرجى 
            <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
              التواصل معنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}