'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, Wallet, Phone, Mail, User, LogOut, BarChart3 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'المميزات', href: '#features' },
    { name: 'الأسعار', href: '#pricing' },
    { name: 'اتصل بنا', href: '#contact' },
  ]

  const authenticatedNavigation = [
    { name: 'التقارير', href: '/summary', icon: BarChart3 },
    { name: 'تسجيل الخروج', href: '#', icon: LogOut, isLogout: true },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <Wallet className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">محفظة ذكية</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && authenticatedNavigation.map((item) => (
              item.isLogout ? (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1"
                  title={item.name}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium flex items-center gap-1"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    <User className="h-4 w-4 ml-2" />
                    الملف الشخصي
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    ابدأ مجاناً
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <div className="flex flex-col space-y-4 mt-8">
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-emerald-600 transition-colors font-medium text-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAuthenticated && authenticatedNavigation.map((item) => (
                      item.isLogout ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="text-red-600 hover:text-red-700 transition-colors font-medium text-lg flex items-center gap-2"
                          title={item.name}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium text-lg flex items-center gap-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </nav>
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                            <User className="h-4 w-4 ml-2" />
                            الملف الشخصي
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="w-full border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 ml-2" />
                          تسجيل الخروج
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                            تسجيل الدخول
                          </Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            ابدأ مجاناً
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}