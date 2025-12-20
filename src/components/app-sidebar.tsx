'use client'

import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Wallet, BarChart3, Settings, Home, Store, PiggyBank, CreditCard, FileText, Users } from "lucide-react";
import Link from "next/link";

const navigationItems = [
  {
    title: "الرئيسية",
    href: "/",
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
];

export function AppSidebar() {
  const pathname = usePathname();

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
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium" style={{ direction: 'rtl' }}>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}