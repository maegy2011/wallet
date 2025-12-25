'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Building2, Users, 
  Briefcase, ArrowLeftRight, BarChart3, Building, Store, 
  Shield, UserCheck, ChevronRight, CheckCircle2, XCircle, AlertCircle, Settings
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Types
interface Tenant {
  id: string
  name: string
  email: string
  phone?: string
  businessName?: string
  plan: 'FREE' | 'MERCHANT'
  subscriptionEnd?: string
  isActive: boolean
  _count: {
    companies: number
    users: number
    wallets: number
    branches: number
  }
}

interface Company {
  id: string
  name: string
  description?: string
  taxId?: string
  tenantId: string
  tenant: Tenant
  branches: Branch[]
  users: User[]
  _count: {
    branches: number
    users: number
  }
}

interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  companyId: string
  company: Company
  users: User[]
  wallets: Wallet[]
  _count: {
    users: number
    wallets: number
  }
}

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: 'TENANT_OWNER' | 'COMPANY_MANAGER' | 'BRANCH_MANAGER' | 'SUPERVISOR' | 'EMPLOYEE'
  tenantId: string
  companyId?: string
  branchId?: string
  tenant?: Tenant
  company?: Company
  branch?: Branch
}

interface Partner {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  notes?: string
  tenantId: string
}

interface Wallet {
  id: string
  name: string
  description?: string
  balance: number
  currency: string
  type: string
  icon: string
  color: string
  tenantId: string
  branchId?: string
  tenant?: Tenant
  branch?: Branch
}

interface Category {
  id: string
  name: string
  description?: string
  type: string
  icon?: string
  color?: string
  tenantId: string
}

interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: 'income' | 'expense'
  date: string
  status: string
  tags?: string
  tenantId: string
  walletId: string
  wallet?: Wallet & { tenant: Tenant; branch?: Branch }
  categoryId?: string
  category?: Category
  createdById?: string
  createdBy?: User
  categoryName?: string
  walletName?: string
  branchName?: string
  createdByName?: string
}

