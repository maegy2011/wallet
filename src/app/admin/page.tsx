'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Building, 
  CreditCard, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface BusinessAccount {
  id: string
  name: string
  description?: string
  commercialId?: string
  taxId?: string
  address?: string
  phone: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  subscription?: {
    id: string
    plan: string
    status: string
    startDate: string
    endDate?: string
    monthlyPrice: number
    maxWallets: number
    maxBranches: number
    maxUsers: number
    nextBillingDate?: string
  }
  _count: {
    branches: number
    users: number
    wallets: number
  }
}

interface SubscriptionStats {
  totalBusinesses: number
  activeSubscriptions: number
  totalRevenue: number
  newSubscriptionsThisMonth: number
  plansDistribution: {
    basic: number
    premium: number
    enterprise: number
  }
}

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<BusinessAccount[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccount | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch businesses with subscriptions
      const businessesResponse = await fetch('/api/admin/businesses')
      if (!businessesResponse.ok) {
        const errorData = await businessesResponse.json()
        throw new Error(errorData.error || 'Failed to fetch businesses')
      }
      const businessesData = await businessesResponse.json()
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats')
      if (!statsResponse.ok) {
        const errorData = await statsResponse.json()
        throw new Error(errorData.error || 'Failed to fetch stats')
      }
      const statsData = await statsResponse.json()
      
      setBusinesses(businessesData)
      setStats(statsData)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionUpdate = async (businessId: string, plan: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update subscription')
      }
      
      await fetchDashboardData()
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Subscription update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update subscription')
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'basic': return 'secondary'
      case 'premium': return 'default'
      case 'enterprise': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'expired': return 'outline'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المشرف</h1>
        <p className="text-gray-600">إدارة الاشتراكات والعملاء وصلاحيات المستخدمين</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newSubscriptionsThisMonth} هذا الشهر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاشتراكات النشطة</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeSubscriptions / stats.totalBusinesses) * 100).toFixed(1)}% من إجمالي العملاء
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات الشهرية</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ج.م</div>
              <p className="text-xs text-muted-foreground">
                من جميع الاشتراكات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل النمو</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                مقارنة بالشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="businesses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="businesses">العملاء</TabsTrigger>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>إدارة العملاء</CardTitle>
              <CardDescription>عرض وإدارة حسابات العملاء والاشتراكات</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الخطة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الفروع</TableHead>
                    <TableHead>المحافظ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{business.name}</div>
                          {business.commercialId && (
                            <div className="text-sm text-gray-500">السجل التجاري: {business.commercialId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {business.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {business.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(business.subscription?.plan || 'basic')}>
                          {business.subscription?.plan || 'basic'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(business.subscription?.status || 'inactive')}>
                          {business.subscription?.status || 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{business._count.branches}</TableCell>
                      <TableCell>{business._count.wallets}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBusiness(business)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/business/${business.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الاشتراكات</CardTitle>
              <CardDescription>عرض وتعديل خطط الاشتراكات والأسعار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">الخطة الأساسية</CardTitle>
                      <CardDescription>مناسبة للشركات الصغيرة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">50 ج.م</div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>• 10 محافظ كحد أقصى</div>
                        <div>• 5 فروع كحد أقصى</div>
                        <div>• 20 مستخدم كحد أقصى</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">الخطة المميزة</CardTitle>
                      <CardDescription>مناسبة للشركات المتوسطة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">150 ج.م</div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>• 50 محفظة كحد أقصى</div>
                        <div>• 20 فرع كحد أقصى</div>
                        <div>• 100 مستخدم كحد أقصى</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">الخطة المؤسسية</CardTitle>
                      <CardDescription>مناسبة للشركات الكبيرة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">500 ج.م</div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>• محافظ غير محدودة</div>
                        <div>• فروع غير محدودة</div>
                        <div>• مستخدمين غير محدودين</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>إدارة صلاحيات وأدوار المستخدمين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button 
                  onClick={() => window.location.href = '/admin/roles'}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Users className="h-4 w-4 ml-2" />
                  إدارة الأدوار والصلاحيات
                </Button>
                <p className="text-gray-600 mt-4">انقر للوصول إلى إدارة الأدوار والصلاحيات التفصيلية</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات</CardTitle>
              <CardDescription>إعدادات النظام والتكوينات العامة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">سيتم عرض الإعدادات هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل اشتراك العميل</DialogTitle>
            <DialogDescription>
              تعديل خطة الاشتراك لـ {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan">خطة الاشتراك</Label>
                <Select 
                  defaultValue={selectedBusiness.subscription?.plan || 'basic'}
                  onValueChange={(value) => {
                    if (selectedBusiness) {
                      handleSubscriptionUpdate(selectedBusiness.id, value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الخطة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">الخطة الأساسية (50 ج.م)</SelectItem>
                    <SelectItem value="premium">الخطة المميزة (150 ج.م)</SelectItem>
                    <SelectItem value="enterprise">الخطة المؤسسية (500 ج.م)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">الفروع:</span>
                  <div>{selectedBusiness._count.branches} / {selectedBusiness.subscription?.maxBranches || 5}</div>
                </div>
                <div>
                  <span className="font-medium">المحافظ:</span>
                  <div>{selectedBusiness._count.wallets} / {selectedBusiness.subscription?.maxWallets || 10}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}