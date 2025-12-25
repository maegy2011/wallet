'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, Users, Building2, Briefcase, Database, 
  TrendingUp, TrendingDown, Shield, Settings, RefreshCw,
  Trash2, AlertTriangle, CheckCircle2, XCircle, Wallet,
  ArrowUpRight, ArrowDownRight, Server, Clock, Zap,
  Calendar, DollarSign, PieChart, BarChart3, LineChart, 
  ChevronDown, Edit3, Eye, Languages, SunMoon,
  Bell, Volume2, Info, AlignLeft, AlignRight,
  Sun, Moon
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
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface SystemStats {
  // ... (keep same interface as before)
}

interface HealthStatus {
  // ... (keep same interface as before)
}

interface Tenant {
  // ... (keep same interface as before)
}

export default function DeveloperDashboardEnhanced() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'MERCHANT'>('FREE')
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set())
  
  // NEW: Additional Features State
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown] = useState(30)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [language, setLanguage] = useState('ar')
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('devDashboard_theme')
    const savedAutoRefresh = localStorage.getItem('devDashboard_autoRefresh')
    const savedLanguage = localStorage.getItem('devDashboard_language')
    const savedDirection = localStorage.getItem('devDashboard_direction')
    const savedNotifications = localStorage.getItem('devDashboard_notifications')
    const savedSound = localStorage.getItem('devDashboard_sound')

    if (savedTheme) setTheme(savedTheme as 'light' | 'dark')
    if (savedAutoRefresh) setAutoRefresh(savedAutoRefresh === 'true')
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedDirection) setDirection(savedDirection as 'rtl' | 'ltr')
    if (savedNotifications) setNotificationsEnabled(savedNotifications === 'true')
    if (savedSound) setSoundEnabled(savedSound === 'true')
  }, [])

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('devDashboard_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('devDashboard_autoRefresh', String(autoRefresh))
  }, [autoRefresh])

  useEffect(() => {
    localStorage.setItem('devDashboard_language', language)
    localStorage.setItem('devDashboard_direction', direction)
  }, [language, direction])

  useEffect(() => {
    localStorage.setItem('devDashboard_notifications', String(notificationsEnabled))
    localStorage.setItem('devDashboard_sound', String(soundEnabled))
  }, [notificationsEnabled, soundEnabled])

  // Auto-refresh countdown logic
  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(30)
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadAllData()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    loadAllData()
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

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
        if (notificationsEnabled) {
          showNotification('success', 'تم تحديث البيانات بنجاح', 'تم تحديث جميع الإحصائيات والمعلومات')
        }
      }
      if (healthRes.ok) setHealth(await healthRes.json())
      if (tenantsRes.ok) setTenants(await tenantsRes.json())
    } catch (error) {
      console.error('Error loading developer data:', error)
      if (notificationsEnabled) {
        showNotification('error', 'فشل في تحديث البيانات', 'حدث خطأ أثناء تحديث البيانات')
      }
    } finally {
      setRefreshing(false)
    }
  }

  // Notification system
  const showNotification = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    if (type === 'success') {
      alert(\`✅ \${title}\n\${message}\`)
    } else if (type === 'warning') {
      alert(\`⚠️ \${title}\n\${message}\`)
    } else if (type === 'error') {
      alert(\`❌ \${title}\n\${message}\`)
    }
  }

  // ... (rest of the functions remain the same)
  const handleDeleteAllData = async () => {
    // ... (same as before)
  }

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
    // ... (same as before)
  }

  const handleChangeTenantPlan = async () => {
    // ... (same as before)
  }

  const handleDeleteTenant = async (tenantId: string) => {
    // ... (same as before)
  }

  const toggleExpand = (tenantId: string) => {
    // ... (same as before)
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    // ... (same as before)
  }

  const formatDate = (dateString: string) => {
    // ... (same as before)
  }

  const formatUptime = (seconds: number) => {
    // ... (same as before)
  }

  const getRoleLabel = (role: string) => {
    // ... (same as before)
  }

  const getStatusLabel = (status: string) => {
    // ... (same as before)
  }

  const calculateTenantMetrics = (tenant: Tenant) => {
    // ... (same as before)
  }

  if (isLoading) {
    // ... (same loading screen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة تحكم المطور</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={health?.status === 'ok' ? 'default' : 'destructive'} className="flex items-center gap-2">
                  {health?.status === 'ok' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {health?.status === 'ok' ? 'نظام سليم' : 'مشكلة في النظام'}
                </Badge>
                <Badge variant="outline" className="text-slate-400">
                  {stats?.responseTime || 0}ms
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400 text-right">
              <div className="flex items-center gap-2">
                <Server className="h-3 w-3" />
                <span>{stats?.system.environment || 'development'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="h-3 w-3" />
                <span>{stats?.responseTime}ms</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadAllData}
              disabled={refreshing}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              <RefreshCw className={\`h-4 w-4 ml-2 \${refreshing ? 'animate-spin' : ''}\`} />
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

      <main className="container px-4 py-8 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-slate-800 border-slate-700">
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
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 ml-2" />
              الميزات الإضافية
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-blue-600">
              <Server className="h-4 w-4 ml-2" />
              النظام
            </TabsTrigger>
          </TabsList>

          {/* Existing tabs content remain the same... */}
          <TabsContent value="overview" className="space-y-6">
            {/* ... (overview content same as before) */}
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            {/* ... (tenants content same as before) */}
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            {/* ... (database content same as before) */}
          </TabsContent>

          {/* NEW: Additional Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Auto-Refresh Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-400" />
                  التحديث التلقائي
                </CardTitle>
                <CardDescription className="text-slate-400">
                  إعدادات التحديث التلقائي للبيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Auto-Refresh Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">التحديث التلقائي</p>
                        <p className="text-sm text-slate-400">تحديث البيانات كل 30 ثانية تلقائياً</p>
                      </div>
                    </div>
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>

                  {/* Next Refresh Countdown */}
                  {autoRefresh && (
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">التحديث القادم في:</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-400">
                          {countdown}s
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Refresh Status */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-3">
                      {refreshing ? (
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                        </div>
                      ) : autoRefresh ? (
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-600/20 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">
                          {refreshing ? 'جاري التحديث...' : autoRefresh ? 'التحديث التلقائي مفعل' : 'التحديث التلقائي معطل'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {refreshing ? 'يتم تحديث جميع البيانات' : autoRefresh ? 'سيتم التحديث تلقائياً كل 30 ثانية' : 'يمكنك التحديث يدوياً عبر الزر'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={refreshing ? 'default' : autoRefresh ? 'default' : 'secondary'}>
                      {refreshing ? 'قيد التحديث' : autoRefresh ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <SunMoon className="h-5 w-5 text-blue-400" />
                  إعدادات الواجهة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تخصيص مظهر الواجهة والوضع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        {theme === 'dark' ? (
                          <Moon className="h-5 w-5 text-purple-400" />
                        ) : (
                          <Sun className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">الوضع الداكن (Dark Mode)</p>
                        <p className="text-sm text-slate-400">
                          {theme === 'dark' ? 'الوضع الداكن مفعل - راحة للعين' : 'الوضع الفاتح - قراءة أسهل'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                  </div>

                  {/* Theme Preview */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div 
                      className={\`p-4 rounded-lg border-2 cursor-pointer transition-all \${theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/50'}\`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sun className="h-5 w-5 text-amber-400" />
                        <span className="text-white font-semibold">الوضع الفاتح</span>
                      </div>
                      <div className="h-24 rounded bg-gradient-to-br from-white to-slate-100 border border-slate-300">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded bg-blue-600" />
                            <div className="text-xs text-slate-800">عنوان</div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-200 rounded" />
                            <div className="h-2 w-3/4 bg-slate-200 rounded" />
                            <div className="h-2 w-1/2 bg-slate-200 rounded" />
                          </div>
                        </div>
                      </div>
                      {theme === 'light' && <CheckCircle2 className="h-5 w-5 text-blue-400 mt-2" />}
                    </div>
                    <div 
                      className={\`p-4 rounded-lg border-2 cursor-pointer transition-all \${theme === 'dark' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 bg-slate-700/50'}\`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Moon className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-semibold">الوضع الداكن</span>
                      </div>
                      <div className="h-24 rounded bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded bg-purple-600" />
                            <div className="text-xs text-slate-100">عنوان</div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-700 rounded" />
                            <div className="h-2 w-3/4 bg-slate-700 rounded" />
                            <div className="h-2 w-1/2 bg-slate-700 rounded" />
                          </div>
                        </div>
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="h-5 w-5 text-purple-400 mt-2" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-400" />
                  الإشعارات والتنبيهات
                </CardTitle>
                <CardDescription className="text-slate-400">
                  إعدادات الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">تفعيل الإشعارات</p>
                        <p className="text-sm text-slate-400">عرض تنبيهات للعمليات المهمة</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  {/* Sound Notifications */}
                  {notificationsEnabled && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-amber-400" />
                        </div>
                      <div>
                        <p className="text-white font-semibold">الإشعارات الصوتية</p>
                        <p className="text-sm text-slate-400">تشغيل صوت عند الإشعارات</p>
                      </div>
                    </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  )}

                  {/* Notification Examples */}
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-400">أمثلة على الإشعارات والتنبيهات:</span>
                    </div>
                    <div className="space-y-3">
                      {/* Success Example */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <div className="flex-1">
                          <p className="text-white font-semibold">تم التحديث بنجاح</p>
                          <p className="text-sm text-slate-400">تم تحديث جميع البيانات بنجاح</p>
                        </div>
                      </div>

                      {/* Warning Example */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <div className="flex-1">
                          <p className="text-white font-semibold">تنبيه مهم</p>
                          <p className="text-sm text-slate-400">اتصال قاعدة البيانات بطيء - راجع حالة النظام</p>
                        </div>
                      </div>

                      {/* Error Example */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <div className="flex-1">
                          <p className="text-white font-semibold">خطأ في التحديث</p>
                          <p className="text-sm text-slate-400">فشل في تحديث البيانات - يرجى المحاولة مرة أخرى</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Languages className="h-5 w-5 text-blue-400" />
                  إعدادات اللغة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  اختيار اللغة والاتجاه
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Language Selection */}
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Languages className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">اللغة</p>
                          <p className="text-sm text-slate-400">اختر اللغة المفضلة</p>
                        </div>
                      </div>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Direction */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div 
                      className={\`p-4 rounded-lg border-2 cursor-pointer transition-all \${direction === 'rtl' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/50'}\`}
                      onClick={() => setDirection('rtl')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <AlignRight className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">من اليمين لليسار (RTL)</p>
                          <p className="text-sm text-slate-400">مناسبة للعربية واللغات الأخرى</p>
                        </div>
                      </div>
                      {direction === 'rtl' && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
                    </div>
                    <div 
                      className={\`p-4 rounded-lg border-2 cursor-pointer transition-all \${direction === 'ltr' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/50'}\`}
                      onClick={() => setDirection('ltr')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <AlignLeft className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">من اليسار لليمين (LTR)</p>
                          <p className="text-sm text-slate-400">مناسبة للإنجليزية واللغات الأخرى</p>
                        </div>
                      </div>
                      {direction === 'ltr' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Existing tabs content remain the same... */}
          <TabsContent value="system" className="space-y-6">
            {/* ... (system content same as before) */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="container flex h-12 items-center justify-center px-4">
          <p className="text-sm text-slate-400">
            © 2024 محافظي SaaS - لوحة تحكم المطور | {stats?.counts.tenants || 0} مستأجر
          </p>
        </div>
      </footer>
    </div>
  )
}
