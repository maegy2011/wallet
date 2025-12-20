'use client'

import Link from 'next/link'
import { Wallet, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import ProtectedEmail from '@/components/protected-email'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Wallet className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold">محفظة ذكية</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              نظام متكامل لإدارة المحافظ الإلكترونية والمعاملات المالية للشركات والمؤسسات التجارية.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  المميزات
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  الأسعار
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  تسجيل جديد
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">الخدمات</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">إدارة المحافظ</span>
              </li>
              <li>
                <span className="text-gray-300">تتبع المعاملات</span>
              </li>
              <li>
                <span className="text-gray-300">إدارة الفروع</span>
              </li>
              <li>
                <span className="text-gray-300">تقارير مالية</span>
              </li>
              <li>
                <span className="text-gray-300">خزينة نقدية</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-300" dir="ltr">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <ProtectedEmail 
                  email="info@smartwallet.com"
                  className="text-gray-300 flex items-center gap-3"
                />
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-300">القاهرة، مصر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 محفظة ذكية. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                سياسة الخصوصية
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}