export default function MultiTenantWalletApp() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Dialog states
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  // Form states
  const [walletForm, setWalletForm] = useState({
    name: '',
    description: '',
    initialBalance: '',
    currency: 'SAR',
    type: 'general',
    color: 'primary'
  })

  const [transactionForm, setTransactionForm] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    walletId: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    taxId: ''
  })

  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: ''
  })

  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'EMPLOYEE' as any,
    companyId: '',
    branchId: ''
  })

  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    notes: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    type: 'expense',
    icon: '📁',
    color: 'default'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      loadTenantData(selectedTenant.id)
    }
  }, [selectedTenant])

  const loadInitialData = async () => {
    try {
      const tenantsRes = await fetch('/api/tenants')
      if (tenantsRes.ok) {
        const data = await tenantsRes.json()
        setTenants(data)
        if (data.length > 0) {
          setSelectedTenant(data[0])
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTenantData = async (tenantId: string) => {
    try {
      const [companiesRes, usersRes, partnersRes, walletsRes, categoriesRes, transactionsRes] = await Promise.all([
        fetch(`/api/companies?tenantId=${tenantId}`),
        fetch(`/api/users?tenantId=${tenantId}`),
        fetch(`/api/partners?tenantId=${tenantId}`),
        fetch(`/api/wallets?tenantId=${tenantId}`),
        fetch(`/api/categories?tenantId=${tenantId}`),
        fetch(`/api/transactions?tenantId=${tenantId}`)
      ])

      if (companiesRes.ok) setCompanies(await companiesRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (partnersRes.ok) setPartners(await partnersRes.json())
      if (walletsRes.ok) {
        const walletsData = await walletsRes.json()
        setWallets(walletsData)
        if (walletsData.length > 0) {
          setSelectedWallet(walletsData[0])
        }
      }
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
      if (transactionsRes.ok) setTransactions(await transactionsRes.json())

      if (companies.length > 0 && !selectedCompany) {
        setSelectedCompany(companies[0])
      }
    } catch (error) {
      console.error('Error loading tenant data:', error)
    }
  }

  const filteredTransactions = selectedWallet
    ? transactions.filter(t => t.walletId === selectedWallet.id)
    : selectedBranch
    ? transactions.filter(t => t.wallet?.branchId === selectedBranch.id)
    : selectedCompany
    ? transactions.filter(t => wallets.find(w => w.id === t.walletId && w.branch?.companyId === selectedCompany.id))
    : transactions.filter(t => t.tenantId === selectedTenant?.id)

  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const filteredWallets = selectedBranch
    ? wallets.filter(w => w.branchId === selectedBranch.id)
    : selectedCompany
    ? wallets.filter(w => w.branch?.companyId === selectedCompany.id)
    : wallets.filter(w => w.tenantId === selectedTenant?.id)

  const filteredUsers = selectedBranch
    ? users.filter(u => u.branchId === selectedBranch.id)
    : selectedCompany
    ? users.filter(u => u.companyId === selectedCompany.id)
    : users.filter(u => u.tenantId === selectedTenant?.id)

  const filteredCategories = categories.filter(c => c.tenantId === selectedTenant?.id)

  const totalBalance = filteredWallets.reduce((sum, w) => sum + w.balance, 0)
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...walletForm,
          balance: parseFloat(walletForm.initialBalance) || 0,
          tenantId: selectedTenant?.id,
          branchId: selectedBranch?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setWalletDialogOpen(false)
        setWalletForm({ name: '', description: '', initialBalance: '', currency: 'SAR', type: 'general', color: 'primary' })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create wallet')
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
    }
  }

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          amount: parseFloat(transactionForm.amount),
          date: new Date(transactionForm.date).toISOString(),
          tenantId: selectedTenant?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setTransactionDialogOpen(false)
        setTransactionForm({
          title: '',
          description: '',
          amount: '',
          type: 'expense',
          walletId: selectedWallet?.id || '',
          categoryId: '',
          date: new Date().toISOString().split('T')[0]
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...companyForm,
          tenantId: selectedTenant?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setCompanyDialogOpen(false)
        setCompanyForm({ name: '', description: '', taxId: '' })
      }
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...branchForm,
          companyId: selectedCompany?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setBranchDialogOpen(false)
        setBranchForm({ name: '', address: '', phone: '' })
      }
    } catch (error) {
      console.error('Error creating branch:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userForm,
          tenantId: selectedTenant?.id,
          companyId: selectedCompany?.id || undefined,
          branchId: selectedBranch?.id || undefined
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setUserDialogOpen(false)
        setUserForm({ email: '', name: '', phone: '', role: 'EMPLOYEE', companyId: '', branchId: '' })
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...partnerForm,
          tenantId: selectedTenant?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setPartnerDialogOpen(false)
        setPartnerForm({ name: '', email: '', phone: '', company: '', role: '', notes: '' })
      }
    } catch (error) {
      console.error('Error creating partner:', error)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          tenantId: selectedTenant?.id
        })
      })

      if (res.ok) {
        await loadTenantData(selectedTenant!.id)
        setCategoryDialogOpen(false)
        setCategoryForm({ name: '', description: '', type: 'expense', icon: '📁', color: 'default' })
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const getWalletIconColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      accent: 'bg-accent',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      purple: 'bg-purple-500'
    }
    return colors[color] || colors.primary
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'TENANT_OWNER': 'مالك المستأجر',
      'COMPANY_MANAGER': 'مدير شركة',
      'BRANCH_MANAGER': 'مدير فرع',
      'SUPERVISOR': 'مشرف',
      'EMPLOYEE': 'موظف'
    }
    return roles[role] || role
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    if (role === 'TENANT_OWNER') return 'destructive'
    if (role === 'COMPANY_MANAGER') return 'default'
    if (role === 'BRANCH_MANAGER') return 'default'
    return 'secondary'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">محافظي SaaS</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Select value={selectedTenant?.id} onValueChange={(value) => {
              const tenant = tenants.find(t => t.id === value)
              if (tenant) setSelectedTenant(tenant)
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر المستأجر" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">{tenant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{tenant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tenant.plan === 'FREE' ? 'مجاني' : 'التاجر'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6 pb-24">
        {selectedTenant && (
          <>
            {/* Plan Info Banner */}
            {selectedTenant.plan === 'FREE' && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>الخطة المجانية</AlertTitle>
                <AlertDescription>
                  أنت تستخدم الخطة المجانية التي تدعم 2 محفظة إلكترونية فقط.
                  {' '}يمكنك الترقية إلى خطة التاجر للحصول على محافظ غير محدودة ومميزات إضافية.
                </AlertDescription>
              </Alert>
            )}

            {/* Breadcrumb-like Navigation */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedTenant.name}</span>
              {selectedCompany && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{selectedCompany.name}</span>
                </>
              )}
              {selectedBranch && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{selectedBranch.name}</span>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 ml-2" />
                    محفظة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء محفظة جديدة</DialogTitle>
                    <DialogDescription>
                      {selectedTenant.plan === 'FREE' && `يمكنك إنشاء محفظة إضافية واحدة فقط (الحد: 2)`}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateWallet} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet-name">اسم المحفظة</Label>
                      <Input
                        id="wallet-name"
                        value={walletForm.name}
                        onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                        placeholder="مثال: محفظة الفرع الرئيسي"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wallet-desc">الوصف (اختياري)</Label>
                      <Textarea
                        id="wallet-desc"
                        value={walletForm.description}
                        onChange={(e) => setWalletForm({ ...walletForm, description: e.target.value })}
                        placeholder="وصف المحفظة"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-balance">الرصيد الافتتاحي</Label>
                        <Input
                          id="wallet-balance"
                          type="number"
                          step="0.01"
                          value={walletForm.initialBalance}
                          onChange={(e) => setWalletForm({ ...walletForm, initialBalance: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wallet-currency">العملة</Label>
                        <Select value={walletForm.currency} onValueChange={(value) => setWalletForm({ ...walletForm, currency: value })}>
                          <SelectTrigger id="wallet-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                            <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                            <SelectItem value="EUR">يورو (€)</SelectItem>
                            <SelectItem value="GBP">جنيه إسترليني (£)</SelectItem>
                            <SelectItem value="EGP">جنيه مصري (ج.م)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء المحفظة
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default">
                    <Plus className="h-4 w-4 ml-2" />
                    معاملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة معاملة جديدة</DialogTitle>
                    <DialogDescription>سجل دخل أو مصروف جديد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTransaction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="trans-title">عنوان المعاملة</Label>
                      <Input
                        id="trans-title"
                        value={transactionForm.title}
                        onChange={(e) => setTransactionForm({ ...transactionForm, title: e.target.value })}
                        placeholder="مثال: شراء بقالة"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trans-amount">المبلغ</Label>
                      <Input
                        id="trans-amount"
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trans-type">النوع</Label>
                        <Select value={transactionForm.type} onValueChange={(value: any) => setTransactionForm({ ...transactionForm, type: value })}>
                          <SelectTrigger id="trans-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">دخل</SelectItem>
                            <SelectItem value="expense">مصروف</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trans-date">التاريخ</Label>
                        <Input
                          id="trans-date"
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trans-wallet">المحفظة</Label>
                      <Select value={transactionForm.walletId} onValueChange={(value) => setTransactionForm({ ...transactionForm, walletId: value })}>
                        <SelectTrigger id="trans-wallet">
                          <SelectValue placeholder="اختر المحفظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredWallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trans-category">التصنيف (اختياري)</Label>
                      <Select value={transactionForm.categoryId} onValueChange={(value) => setTransactionForm({ ...transactionForm, categoryId: value })}>
                        <SelectTrigger id="trans-category">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.filter(c => c.type === transactionForm.type).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trans-desc">الوصف (اختياري)</Label>
                      <Textarea
                        id="trans-desc"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        placeholder="تفاصيل إضافية"
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إضافة المعاملة
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Building2 className="h-4 w-4 ml-2" />
                    شركة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء شركة جديدة</DialogTitle>
                    <DialogDescription>أضف شركة جديدة للمستأجر</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">اسم الشركة</Label>
                      <Input
                        id="company-name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        placeholder="مثال: شركة الرياض للتجارة"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-desc">الوصف (اختياري)</Label>
                      <Textarea
                        id="company-desc"
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                        placeholder="وصف الشركة"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-taxid">الرقم الضريبي (اختياري)</Label>
                      <Input
                        id="company-taxid"
                        value={companyForm.taxId}
                        onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                        placeholder="رقم ضريبي"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء الشركة
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!selectedCompany}>
                    <Building className="h-4 w-4 ml-2" />
                    فرع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء فرع جديد</DialogTitle>
                    <DialogDescription>أضف فرع جديد للشركة</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateBranch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch-name">اسم الفرع</Label>
                      <Input
                        id="branch-name"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        placeholder="مثال: فرع الرياض"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch-address">العنوان (اختياري)</Label>
                      <Input
                        id="branch-address"
                        value={branchForm.address}
                        onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                        placeholder="العنوان الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch-phone">رقم الهاتف (اختياري)</Label>
                      <Input
                        id="branch-phone"
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء الفرع
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 ml-2" />
                    مستخدم جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>أضف مستخدم جديد مع الدور المحدد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">البريد الإلكتروني</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-name">الاسم (اختياري)</Label>
                      <Input
                        id="user-name"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-phone">رقم الهاتف (اختياري)</Label>
                      <Input
                        id="user-phone"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">الدور</Label>
                      <Select value={userForm.role} onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}>
                        <SelectTrigger id="user-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TENANT_OWNER">مالك المستأجر</SelectItem>
                          <SelectItem value="COMPANY_MANAGER">مدير شركة</SelectItem>
                          <SelectItem value="BRANCH_MANAGER">مدير فرع</SelectItem>
                          <SelectItem value="SUPERVISOR">مشرف</SelectItem>
                          <SelectItem value="EMPLOYEE">موظف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      إضافة المستخدم
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Briefcase className="h-4 w-4 ml-2" />
                    شريك جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة شريك جديد</DialogTitle>
                    <DialogDescription>أضف شريك تجاري جديد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePartner} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner-name">اسم الشريك</Label>
                      <Input
                        id="partner-name"
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                        placeholder="اسم الشريك أو الشركة"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-email">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        id="partner-email"
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-phone">رقم الهاتف (اختياري)</Label>
                      <Input
                        id="partner-phone"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-company">اسم الشركة (اختياري)</Label>
                      <Input
                        id="partner-company"
                        value={partnerForm.company}
                        onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                        placeholder="اسم شركة الشريك"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-role">الدور (اختياري)</Label>
                      <Input
                        id="partner-role"
                        value={partnerForm.role}
                        onChange={(e) => setPartnerForm({ ...partnerForm, role: e.target.value })}
                        placeholder="مثال: مورد، عميل، إلخ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-notes">ملاحظات (اختياري)</Label>
                      <Textarea
                        id="partner-notes"
                        value={partnerForm.notes}
                        onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                        placeholder="ملاحظات إضافية"
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إضافة الشريك
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 ml-2" />
                    تصنيف جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء تصنيف جديد</DialogTitle>
                    <DialogDescription>أضف تصنيف للدخل أو المصروفات</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">اسم التصنيف</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="مثال: مبيعات، إيجار، إلخ"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cat-type">النوع</Label>
                        <Select value={categoryForm.type} onValueChange={(value) => setCategoryForm({ ...categoryForm, type: value })}>
                          <SelectTrigger id="cat-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">دخل</SelectItem>
                            <SelectItem value="expense">مصروف</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cat-icon">أيقونة</Label>
                        <Input
                          id="cat-icon"
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                          placeholder="📁"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">الوصف (اختياري)</Label>
                      <Textarea
                        id="cat-desc"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="وصف التصنيف"
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء التصنيف
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="companies">الشركات</TabsTrigger>
                <TabsTrigger value="wallets">المحافظ</TabsTrigger>
                <TabsTrigger value="users">المستخدمون</TabsTrigger>
                <TabsTrigger value="partners">الشركاء</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Balance Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">إجمالي الرصيد</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                      <p className="text-xs text-muted-foreground">
                        من {filteredWallets.length} محفظة
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-600">إجمالي الدخل</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</div>
                      <p className="text-xs text-muted-foreground">مجموع الإيرادات</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-600">إجمالي المصروفات</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                      <p className="text-xs text-muted-foreground">مجموع النفقات</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Wallets Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>محافظي</CardTitle>
                    <CardDescription>نظرة سريعة على جميع المحافظ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredWallets.map((wallet) => (
                        <Card
                          key={wallet.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${selectedWallet?.id === wallet.id ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-10 w-10 ${getWalletIconColor(wallet.color)}`}>
                                <AvatarFallback className="text-primary-foreground">
                                  {wallet.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">{wallet.name}</CardTitle>
                                <CardDescription className="text-xs">{wallet.branch?.name || 'عام'}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(wallet.balance, wallet.currency)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {transactions.filter(t => t.walletId === wallet.id).length} معاملة
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredWallets.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>لا توجد محافظ حالياً</p>
                          <p className="text-sm">أنشئ محفظتك الأولى للبدء</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>آخر المعاملات</CardTitle>
                    <CardDescription>
                      {selectedWallet ? `المعاملات من ${selectedWallet.name}` : 'المعاملات من جميع المحافظ'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-10 w-10 ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                <AvatarFallback className="text-white">
                                  {transaction.type === 'income' ? '+' : '-'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{transaction.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(transaction.date)}
                                  {transaction.categoryName && ` • ${transaction.categoryName}`}
                                </div>
                              </div>
                            </div>
                            <div className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                        {recentTransactions.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>لا توجد معاملات حالياً</p>
                            <p className="text-sm">أضف معاملة أولى لتبدأ التتبع</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Companies Tab */}
              <TabsContent value="companies" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الشركات والفروع</CardTitle>
                    <CardDescription>عرض وإدارة شركاتك وفروعها</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {companies.map((company) => (
                        <Card key={company.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{company.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">{company._count.branches} فرع</Badge>
                                    <Badge variant="outline">{company._count.users} موظف</Badge>
                                  </CardDescription>
                                </div>
                              </div>
                              <Button
                                variant={selectedCompany?.id === company.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCompany(selectedCompany?.id === company.id ? null : company)}
                              >
                                {selectedCompany?.id === company.id ? 'إلغاء التحديد' : 'عرض الفروع'}
                              </Button>
                            </div>
                          </CardHeader>
                          {company.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{company.description}</p>
                            </CardContent>
                          )}
                          {selectedCompany?.id === company.id && company.branches.length > 0 && (
                            <CardContent>
                              <Separator className="mb-4" />
                              <h4 className="font-semibold mb-3">الفروع:</h4>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {company.branches.map((branch) => (
                                  <Card key={branch.id} className="border">
                                    <CardContent className="pt-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <Store className="h-5 w-5 text-muted-foreground" />
                                          <div>
                                            <div className="font-medium">{branch.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {branch.address || 'لا يوجد عنوان'}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge variant="outline">{branch._count.wallets} محفظة</Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                      {companies.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">لا توجد شركات</h3>
                          <p className="text-sm mb-4">أنشئ أول شركة لك</p>
                          <Button onClick={() => setCompanyDialogOpen(true)}>
                            <Plus className="h-4 w-4 ml-2" />
                            إنشاء شركة
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wallets Tab */}
              <TabsContent value="wallets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>إدارة المحافظ</CardTitle>
                    <CardDescription>
                      {selectedTenant?.plan === 'FREE' && 'الخطة المجانية: حد 2 محفظة'}{' '}
                      {selectedTenant?.plan === 'MERCHANT' && 'الخطة التاجر: محافظ غير محدودة'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredWallets.map((wallet) => (
                        <Card key={wallet.id} className="overflow-hidden">
                          <div className={`h-2 ${getWalletIconColor(wallet.color)}`} />
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className={`h-12 w-12 ${getWalletIconColor(wallet.color)}`}>
                                  <AvatarFallback className="text-primary-foreground text-lg">
                                    {wallet.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{wallet.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">{wallet.type === 'general' ? 'عامة' : wallet.type === 'savings' ? 'توفير' : wallet.type === 'investment' ? 'استثمار' : 'ائتمان'}</Badge>
                                    <span>•</span>
                                    <span>{wallet.currency}</span>
                                    {wallet.branch && (
                                      <>
                                        <span>•</span>
                                        <span>{wallet.branch.name}</span>
                                      </>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-2xl font-bold">{formatCurrency(wallet.balance, wallet.currency)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {transactions.filter(t => t.walletId === wallet.id).length} معاملة
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          {wallet.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{wallet.description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                      {filteredWallets.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">لا توجد محافظ</h3>
                          <p className="text-sm mb-4">أنشئ محفظة إلكترونية جديدة لتبدأ</p>
                          <Button onClick={() => setWalletDialogOpen(true)}>
                            <Plus className="h-4 w-4 ml-2" />
                            إنشاء محفظة
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>المستخدمون والأدوار</CardTitle>
                    <CardDescription>عرض وإدارة المستخدمين وأدوارهم</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredUsers.map((user, index, arr) => (
                        <div key={user.id}>
                          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {user.name?.charAt(0) || user.email.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{user.name || 'غير محدد'}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={getRoleBadgeVariant(user.role)}>
                                    {getRoleLabel(user.role)}
                                  </Badge>
                                  {user.company && (
                                    <Badge variant="outline">{user.company.name}</Badge>
                                  )}
                                  {user.branch && (
                                    <>
                                      <Separator orientation="vertical" className="h-3" />
                                      <span className="text-xs text-muted-foreground">{user.branch.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              <UserCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                          </div>
                          {index < arr.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">لا يوجد مستخدمون</h3>
                          <p className="text-sm mb-4">أضف مستخدمين جدد للعمل</p>
                          <Button onClick={() => setUserDialogOpen(true)}>
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة مستخدم
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Partners Tab */}
              <TabsContent value="partners" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الشركاء التجاريون</CardTitle>
                    <CardDescription>عرض وإدارة الشركاء التجاريين</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {partners.map((partner) => (
                        <Card key={partner.id}>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">{partner.name}</CardTitle>
                                {partner.role && (
                                  <CardDescription className="text-xs">{partner.role}</CardDescription>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {partner.email && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">البريد:</span> {partner.email}
                              </div>
                            )}
                            {partner.phone && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">الهاتف:</span> {partner.phone}
                              </div>
                            )}
                            {partner.company && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">الشركة:</span> {partner.company}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {partners.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">لا يوجد شركاء</h3>
                          <p className="text-sm mb-4">أضف شركاء تجاريين للتعاون معهم</p>
                          <Button onClick={() => setPartnerDialogOpen(true)}>
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة شريك
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 text-sm text-muted-foreground">
          <p>© 2024 محافظي SaaS - نظام إدارة المحافظ الإلكترونية متعدد المستأجرين</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dev'}>
            <Settings className="h-4 w-4 ml-2" />
            لوحة تحكم المطور
          </Button>
        </div>
      </footer>
    </div>
  )
}
