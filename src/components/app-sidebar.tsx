'use client'

import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Wallet, BarChart3, Settings, Home, Store, PiggyBank, CreditCard, FileText, Users, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  const navigationItems = isAuthenticated ? [
    {
      title: "الرئيسية",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "المحافظ",
      href: "/",
      icon: Wallet,
    },
    {
      title: "المعاملات",
      href: "/",
      icon: CreditCard,
    },
    {
      title: "المصروفات",
      href: "/expenses",
      icon: FileText,
    },
    {
      title: "الخزينة",
      href: "/cash-treasury",
      icon: PiggyBank,
    },
    {
      title: "التقارير",
      href: "/summary",
      icon: BarChart3,
    },
    {
      title: "الفروع",
      href: "/branches",
      icon: Store,
    },
    {
      title: "المستخدمون",
      href: "/users",
      icon: Users,
    },
    {
      title: "الإعدادات",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "الملف الشخصي",
      href: "/profile",
      icon: User,
    },
  ] : [
    {
      title: "تسجيل الدخول",
      href: "/auth/login",
      icon: LogIn,
    }
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center gap-2 p-4" style={{ direction: 'rtl' }}>
          <Wallet className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">محافظي</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-gray-50 to-white">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800 transition-all duration-200 rounded-lg mx-2 my-1"
              >
                {item.title === "تسجيل الخروج" ? (
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium" style={{ direction: 'rtl' }}>{item.title}</span>
                  </button>
                ) : (
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium" style={{ direction: 'rtl' }}>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {isAuthenticated && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-700 focus:bg-red-100 focus:text-red-800 transition-all duration-200 rounded-lg mx-2 my-1 text-red-600"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium" style={{ direction: 'rtl' }}>تسجيل الخروج</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}