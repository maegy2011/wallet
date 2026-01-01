'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, User, LogOut, Menu, X, Shield, Settings, Users, BarChart3, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (has admin token)
  useEffect(() => {
    const checkAdminStatus = () => {
      if (typeof window !== 'undefined') {
        const adminToken = localStorage.getItem('adminToken');
        setIsAdmin(!!adminToken);
      }
    };

    checkAdminStatus();
    
    // Listen for storage changes (in case admin logs in/out in another tab)
    const handleStorageChange = () => {
      checkAdminStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle admin logout
  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      router.push('/admin');
    }
  };

  // Helper function to get accurate header offset
  const getHeaderOffset = () => {
    if (typeof window === 'undefined') return 84; // Default fallback
    
    const header = document.querySelector('nav');
    if (!header) return 84; // Default fallback
    
    const headerHeight = header.offsetHeight;
    const extraPadding = window.innerWidth < 768 ? 30 : 20; // More padding on mobile
    return headerHeight + extraPadding;
  };

  const scrollToSection = (sectionId: string) => {
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      // Small delay to ensure menu closes before scrolling
      setTimeout(() => {
        performScroll(sectionId);
      }, 150);
    } else {
      performScroll(sectionId);
    }
  };

  const performScroll = (sectionId: string) => {
    // Check if we're on admin page and the section is an admin section
    const adminSections = ['dashboard', 'customers', 'packages', 'settings'];
    const isAdminSection = adminSections.includes(sectionId);
    
    if (isAdminSection && pathname !== '/admin') {
      // Navigate to admin page with hash
      router.push(`/admin#${sectionId}`);
    } else if (pathname === '/admin' && isAdminSection) {
      // We're on admin page, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = getHeaderOffset();
        const elementPosition = element.offsetTop - headerOffset;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    } else if (pathname !== '/') {
      // If not on home page, navigate to home first, then scroll
      router.push(`/#${sectionId}`);
    } else {
      // If on home page, just scroll to section with smooth behavior
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = getHeaderOffset();
        const elementPosition = element.offsetTop - headerOffset;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Enhanced smooth scroll for any anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    scrollToSection(targetId);
  };

  // Handle hash scrolling on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.replace('#', '');
        
        // Check if this is an admin section or home page section
        const adminSections = ['dashboard', 'customers', 'packages', 'settings'];
        const isAdminSection = adminSections.includes(sectionId);
        
        if ((pathname === '/' && !isAdminSection) || (pathname === '/admin' && isAdminSection)) {
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              const headerOffset = getHeaderOffset();
              const elementPosition = element.offsetTop - headerOffset;
              
              window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
              });
            }
          }, 300); // Increased delay to ensure DOM is fully loaded
        }
      }
    }
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Mahfza | محفظة</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Testimonials
            </button>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            
            {/* Admin Menu Items */}
            {isAdmin && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <Link 
                  href="/admin#dashboard" 
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  onClick={(e) => handleSmoothScroll(e, 'dashboard')}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
                <Link 
                  href="/admin#dashboard" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'dashboard')}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/admin#customers" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'customers')}
                >
                  <Users className="w-4 h-4" />
                  Customers
                </Link>
                <Link 
                  href="/admin#packages" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'packages')}
                >
                  <Package className="w-4 h-4" />
                  Packages
                </Link>
                <Link 
                  href="/admin#settings" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'settings')}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </>
            )}
            
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Admin User
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Admin Logout
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/signup')}
              >
                Start free trial
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <button 
                onClick={() => scrollToSection('features')}
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 text-left w-full border-b border-gray-100"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 text-left w-full border-b border-gray-100"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 text-left w-full border-b border-gray-100"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 text-left w-full border-b border-gray-100"
              >
                Testimonials
              </button>
              <Link 
                href="/about" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/faq" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/help" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help
              </Link>
              <Link 
                href="/privacy" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="block text-gray-600 hover:text-gray-900 transition-colors py-3 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Terms of Service
              </Link>
            
            {/* Admin Menu Items - Mobile */}
            {isAdmin && (
              <>
                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Admin Panel
                  </div>
                  <button
                    onClick={() => {
                      if (pathname === '/admin') {
                        scrollToSection('dashboard');
                      } else {
                        router.push('/admin#dashboard');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors py-3 font-medium w-full text-left border-b border-gray-100"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      if (pathname === '/admin') {
                        scrollToSection('dashboard');
                      } else {
                        router.push('/admin#dashboard');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-3 w-full text-left border-b border-gray-100"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard Overview
                  </button>
                  <button
                    onClick={() => {
                      if (pathname === '/admin') {
                        scrollToSection('customers');
                      } else {
                        router.push('/admin#customers');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-3 w-full text-left border-b border-gray-100"
                  >
                    <Users className="w-4 h-4" />
                    Customer Management
                  </button>
                  <button
                    onClick={() => {
                      if (pathname === '/admin') {
                        scrollToSection('packages');
                      } else {
                        router.push('/admin#packages');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-3 w-full text-left border-b border-gray-100"
                  >
                    <Package className="w-4 h-4" />
                    Package Management
                  </button>
                  <button
                    onClick={() => {
                      if (pathname === '/admin') {
                        scrollToSection('settings');
                      } else {
                        router.push('/admin#settings');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-3 w-full text-left border-b border-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Settings
                  </button>
                </div>
              </>
            )}
            
            <div className="border-t pt-4">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : isAdmin ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Admin User
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAdminLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Admin Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  onClick={() => {
                    router.push('/signup');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Start free trial
                </Button>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </nav>
  );
}