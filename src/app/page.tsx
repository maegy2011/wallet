'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Image, Users, BarChart3, Edit, Archive, Trash2, RefreshCw, Loader2, Settings, Download, Upload, Smartphone, Home, Eye, DollarSign, ArrowUpRight, ArrowDownRight, PiggyBank, LogOut, Building, UserPlus, Store, CreditCard, FileText } from 'lucide-react'
import NumberPad from '@/components/ui/number-pad'

interface Wallet {
  id: string
  uuid: string
  name: string
  mobileNumber: string
  logo?: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  monthlyTransactions: number
  monthlyLimit: number
  dailyLimit: number
  minBalanceAlert: number
  feeType: string
  feePercentage: number
  feePerThousand: number
  maxFeeAmount: number
  minFeeAmount: number
  totalFeesEarned: number
  isArchived: boolean
  archivedAt?: string
  createdAt: string
}

interface Transaction {
  id: string
  walletId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  feeAmount: number
  description: string
  date: string
  walletName: string
}

interface CashTreasury {
  id: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  createdAt: string
  updatedAt: string
}

interface CashTreasuryTransaction {
  id: string
  type: string
  amount: number
  description: string
  date: string
  createdAt: string
}

interface User {
  id: string
  username: string
  email?: string
  phone: string
  nationalId: string
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  lastLoginAt?: string
}

interface BusinessAccount {
  id: string
  name: string
  description?: string
  phone: string
  email?: string
  isActive: boolean
  createdAt: string
}

