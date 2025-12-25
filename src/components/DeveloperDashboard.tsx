'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, Users, Building2, Briefcase, Database, 
  TrendingUp, TrendingDown, Shield, Settings, RefreshCw,
  Trash2, AlertTriangle, CheckCircle2, XCircle, Wallet,
  ArrowUpRight, ArrowDownRight, Server, Clock, Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SystemStats {
  system: {
    name: string
    version: string
    environment: string
    timestamp: string
  }
  counts: {
    tenants: number
    companies: number
    branches: number
    users: number
    wallets: number
    transactions: number
    categories: number
    partners: number
  }
  plans: {
    free: number
    merchant: number
    active: number
  }
  financials: {
    totalBalance: number
    totalIncome: number
    totalExpense: number
    netFlow: number
  }
  distributions: {
    usersByRole: Array<{ role: string; count: number }>
    walletsByType: Array<{ type: string; count: number }>
  }
  recentActivity: {
    recentTenants: Array<{
      id: string
      name: string
      email: string
      plan: string
      isActive: boolean
      createdAt: string
    }>
    recentTransactions: Array<{
      id: string
      title: string
      amount: number
      type: string
      date: string
      walletName: string
      tenantName: string
      categoryName?: string
    }>
  }
}

interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  environment: string
  responseTime: number
  healthChecks: {
    database: {
      status: string
      error?: string
    }
  }
  system: {
    nodeVersion: string
    platform: string
    arch: string
    memory: {
      used: number
      total: number
    }
  }
}

interface Tenant {
  id: string
  name: string
  email: string
  phone?: string
  businessName?: string
  plan: 'FREE' | 'MERCHANT'
  isActive: boolean
  subscriptionEnd?: string
  createdAt: string
  updatedAt: string
  _count: {
    companies: number
    users: number
    wallets: number
    branches: number
    transactions: number
  }
  companies: Array<{ id: string; name: string }>
  wallets: Array<{
    id: string
    name: string
    balance: number
    currency: string
  }>
}

export default function DeveloperDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  useEffect(() => {
    loadAllData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    try {
      setRefreshing(true)
      const [statsRes, healthRes, tenantsRes] = await Promise.all([
        fetch('/api/dev/stats'),
        fetch('/api/dev/health'),
        fetch('/api/dev/tenants')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (healthRes.ok) setHealth(await healthRes.json())
      if (tenantsRes.ok) setTenants(await tenantsRes.json())
    } catch (error) {
      console.error('Error loading developer data:', error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteAllData = async () => {
    try {
      const res = await fetch('/api/dev/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' })
      })

      if (res.ok) {
        alert('تم حذف جميع البيانات بنجاح')
        setDeleteDialogOpen(false)
        loadAllData()
      } else {
        const error = await res.json()
        alert('فشل حذف البيانات: ' + error.error)
      }
    } catch (error) {
      console.error('Error deleting all data:', error)
      alert('حدث خطأ أثناء حذف البيانات')
    }
  }

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/dev/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tenantId,
          isActive: !currentStatus
        })
      })

      if (res.ok) {
        loadAllData()
      }
    } catch (error) {
      console.error('Error toggling tenant status:', error)
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستأجر وجميع بياناته؟')) {
      return
    }

    try {
      const res = await fetch('/api/dev/tenants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenantId })
      })

      if (res.ok) {
        alert('تم حذف المستأجر بنجاح')
        loadAllData()
      }
    } catch (error) {
      console.error('Error deleting tenant:', error)
      alert('حدث خطأ أثناء حذف المستأجر')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} يوم، ${hours % 24} ساعة`
    }
    return `${hours} ساعة، ${minutes} دقيقة`
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'TENANT_OWNER': 'مالك',
      'COMPANY_MANAGER': 'مدير شركة',
      'BRANCH_MANAGER': 'مدير فرع',
      'SUPERVISOR': 'مشرف',
      'EMPLOYEE': 'موظف'
    }
    return roles[role] || role
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">جاري تحميل لوحة تحكم المطور...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة تحكم المطور</h1>
              <p className="text-xs text-slate-400">نظام إدارة المحافظ الإلكترونية SaaS</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Badge variant={health?.status === 'ok' ? 'default' : 'destructive'} className="flex items-center gap-2">
              {health?.status === 'ok' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {health?.status === 'ok' ? 'نظام سليم' : 'مشكلة في النظام'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={loadAllData}
              disabled={refreshing}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              الذهاب للتطبيق
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <Activity className="h-4 w-4 ml-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-blue-600">
              <Building2 className="h-4 w-4 ml-2" />
              المستأجرون
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-blue-600">
              <Database className="h-4 w-4 ml-2" />
              قاعدة البيانات
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-blue-600">
              <Server className="h-4 w-4 ml-2" />
              النظام
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  معلومات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">اسم النظام</p>
                    <p className="text-lg font-semibold text-white">{stats?.system.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">الإصدار</p>
                    <p className="text-lg font-semibold text-white">{stats?.system.version}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">البيئة</p>
                    <Badge variant={stats?.system.environment === 'production' ? 'default' : 'secondary'}>
                      {stats?.system.environment}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">آخر تحديث</p>
                    <p className="text-sm text-slate-300">
                      {stats?.system.timestamp ? formatDate(stats.system.timestamp) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">المستأجرون</CardTitle>
                  <Building2 className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.counts.tenants || 0}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-white/20 text-white hover:bg-white/30">
                      مجاني: {stats?.plans.free || 0}
                    </Badge>
                    <Badge className="bg-white/20 text-white hover:bg-white/30">
                      تاجر: {stats?.plans.merchant || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">الشركات</CardTitle>
                  <Briefcase className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.counts.companies || 0}</div>
                  <p className="text-sm text-emerald-100 mt-2">
                    {stats?.counts.branches || 0} فرع
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">المستخدمون</CardTitle>
                  <Users className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.counts.users || 0}</div>
                  <p className="text-sm text-purple-100 mt-2">
                    {stats?.counts.partners || 0} شريك
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">المعاملات</CardTitle>
                  <Activity className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.counts.transactions || 0}</div>
                  <p className="text-sm text-amber-100 mt-2">
                    {stats?.counts.wallets || 0} محفظة
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">ملخص مالي للنظام</CardTitle>
                <CardDescription className="text-slate-400">
                  إجمالي الأرصدة والمعاملات عبر جميع المستأجرين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2 p-4 rounded-lg bg-slate-700/50">
                    <p className="text-sm text-slate-400">إجمالي الأرصدة</p>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(stats?.financials.totalBalance || 0)}
                    </div>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-emerald-900/30">
                    <p className="text-sm text-emerald-300">إجمالي الدخل</p>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(stats?.financials.totalIncome || 0)}
                    </div>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-red-900/30">
                    <p className="text-sm text-red-300">إجمالي المصروفات</p>
                    <div className="text-2xl font-bold text-red-400">
                      {formatCurrency(stats?.financials.totalExpense || 0)}
                    </div>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-blue-900/30">
                    <p className="text-sm text-blue-300">التدفق الصافي</p>
                    <div className={`text-2xl font-bold ${(stats?.financials.netFlow || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(stats?.financials.netFlow || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Tenants */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">أحدث المستأجرين</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {stats?.recentActivity.recentTenants.map((tenant) => (
                        <div key={tenant.id} className="p-3 rounded-lg bg-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{tenant.name}</p>
                              <p className="text-sm text-slate-400 truncate">{tenant.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={tenant.plan === 'MERCHANT' ? 'default' : 'secondary'}>
                                  {tenant.plan === 'MERCHANT' ? 'التاجر' : 'مجاني'}
                                </Badge>
                                <Badge variant={tenant.isActive ? 'default' : 'destructive'}>
                                  {tenant.isActive ? 'نشط' : 'غير نشط'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">
                              {formatDate(tenant.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">أحدث المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {stats?.recentActivity.recentTransactions.map((trans) => (
                        <div key={trans.id} className="p-3 rounded-lg bg-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{trans.title}</p>
                              <p className="text-sm text-slate-400 truncate">
                                {trans.walletName} • {trans.tenantName}
                              </p>
                              <p className="text-xs text-slate-500">{formatDate(trans.date)}</p>
                            </div>
                            <div className={`font-bold ${trans.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trans.type === 'income' ? '+' : '-'}
                              {formatCurrency(trans.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Distributions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">توزيع المستخدمين حسب الدور</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.distributions.usersByRole.map((item) => (
                      <div key={item.role} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                        <Badge variant="outline">{getRoleLabel(item.role)}</Badge>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${(item.count / (stats?.counts.users || 1)) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-white font-semibold">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">توزيع المحافظ حسب النوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.distributions.walletsByType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                        <Wallet className="h-4 w-4 text-slate-400 ml-2" />
                        <span className="text-white">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ 
                                width: `${(item.count / (stats?.counts.wallets || 1)) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-white font-semibold">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">إدارة المستأجرين</CardTitle>
                <CardDescription className="text-slate-400">
                  عرض وإدارة جميع المستأجرين في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <Card key={tenant.id} className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-white text-lg">{tenant.name}</CardTitle>
                              <Badge variant={tenant.plan === 'MERCHANT' ? 'default' : 'secondary'}>
                                {tenant.plan === 'MERCHANT' ? 'التاجر' : 'مجاني'}
                              </Badge>
                              <Badge variant={tenant.isActive ? 'default' : 'destructive'}>
                                {tenant.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{tenant.email}</p>
                            {tenant.businessName && (
                              <p className="text-sm text-slate-400">{tenant.businessName}</p>
                            )}
                            <div className="flex gap-4 mt-3 text-sm">
                              <span className="text-slate-300">
                                <Building2 className="h-4 w-4 inline ml-1" />
                                {tenant._count.companies} شركة
                              </span>
                              <span className="text-slate-300">
                                <Users className="h-4 w-4 inline ml-1" />
                                {tenant._count.users} مستخدم
                              </span>
                              <span className="text-slate-300">
                                <Wallet className="h-4 w-4 inline ml-1" />
                                {tenant._count.wallets} محفظة
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={tenant.isActive ? 'destructive' : 'default'}
                              onClick={() => handleToggleTenantStatus(tenant.id, tenant.isActive)}
                            >
                              {tenant.isActive ? 'إيقاف' : 'تفعيل'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTenant(tenant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                          {tenant.wallets.slice(0, 3).map((wallet) => (
                            <div key={wallet.id} className="p-3 rounded bg-slate-800">
                              <div className="text-sm text-slate-400">{wallet.name}</div>
                              <div className="text-lg font-bold text-white">
                                {formatCurrency(wallet.balance)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tenants.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>لا يوجد مستأجرين في النظام</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  معلومات قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">نوع قاعدة البيانات</p>
                      <p className="text-2xl font-bold text-white">SQLite</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">إجمالي السجلات</p>
                      <p className="text-2xl font-bold text-white">
                        {(stats?.counts.tenants || 0) +
                         (stats?.counts.companies || 0) +
                         (stats?.counts.branches || 0) +
                         (stats?.counts.users || 0) +
                         (stats?.counts.wallets || 0) +
                         (stats?.counts.transactions || 0) +
                         (stats?.counts.categories || 0) +
                         (stats?.counts.partners || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">المستأجرون</span>
                      <span className="text-white font-bold">{stats?.counts.tenants || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">الشركات</span>
                      <span className="text-white font-bold">{stats?.counts.companies || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">الفروع</span>
                      <span className="text-white font-bold">{stats?.counts.branches || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">المستخدمون</span>
                      <span className="text-white font-bold">{stats?.counts.users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">المحافظ</span>
                      <span className="text-white font-bold">{stats?.counts.wallets || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">المعاملات</span>
                      <span className="text-white font-bold">{stats?.counts.transactions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">التصنيفات</span>
                      <span className="text-white font-bold">{stats?.counts.categories || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <span className="text-slate-300">الشركاء</span>
                      <span className="text-white font-bold">{stats?.counts.partners || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-red-900/30 border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-white">منطقة خطرة</AlertTitle>
              <AlertDescription className="text-slate-300">
                هذه العمليات غير قابلة للتراجع. سيتم حذف جميع البيانات في قاعدة البيانات.
              </AlertDescription>
            </Alert>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-white">إدارة البيانات</CardTitle>
                <CardDescription className="text-slate-400">
                  حذف جميع البيانات من قاعدة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف جميع البيانات
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-500">تأكيد حذف جميع البيانات</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء غير قابل للتراجع وسيحذف:
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>جميع المستأجرين</li>
                          <li>جميع الشركات والفروع</li>
                          <li>جميع المستخدمين والشركاء</li>
                          <li>جميع المحافظ والمعاملات</li>
                          <li>جميع التصنيفات</li>
                        </ul>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAllData}
                      >
                        نعم، احذف جميع البيانات
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* Overall System Status Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  الحالة العامة للنظام
                </CardTitle>
                <CardDescription className="text-slate-400">
                  ملخص شامل لصحة النظام والأداء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
                    <div className="flex items-center gap-4">
                      {health?.status === 'ok' ? (
                        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                          <XCircle className="h-10 w-10 text-red-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {health?.status === 'ok' ? 'النظام سليم' : 'مشكلة في النظام'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={health?.status === 'ok' ? 'default' : 'destructive'} className="text-sm">
                            {health?.status === 'ok' ? 'جاهز للعمل' : 'يحتاج للصيانة'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Database Status */}
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-400" />
                          <p className="text-sm text-slate-400">قاعدة البيانات</p>
                        </div>
                        <Badge variant={health?.healthChecks.database.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                          {health?.healthChecks.database.status === 'healthy' ? 'سليمة' : 'مشكلة'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300">
                          {health?.healthChecks.database.status === 'healthy' ? 'متصل' : 'غير متصل'}
                        </p>
                        {health?.healthChecks.database.connectionTime && (
                          <p className="text-xs text-slate-500">
                            {health.healthChecks.database.connectionTime}ms
                          </p>
                        )}
                      </div>
                      {health?.healthChecks.database.error && (
                        <p className="text-xs text-red-400 mt-2">
                          {health.healthChecks.database.error}
                        </p>
                      )}
                    </div>

                    {/* Response Time */}
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-400" />
                          <p className="text-sm text-slate-400">استجابة النظام</p>
                        </div>
                        <Badge variant={health?.responseTime < 300 ? 'default' : health?.responseTime < 500 ? 'secondary' : 'destructive'} className="text-xs">
                          {health?.responseTime < 300 ? 'سريع' : health?.responseTime < 500 ? 'جيد' : 'بطيء'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-white">
                          {health?.responseTime || 0}ms
                        </p>
                        {health?.dbConnectionTime && (
                          <p className="text-xs text-slate-500">
                            قاعدة البيانات: {health.dbConnectionTime}ms
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Uptime */}
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <p className="text-sm text-slate-400">وقت التشغيل</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-white">
                          {health ? formatUptime(health.uptime) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Details Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  تفاصيل قاعدة البيانات
                </CardTitle>
                <CardDescription className="text-slate-400">
                  معلومات مفصلة عن حالة اتصال قاعدة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Database Status */}
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          {health?.healthChecks.database.status === 'healthy' ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">الحالة</p>
                          <p className="text-lg font-bold text-white">
                            {health?.healthChecks.database.status === 'healthy' ? 'سليمة' : 'مشكلة'}
                          </p>
                        </div>
                      </div>
                      {health?.healthChecks.database.details?.queryExecuted && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">المستأجرون</span>
                            <span className="text-white">{health.healthChecks.database.details.tenantCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">الشركات</span>
                            <span className="text-white">{health.healthChecks.database.details.companyCount}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Connection Info */}
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-10 w-10 text-blue-400" />
                        <div>
                          <p className="text-sm text-slate-400">زمن الاتصال</p>
                          <p className="text-2xl font-bold text-white">
                            {health?.healthChecks.database.connectionTime || 0}
                            <span className="text-sm font-normal text-slate-400 ml-1">ms</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {health?.healthChecks.database.connectionTime < 10 ? 'استجابة ممتازة' : health?.healthChecks.database.connectionTime < 50 ? 'استجابة جيدة' : health?.healthChecks.database.connectionTime < 100 ? 'استجابة متوسطة' : 'قد يكون هناك بطء'}
                      </p>
                    </div>
                  </div>

                  {/* Performance Status */}
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-400" />
                        <p className="text-sm text-slate-400">الأداء العام</p>
                      </div>
                      <Badge variant={health?.performance?.status === 'excellent' ? 'default' : health?.performance?.status === 'good' ? 'secondary' : 'destructive'}>
                        {health?.performance?.status === 'excellent' ? 'ممتاز' : health?.performance?.status === 'good' ? 'جيد' : 'ضعيف'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Information Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  معلومات السيرفر
                </CardTitle>
                <CardDescription className="text-slate-400">
                  معلومات تقنية عن بيئة التشغيل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Node.js Info */}
                  <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Server className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">إصدار Node.js</p>
                        <p className="text-xl font-bold text-white">
                          {health?.system.nodeVersion || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Platform and Architecture */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Server className="h-4 w-4 text-purple-400" />
                        </div>
                        <p className="text-sm text-slate-400">النظام الأساسي</p>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {health?.system.platform || '-'}
                      </p>
                    </div>
                    <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Server className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-400">المعمارية</p>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {health?.system.arch || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Environment */}
                  <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-sm text-slate-400">بيئة التشغيل</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={health?.system.environment === 'production' ? 'default' : 'secondary'}>
                        {health?.system.environment || '-'}
                      </Badge>
                      {health?.system.environment === 'production' && (
                        <span className="text-xs text-slate-400">Production Environment</span>
                      )}
                    </div>
                  </div>

                  {/* Process Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">PID العملية</span>
                        <span className="text-white font-mono">{health?.system.pid || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">وقت التشغيل</span>
                        <span className="text-white">{health?.system.uptimeFormatted || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">عدد الأنوية</span>
                        <span className="text-white">{health?.system.cpu?.cores || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">استخدام CPU</span>
                        <span className="text-white">{health?.system.cpu?.load || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage Card with Progress Bar */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  استخدام الذاكرة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  استخدام الذاكرة مع تحليل تفصيلي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Memory Usage with Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        <p className="text-white font-semibold">استخدام الذاكرة الكلي</p>
                      </div>
                      <Badge variant={parseFloat(health?.system.memory?.usagePercentage || '0') < 70 ? 'default' : parseFloat(health?.system.memory?.usagePercentage || '0') < 85 ? 'secondary' : 'destructive'}>
                        {health?.system.memory?.usageStatus === 'normal' ? 'طبيعي' : health?.system.memory?.usageStatus === 'warning' ? 'مرتفع' : 'حرج'}
                      </Badge>
                    </div>
                    <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">النسبة المئوية للاستخدام</span>
                        <span className={`text-3xl font-bold ${parseFloat(health?.system.memory?.usagePercentage || '0') < 70 ? 'text-emerald-400' : parseFloat(health?.system.memory?.usagePercentage || '0') < 85 ? 'text-amber-400' : 'text-red-400'}`}>
                          {health?.system.memory?.usagePercentage || 0}%
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-6 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ 
                              width: `${health?.system.memory?.usagePercentage || 0}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">
                        {parseFloat(health?.system.memory?.usagePercentage || '0') < 50 ? 'استخدام الذاكرة منخفض جداً - أداء ممتاز' : parseFloat(health?.system.memory?.usagePercentage || '0') < 70 ? 'استخدام الذاكرة طبيعي - أداء جيد' : parseFloat(health?.system.memory?.usagePercentage || '0') < 85 ? 'استخدام الذاكرة مرتفع - قد يؤثر على الأداء' : 'استخدام الذاكرة حرج - قد يتسبب في مشاكل'}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Memory Breakdown */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Heap Used */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-1">الذاكرة المستخدمة (Heap)</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.system.memory.heapUsedMB || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>

                    {/* Heap Total */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-1">الذاكرة الكلية (Heap)</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.system.memory.heapTotalMB || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>

                    {/* RSS (Resident Set Size) */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-1">RSS (Resident Set)</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.system.memory.rss || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>

                    {/* External Memory */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-600">
                      <p className="text-sm text-slate-400 mb-1">ذاكرة خارجية</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.system.memory.external || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>

                    {/* Array Buffers */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-600">
                      <p className="text-sm text-slate-400 mb-1">Array Buffers</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.system.memory.arrayBuffers || 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>

                    {/* Available Memory */}
                    <div className="space-y-2 p-4 rounded-lg bg-slate-600">
                      <p className="text-sm text-slate-400 mb-1">الذاكرة المتاحة</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {(health?.system.memory.heapTotalMB || 0) - (health?.system.memory.heapUsedMB || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ميجابايت</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  صحة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      {health?.healthChecks.database.status === 'healthy' ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">قاعدة البيانات</p>
                        <p className="text-sm text-slate-400">
                          {health?.healthChecks.database.status === 'healthy' ? 'متصلة وعاملة' : 'غير متصلة'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={health?.healthChecks.database.status === 'healthy' ? 'default' : 'destructive'}>
                      {health?.healthChecks.database.status === 'healthy' ? 'سليمة' : 'مشكلة'}
                    </Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">استجابة النظام</p>
                      <p className="text-2xl font-bold text-white">
                        {health?.responseTime || 0}ms
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">وقت التشغيل</p>
                      <p className="text-lg font-bold text-white">
                        {health ? formatUptime(health.uptime) : '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">الحالة</p>
                      <Badge variant={health?.status === 'ok' ? 'default' : 'destructive'}>
                        {health?.status === 'ok' ? 'سليم' : 'مشكلة'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  معلومات السيرفر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-slate-700/50">
                      <p className="text-sm text-slate-400">إصدار Node.js</p>
                      <p className="text-white font-medium">{health?.system.nodeVersion}</p>
                    </div>
                    <div className="p-3 rounded bg-slate-700/50">
                      <p className="text-sm text-slate-400">النظام الأساسي</p>
                      <p className="text-white font-medium">{health?.system.platform}</p>
                    </div>
                    <div className="p-3 rounded bg-slate-700/50">
                      <p className="text-sm text-slate-400">البيئة</p>
                      <Badge>{health?.environment}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">استخدام الذاكرة</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">مستخدم</span>
                          <span className="text-white">{health?.system.memory.used}MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">مخصص</span>
                          <span className="text-white">{health?.system.memory.total}MB</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ 
                              width: `${((health?.system.memory.used || 0) / (health?.system.memory.total || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded bg-slate-700/50">
                      <p className="text-sm text-slate-400">المعمارية</p>
                      <p className="text-white font-medium">{health?.system.arch}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="container flex h-12 items-center justify-center px-4">
          <p className="text-sm text-slate-400">
            © 2024 محافظي SaaS - لوحة تحكم المطور
          </p>
        </div>
      </footer>
    </div>
  )
}