export default function WalletManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cashTreasury, setCashTreasury] = useState<CashTreasury | null>(null)
  const [cashTreasuryTransactions, setCashTreasuryTransactions] = useState<CashTreasuryTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showEditWallet, setShowEditWallet] = useState(false)
  const [editingWallet, setEditingWallet] = useState<any>(null)
  const [showTransaction, setShowTransaction] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [walletProcessing, setWalletProcessing] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string>('')
  const [monthlyLimit, setMonthlyLimit] = useState(0)
  const [alertMessage, setAlertMessage] = useState('')
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [lastUsedWalletId, setLastUsedWalletId] = useState<string>('')
  const [appSettings, setAppSettings] = useState({
    numberPadEnabled: 'false'
  })

  // Form states
  const [walletForm, setWalletForm] = useState({
    name: '',
    mobileNumber: '',
    logo: '',
    monthlyLimit: '200000',
    dailyLimit: '60000',
    minBalanceAlert: '1000',
    feeType: 'percentage',
    feePercentage: '',
    feePerThousand: '',
    maxFeeAmount: '',
    minFeeAmount: ''
  })

  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
    logo: '',
    monthlyLimit: '200000',
    dailyLimit: '60000',
    minBalanceAlert: '1000',
    feeType: 'percentage',
    feePercentage: '',
    feePerThousand: '',
    maxFeeAmount: '',
    minFeeAmount: ''
  })

  const [transactionForm, setTransactionForm] = useState({
    walletId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [editTransactionForm, setEditTransactionForm] = useState({
    walletId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  const router = useRouter()

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [walletsResponse, transactionsResponse, settingsResponse, cashTreasuryResponse, cashTreasuryTransactionsResponse] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/transactions'),
          fetch('/api/settings'),
          fetch('/api/cash-treasury'),
          fetch('/api/cash-treasury/transactions')
        ])
        
        if (walletsResponse.ok && transactionsResponse.ok && settingsResponse.ok && cashTreasuryResponse.ok && cashTreasuryTransactionsResponse.ok) {
          const [walletsData, transactionsData, settingsData, cashTreasuryData, cashTreasuryTransactionsData] = await Promise.all([
            walletsResponse.json(),
            transactionsResponse.json(),
            settingsResponse.json(),
            cashTreasuryResponse.json(),
            cashTreasuryTransactionsResponse.json()
          ])
          setWallets(walletsData)
          setTransactions(transactionsData)
          setCashTreasury(cashTreasuryData)
          setCashTreasuryTransactions(cashTreasuryTransactionsData)
          setAppSettings({
            numberPadEnabled: settingsData.numberPadEnabled || 'false'
          })
          
          // Set last used wallet (most recent transaction)
          if (transactionsData.length > 0) {
            const latestTransaction = transactionsData.reduce((latest: any, current: any) => 
              new Date(current.date) > new Date(latest.date) ? current : latest
            )
            setLastUsedWalletId(latestTransaction.walletId)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Clear alert message after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  // Auto-select last used wallet when opening transaction dialog
  useEffect(() => {
    if (showTransaction && lastUsedWalletId && !transactionForm.walletId) {
      setTransactionForm(prev => ({ ...prev, walletId: lastUsedWalletId }))
    }
  }, [showTransaction, lastUsedWalletId])

  // Calculate total fees across all wallets
  const totalFeesAcrossAllWallets = useMemo(() => {
    return wallets.reduce((total, wallet) => total + (wallet.totalFeesEarned || 0), 0)
  }, [wallets])

  // Calculate net profit (إجمالي الأرباح الصافية)
  const calculateNetProfit = () => {
    const totalFees = totalFeesAcrossAllWallets
    const totalBalance = wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0)
    const cashTreasuryBalance = cashTreasury?.balance || 0
    
    return {
      totalFees,
      totalWalletBalance: totalBalance,
      cashTreasuryBalance,
      netProfit: totalFees + cashTreasuryBalance - totalBalance
    }
  }

  const netProfitData = useMemo(() => calculateNetProfit(), [wallets, cashTreasury, totalFeesAcrossAllWallets])

  // Filter out archived wallets for main display
  const activeWallets = wallets.filter(w => !w.isArchived)
  const archivedWallets = wallets.filter(w => w.isArchived)

  // Check if there are any active wallets
  const hasActiveWallets = activeWallets.length > 0

  // Calculate monthly statistics for each wallet
  const calculateWalletMonthlyStats = (walletId: string) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const walletTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return t.walletId === walletId &&
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const totalDeposits = walletTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyLimit = totalDeposits + totalWithdrawals
    
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    const currentMonthName = monthNames[currentMonth]
    
    return {
      totalDeposits,
      totalWithdrawals,
      monthlyLimit,
      transactionCount: walletTransactions.length,
      monthName: currentMonthName,
      year: currentYear
    }
  }

  // Calculate daily statistics for each wallet
  const calculateWalletDailyStats = (walletId: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const walletTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return t.walletId === walletId &&
             transactionDate >= today && 
             transactionDate < tomorrow
    })

    const totalDeposits = walletTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)

    const dailyLimit = totalDeposits + totalWithdrawals
    
    return {
      totalDeposits,
      totalWithdrawals,
      dailyLimit,
      transactionCount: walletTransactions.length
    }
  }

  // Calculate overall monthly statistics
  const calculateMonthlyStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const totalDeposits = monthlyTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalWithdrawals = monthlyTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyLimit = totalDeposits + totalWithdrawals
    
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    const currentMonthName = monthNames[currentMonth]
    
    return {
      totalDeposits,
      totalWithdrawals,
      monthlyLimit,
      transactionCount: monthlyTransactions.length,
      monthName: currentMonthName,
      year: currentYear
    }
  }

  // Check for low balance alerts
  const checkBalanceAlerts = () => {
    const alerts: any[] = []
    for (const wallet of activeWallets) {
      if (wallet.balance < wallet.minBalanceAlert) {
        alerts.push({
          walletId: wallet.id,
          walletName: wallet.name,
          currentBalance: wallet.balance,
          minBalance: wallet.minBalanceAlert,
          deficit: wallet.minBalanceAlert - wallet.balance
        })
      }
    }
    return alerts
  }

  // Calculate monthly return rate
  const calculateMonthlyReturnRate = () => {
    if (!cashTreasury || cashTreasury.totalDeposits === 0) return 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = cashTreasuryTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const monthlyDeposits = monthlyTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyWithdrawals = monthlyTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)

    return monthlyDeposits > 0 ? ((monthlyDeposits - monthlyWithdrawals) / monthlyDeposits * 100) : 0
  }

  const stats = useMemo(() => calculateMonthlyStats(), [transactions])
  const monthlyReturnRate = useMemo(() => calculateMonthlyReturnRate(), [cashTreasury, cashTreasuryTransactions])
  const balanceAlerts = useMemo(() => checkBalanceAlerts(), [activeWallets])

  // Update monthly limit state when stats change
  useEffect(() => {
    setMonthlyLimit(stats.monthlyLimit)
  }, [stats.monthlyLimit])

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    const businessData = localStorage.getItem('businessAccounts')
    const rolesData = localStorage.getItem('userRoles')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        setBusinessAccounts(businessData ? JSON.parse(businessData) : [])
        setUserRoles(rolesData ? JSON.parse(rolesData) : [])
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('businessAccounts')
        localStorage.removeItem('userRoles')
      }
    }
    
    setAuthLoading(false)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('businessAccounts')
      localStorage.removeItem('userRoles')
      setIsAuthenticated(false)
      setUser(null)
      setBusinessAccounts([])
      setUserRoles([])
      router.push('/auth/login')
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Alert Message */}
      {alertMessage && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Balance Alerts */}
      {balanceAlerts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            تنبيه: هناك {balanceAlerts.length} محفظة تحتاج إلى إيداع الرصيد
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحباً بك، {user?.username}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowAddWallet(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white touch-manipulation"
            size="sm"
          >
            <Plus className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">إضافة محفظة</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
          <Button
            onClick={() => setShowTransaction(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
            size="sm"
          >
            <CreditCard className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">معاملة جديدة</span>
            <span className="sm:hidden">معاملة</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm sm:text-base font-medium">إجمالي الأرصدة</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {formatCurrency(wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0))}
                </p>
              </div>
              <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm sm:text-base font-medium">إجمالي الإيداعات</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {formatCurrency(stats.totalDeposits)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm sm:text-base font-medium">إجمالي السحوبات</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {formatCurrency(stats.totalWithdrawals)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 sm:h-10 sm:w-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm sm:text-base font-medium">الرسوم المحصلة</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {formatCurrency(totalFeesAcrossAllWallets)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Treasury Section */}
      {cashTreasury && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6" />
              الخزينة النقدية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">الرصيد الحالي</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                  {formatCurrency(cashTreasury.balance)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">إجمالي الإيداعات</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(cashTreasury.totalDeposits)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">إجمالي السحوبات</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(cashTreasury.totalWithdrawals)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallets Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              المحافظ النشطة ({activeWallets.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {hasActiveWallets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWallets.map((wallet) => {
                const monthlyStats = calculateWalletMonthlyStats(wallet.id)
                const dailyStats = calculateWalletDailyStats(wallet.id)
                const isLowBalance = wallet.balance < wallet.minBalanceAlert
                
                return (
                  <Card key={wallet.id} className={`hover:shadow-lg transition-all duration-200 border-2 ${isLowBalance ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 break-words">
                          {wallet.name}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Archive className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        {wallet.mobileNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
                        <p className="text-sm font-medium">الرصيد الحالي</p>
                        <p className="text-2xl font-bold mt-1">
                          {formatCurrency(wallet.balance)}
                        </p>
                        {isLowBalance && (
                          <p className="text-xs text-amber-200 mt-1">
                            ⚠️ رصيد منخفض
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-gray-600">إيداع اليوم</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(dailyStats.totalDeposits)}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-gray-600">سحب اليوم</p>
                          <p className="font-semibold text-red-700">
                            {formatCurrency(dailyStats.totalWithdrawals)}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 border-t pt-2">
                        <div className="flex justify-between">
                          <span>الحد الشهري:</span>
                          <span className="font-medium">{formatCurrency(wallet.monthlyLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الحد اليومي:</span>
                          <span className="font-medium">{formatCurrency(wallet.dailyLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الرسوم المحصلة:</span>
                          <span className="font-medium">{formatCurrency(wallet.totalFeesEarned)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد محافظ نشطة</h3>
              <p className="text-gray-500 mb-4">قم بإنشاء محفظة جديدة للبدء في استخدام النظام</p>
              <Button
                onClick={() => setShowAddWallet(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إنشاء محفظة جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            آخر المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ScrollArea className="h-64 sm:h-96">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'deposit' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.walletName}</p>
                        <p className="text-sm text-gray-500 break-words">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد معاملات حتى الآن</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Archived Wallets */}
      {archivedWallets.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-6 w-6" />
              المحافظ المؤرشفة ({archivedWallets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedWallets.map((wallet) => (
                <Card key={wallet.id} className="border-2 border-gray-200 bg-gray-50 opacity-75">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-700 break-words">
                      {wallet.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {wallet.mobileNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-3 bg-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">الرصيد</p>
                      <p className="text-xl font-bold text-gray-700 mt-1">
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                        مؤرشفة
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}