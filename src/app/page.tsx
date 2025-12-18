'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Image, Users, BarChart3, Edit, Archive, Trash2, RefreshCw, Loader2 } from 'lucide-react'

interface Wallet {
  id: string
  name: string
  mobileNumber: string
  logo?: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  monthlyTransactions: number
  feeType: string
  feePercentage: number
  feePerThousand: number
  maxFeeAmount: number
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

export default function WalletManagement() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
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

  // Form states
  const [walletForm, setWalletForm] = useState({
    name: '',
    mobileNumber: '',
    logo: '',
    feeType: 'percentage',
    feePercentage: '',
    feePerThousand: '',
    maxFeeAmount: ''
  })

  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
    logo: '',
    feeType: 'percentage',
    feePercentage: '',
    feePerThousand: '',
    maxFeeAmount: ''
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

  // Calculate fee for a transaction
  const calculateTransactionFee = (walletId: string, amount: number): number => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) return 0
    
    let calculatedFee = 0
    
    switch (wallet.feeType) {
      case 'percentage':
        const feePercentage = wallet.feePercentage || 0
        calculatedFee = (amount * feePercentage) / 100
        break
      case 'perThousand':
        const feePerThousand = wallet.feePerThousand || 0
        calculatedFee = Math.ceil(amount / 1000) * feePerThousand
        break
      case 'fixed':
        // For fixed fee, we'll use feePercentage as the fixed amount
        calculatedFee = wallet.feePercentage || 0
        break
      default:
        calculatedFee = 0
    }
    
    const maxFeeAmount = wallet.maxFeeAmount || 0
    return maxFeeAmount > 0 ? Math.min(calculatedFee, maxFeeAmount) : calculatedFee
  }

  // Get fee description for display
  const getFeeDescription = (wallet: any): string => {
    switch (wallet.feeType) {
      case 'percentage':
        return `${wallet.feePercentage || 0}% من المبلغ`
      case 'perThousand':
        return `${wallet.feePerThousand || 0} جنيه لكل 1000 جنيه`
      case 'fixed':
        return `${wallet.feePercentage || 0} جنيه ثابت`
      default:
        return 'لا توجد رسوم'
    }
  }

  // Calculate total amount with fee
  const calculateTotalWithFee = (walletId: string, amount: number): { fee: number; total: number } => {
    const fee = calculateTransactionFee(walletId, amount)
    const total = amount + fee
    return { fee, total }
  }

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
    
    // Get month name in Arabic
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
    
    // Get month name in Arabic
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

  const stats = useMemo(() => calculateMonthlyStats(), [transactions])

  // Update monthly limit state when stats change
  useEffect(() => {
    setMonthlyLimit(stats.monthlyLimit)
  }, [stats.monthlyLimit])

  // Filter out archived wallets for main display
  const activeWallets = wallets.filter(w => !w.isArchived)
  const archivedWallets = wallets.filter(w => w.isArchived)

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet)
    setEditForm({
      name: wallet.name,
      mobileNumber: wallet.mobileNumber,
      logo: wallet.logo || '',
      feeType: wallet.feeType || 'percentage',
      feePercentage: (wallet.feePercentage || 0).toString(),
      feePerThousand: (wallet.feePerThousand || 0).toString(),
      maxFeeAmount: (wallet.maxFeeAmount || 0).toString()
    })
    setShowEditWallet(true)
  }

  const handleUpdateWallet = async () => {
    if (!editForm.name || !editForm.mobileNumber) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const feePercentage = parseFloat(editForm.feePercentage) || 0
    const feePerThousand = parseFloat(editForm.feePerThousand) || 0
    const maxFeeAmount = parseFloat(editForm.maxFeeAmount) || 0

    if (feePercentage < 0 || feePerThousand < 0 || maxFeeAmount < 0) {
      setAlertMessage('الرسوم يجب أن تكون أرقام موجبة')
      return
    }

    setWalletProcessing(true)
    try {
      const response = await fetch(`/api/wallets/${editingWallet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          mobileNumber: editForm.mobileNumber,
          logo: editForm.logo || null,
          feeType: editForm.feeType,
          feePercentage,
          feePerThousand,
          maxFeeAmount
        })
      })

      if (response.ok) {
        const updatedWallet = await response.json()
        setWallets(wallets.map(w => w.id === editingWallet.id ? updatedWallet : w))
        setEditForm({ name: '', mobileNumber: '', logo: '', feeType: 'percentage', feePercentage: '', feePerThousand: '', maxFeeAmount: '' })
        setShowEditWallet(false)
        setEditingWallet(null)
        setAlertMessage('تم تحديث المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء تحديث المحفظة')
    } finally {
      setWalletProcessing(false)
    }
  }

  const handleArchiveWallet = async (wallet: Wallet) => {
    // Check if wallet has transactions
    const walletTransactions = transactions.filter(t => t.walletId === wallet.id)
    if (walletTransactions.length > 0) {
      setAlertMessage('لا يمكن أرشفة محفظة مرتبطة بمعاملات مالية')
      return
    }

    try {
      const response = await fetch(`/api/wallets/${wallet.id}/archive`, {
        method: 'PUT'
      })

      if (response.ok) {
        setWallets(wallets.map(w => w.id === wallet.id ? { ...w, isArchived: true, archivedAt: new Date().toISOString() } : w))
        setAlertMessage('تم أرشفة المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء أرشفة المحفظة')
    }
  }

  const handleRestoreWallet = async (wallet: Wallet) => {
    try {
      const response = await fetch(`/api/wallets/${wallet.id}/restore`, {
        method: 'PUT'
      })

      if (response.ok) {
        setWallets(wallets.map(w => w.id === wallet.id ? { ...w, isArchived: false, archivedAt: null } : w))
        setAlertMessage('تم استعادة المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء استعادة المحفظة')
    }
  }

  const handleAddWallet = async () => {
    if (!walletForm.name || !walletForm.mobileNumber) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const feePercentage = parseFloat(walletForm.feePercentage) || 0
    const feePerThousand = parseFloat(walletForm.feePerThousand) || 0
    const maxFeeAmount = parseFloat(walletForm.maxFeeAmount) || 0

    if (feePercentage < 0 || feePerThousand < 0 || maxFeeAmount < 0) {
      setAlertMessage('الرسوم يجب أن تكون أرقام موجبة')
      return
    }

    setWalletProcessing(true)
    try {
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: walletForm.name,
          mobileNumber: walletForm.mobileNumber,
          logo: walletForm.logo || null,
          feeType: walletForm.feeType,
          feePercentage,
          feePerThousand,
          maxFeeAmount
        })
      })

      if (response.ok) {
        const newWallet = await response.json()
        setWallets([...wallets, newWallet])
        setWalletForm({ name: '', mobileNumber: '', logo: '', feeType: 'percentage', feePercentage: '', feePerThousand: '', maxFeeAmount: '' })
        setShowAddWallet(false)
        setAlertMessage('تمت إضافة المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء إضافة المحفظة')
    } finally {
      setWalletProcessing(false)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditTransactionForm({
      walletId: transaction.walletId,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description
    })
    setShowEditTransaction(true)
  }

  const handleUpdateTransaction = async () => {
    if (!editTransactionForm.walletId || !editTransactionForm.amount || !editTransactionForm.description) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const amount = parseFloat(editTransactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    setTransactionProcessing(true)
    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editTransactionForm,
          amount
        })
      })

      if (response.ok) {
        const updatedTransaction = await response.json()
        
        // Update transaction in list
        setTransactions(transactions.map(t => 
          t.id === editingTransaction.id ? updatedTransaction : t
        ))
        
        // Recalculate wallet balances and fees
        const walletTransactions = transactions.filter(t => t.walletId === editTransactionForm.walletId)
        const wallet = wallets.find(w => w.id === editTransactionForm.walletId)
        
        if (wallet) {
          const newBalance = walletTransactions
            .filter(t => t.id !== editingTransaction.id)
            .reduce((balance, t) => {
              return t.type === 'deposit' 
                ? balance + t.amount 
                : balance - t.amount
            }, 0) + (editTransactionForm.type === 'deposit' ? amount : -amount)
          
          const totalFees = walletTransactions
            .filter(t => t.id !== editingTransaction.id)
            .reduce((fees, t) => fees + t.feeAmount, 0) + updatedTransaction.feeAmount
          
          setWallets(wallets.map(w => 
            w.id === editTransactionForm.walletId 
              ? { ...w, balance: newBalance, totalFeesEarned: totalFees }
              : w
          ))
        }

        setEditTransactionForm({ walletId: '', type: 'deposit' as 'deposit' | 'withdrawal', amount: '', description: '' })
        setShowEditTransaction(false)
        setEditingTransaction(null)
        setAlertMessage('تم تحديث الحركة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء تحديث الحركة')
    } finally {
      setTransactionProcessing(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!transactionForm.walletId || !transactionForm.amount || !transactionForm.description) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const amount = parseFloat(transactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    // Check monthly limit for the specific wallet
    const walletStats = calculateWalletMonthlyStats(transactionForm.walletId)
    
    if (walletStats.monthlyLimit + amount > 200000) {
      setAlertMessage('تجاوز الحد الشهري المسموح به (200,000 جنيه) لهذه المحفظة')
      return
    }

    setTransactionProcessing(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          amount
        })
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions([...transactions, newTransaction])
        
        // Update wallet balance
        setWallets(wallets.map(w => {
          if (w.id === transactionForm.walletId) {
            const newBalance = transactionForm.type === 'deposit' 
              ? w.balance + amount 
              : w.balance - amount
            return { ...w, balance: newBalance }
          }
          return w
        }))

        setTransactionForm({ walletId: '', type: 'deposit' as 'deposit' | 'withdrawal', amount: '', description: '' })
        setShowTransaction(false)
        setAlertMessage('تم تسجيل الحركة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء تسجيل الحركة')
    } finally {
      setTransactionProcessing(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [walletsRes, transactionsRes] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/transactions')
        ])

        if (walletsRes.ok) {
          const walletsData = await walletsRes.json()
          setWallets(walletsData)
        }

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(transactionsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setAlertMessage('حدث خطأ أثناء تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">إدارة المحافظ الإلكترونية</h1>
          <p className="text-slate-600">نظام متقدم لإدارة المحافظ اليدوية وحركاتها المالية</p>
        </div>

        {/* Alert */}
        {alertMessage && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">جاري تحميل البيانات</h3>
                <p className="text-gray-600 text-sm">يرجى الانتظار حتى يتم تحميل كافة البيانات...</p>
                <div className="mt-4 flex space-x-2 justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المحافظ</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWallets.length}</div>
              <p className="text-xs text-muted-foreground">محفظة نشطة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إيداعات {stats.monthName} {stats.year}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDeposits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه مصري</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سحوبات {stats.monthName} {stats.year}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalWithdrawals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه مصري</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحد الشهري {stats.monthName} {stats.year}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyLimit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                من 200,000 جنيه مصري ({((monthlyLimit / 200000) * 100).toFixed(1)}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    monthlyLimit > 180000 ? 'bg-red-500' : 
                    monthlyLimit > 150000 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((monthlyLimit / 200000) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallets">المحافظ النشطة</TabsTrigger>
            <TabsTrigger value="archived">المحافظ المؤرشفة</TabsTrigger>
            <TabsTrigger value="transactions">الحركات</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">المحافظ النشطة ({activeWallets.length})</h2>
              <Dialog open={showEditWallet} onOpenChange={setShowEditWallet}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>تحديث بيانات المحفظة</DialogTitle>
                    <DialogDescription>
                      قم بتحديث بيانات المحفظة والرسوم
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">اسم المحفظة</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="أدخل اسم المحفظة"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-mobile">رقم الشريحة</Label>
                      <Input
                        id="edit-mobile"
                        value={editForm.mobileNumber}
                        onChange={(e) => setEditForm({...editForm, mobileNumber: e.target.value})}
                        placeholder="01xxxxxxxx"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-feeType">نوع حساب الرسوم</Label>
                      <Select value={editForm.feeType} onValueChange={(value) => setEditForm({...editForm, feeType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">نسبة مئوية</SelectItem>
                          <SelectItem value="perThousand">مبلغ لكل 1000 جنيه</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editForm.feeType === 'percentage' && (
                      <div className="grid gap-2">
                        <Label htmlFor="edit-feePercentage">نسبة الرسوم (%)</Label>
                        <Input
                          id="edit-feePercentage"
                          type="number"
                          step="0.1"
                          value={editForm.feePercentage}
                          onChange={(e) => setEditForm({...editForm, feePercentage: e.target.value})}
                          placeholder="2.5"
                        />
                        <p className="text-xs text-muted-foreground">نسبة مئوية من كل معاملة (مثال: 2.5%)</p>
                      </div>
                    )}

                    {editForm.feeType === 'perThousand' && (
                      <div className="grid gap-2">
                        <Label htmlFor="edit-feePerThousand">الرسوم لكل 1000 جنيه</Label>
                        <Input
                          id="edit-feePerThousand"
                          type="number"
                          step="0.5"
                          value={editForm.feePerThousand}
                          onChange={(e) => setEditForm({...editForm, feePerThousand: e.target.value})}
                          placeholder="5"
                        />
                        <p className="text-xs text-muted-foreground">مبلغ الرسوم لكل 1000 جنيه (مثال: 5 جنيه)</p>
                      </div>
                    )}

                    {editForm.feeType === 'fixed' && (
                      <div className="grid gap-2">
                        <Label htmlFor="edit-fixedFee">الرسوم الثابتة (جنيه)</Label>
                        <Input
                          id="edit-fixedFee"
                          type="number"
                          step="0.5"
                          value={editForm.feePercentage}
                          onChange={(e) => setEditForm({...editForm, feePercentage: e.target.value})}
                          placeholder="10"
                        />
                        <p className="text-xs text-muted-foreground">مبلغ ثابت لكل معاملة (مثال: 10 جنيه)</p>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="edit-maxFeeAmount">الحد الأقصى للرسوم (جنيه)</Label>
                      <Input
                        id="edit-maxFeeAmount"
                        type="number"
                        step="0.5"
                        value={editForm.maxFeeAmount}
                        onChange={(e) => setEditForm({...editForm, maxFeeAmount: e.target.value})}
                        placeholder="50"
                      />
                      <p className="text-xs text-muted-foreground">أقصى مبلغ للرسوم على المعاملة الواحدة</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-logo">رابط الشعار (اختياري)</Label>
                      <Input
                        id="edit-logo"
                        value={editForm.logo}
                        onChange={(e) => setEditForm({...editForm, logo: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEditWallet(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleUpdateWallet} disabled={walletProcessing}>
                      {walletProcessing ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        'تحديث'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة محفظة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>إضافة محفظة جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات المحفظة الجديدة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">اسم المحفظة</Label>
                      <Input
                        id="name"
                        value={walletForm.name}
                        onChange={(e) => setWalletForm({...walletForm, name: e.target.value})}
                        placeholder="أدخل اسم المحفظة"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mobile">رقم الشريحة</Label>
                      <Input
                        id="mobile"
                        value={walletForm.mobileNumber}
                        onChange={(e) => setWalletForm({...walletForm, mobileNumber: e.target.value})}
                        placeholder="01xxxxxxxx"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="feeType">نوع حساب الرسوم</Label>
                      <Select value={walletForm.feeType} onValueChange={(value) => setWalletForm({...walletForm, feeType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">نسبة مئوية</SelectItem>
                          <SelectItem value="perThousand">مبلغ لكل 1000 جنيه</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {walletForm.feeType === 'percentage' && (
                      <div className="grid gap-2">
                        <Label htmlFor="feePercentage">نسبة الرسوم (%)</Label>
                        <Input
                          id="feePercentage"
                          type="number"
                          step="0.1"
                          value={walletForm.feePercentage}
                          onChange={(e) => setWalletForm({...walletForm, feePercentage: e.target.value})}
                          placeholder="2.5"
                        />
                        <p className="text-xs text-muted-foreground">نسبة مئوية من كل معاملة (مثال: 2.5%)</p>
                      </div>
                    )}

                    {walletForm.feeType === 'perThousand' && (
                      <div className="grid gap-2">
                        <Label htmlFor="feePerThousand">الرسوم لكل 1000 جنيه</Label>
                        <Input
                          id="feePerThousand"
                          type="number"
                          step="0.5"
                          value={walletForm.feePerThousand}
                          onChange={(e) => setWalletForm({...walletForm, feePerThousand: e.target.value})}
                          placeholder="5"
                        />
                        <p className="text-xs text-muted-foreground">مبلغ الرسوم لكل 1000 جنيه (مثال: 5 جنيه)</p>
                      </div>
                    )}

                    {walletForm.feeType === 'fixed' && (
                      <div className="grid gap-2">
                        <Label htmlFor="fixedFee">الرسوم الثابتة (جنيه)</Label>
                        <Input
                          id="fixedFee"
                          type="number"
                          step="0.5"
                          value={walletForm.feePercentage}
                          onChange={(e) => setWalletForm({...walletForm, feePercentage: e.target.value})}
                          placeholder="10"
                        />
                        <p className="text-xs text-muted-foreground">مبلغ ثابت لكل معاملة (مثال: 10 جنيه)</p>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="maxFeeAmount">الحد الأقصى للرسوم (جنيه)</Label>
                      <Input
                        id="maxFeeAmount"
                        type="number"
                        step="0.5"
                        value={walletForm.maxFeeAmount}
                        onChange={(e) => setWalletForm({...walletForm, maxFeeAmount: e.target.value})}
                        placeholder="50"
                      />
                      <p className="text-xs text-muted-foreground">أقصى مبلغ للرسوم على المعاملة الواحدة</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="logo">رابط الشعار (اختياري)</Label>
                      <Input
                        id="logo"
                        value={walletForm.logo}
                        onChange={(e) => setWalletForm({...walletForm, logo: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddWallet(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleAddWallet} disabled={walletProcessing}>
                      {walletProcessing ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeWallets.map((wallet) => {
                const walletStats = calculateWalletMonthlyStats(wallet.id)
                return (
                <Card key={wallet.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {wallet.logo ? (
                          <img src={wallet.logo} alt={wallet.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{wallet.name}</CardTitle>
                          <CardDescription>{wallet.mobileNumber}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditWallet(wallet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleArchiveWallet(wallet)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">إجمالي الرسوم المكتسبة</span>
                        <span className="text-purple-600">{(wallet.totalFeesEarned || 0).toLocaleString()} جنيه</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">الرصيد الحالي</span>
                        <span className="font-bold text-lg">{wallet.balance.toLocaleString()} جنيه</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">إجمالي الإيداعات</span>
                        <span className="text-green-600">+{wallet.totalDeposits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">إجمالي السحوبات</span>
                        <span className="text-red-600">-{wallet.totalWithdrawals.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">رسوم المعاملة ({wallet.feePercentage || 0}% - حد أقصى {wallet.maxFeeAmount || 0} جنيه)</span>
                        <span className="text-orange-600 text-xs">إعدادات</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">الحد الشهري المستخدم</span>
                        <span className="text-blue-600">{walletStats.monthlyLimit.toLocaleString()} / 200,000 ({walletStats.monthName} {walletStats.year})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            walletStats.monthlyLimit > 180000 ? 'bg-red-500' : 
                            walletStats.monthlyLimit > 150000 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((walletStats.monthlyLimit / 200000) * 100, 100)}%` }}
                        />
                      </div>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedWallet(wallet.id)
                            setTransactionForm({...transactionForm, walletId: wallet.id})
                            setShowTransaction(true)
                          }}
                          disabled={transactionProcessing}
                        >
                          {transactionProcessing ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                              <span className="ml-2">جاري التحميل...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="ml-2 h-4 w-4" />
                              تسجيل حركة
                            </>
                          )}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">المحافظ المؤرشفة ({archivedWallets.length})</h2>
            </div>
            {archivedWallets.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-8 text-center">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد محافظ مؤرشفة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedWallets.map((wallet) => (
                  <Card key={wallet.id} className="shadow-lg opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {wallet.logo ? (
                            <img src={wallet.logo} alt={wallet.name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                              <Wallet className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{wallet.name}</CardTitle>
                            <CardDescription>{wallet.mobileNumber}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">مؤرشفة</Badge>
                          <Button 
                            size="sm" 
                            onClick={() => handleRestoreWallet(wallet)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-600">إجمالي الرسوم المكتسبة</span>
                          <span className="text-purple-600">{(wallet.totalFeesEarned || 0).toLocaleString()} جنيه</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">تاريخ الأرشفة</span>
                          <span className="text-sm">{new Date(wallet.archivedAt || '').toLocaleDateString('en-US')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">سجل الحركات</h2>
              <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={transactionProcessing}>
                    {transactionProcessing ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="ml-2 h-4 w-4" />
                    )}
                    {transactionProcessing ? 'جاري المعالجة...' : 'تسجيل حركة جديدة'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>تسجيل حركة جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات الحركة المالية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="wallet">المحفظة</Label>
                      <Select value={transactionForm.walletId} onValueChange={(value) => setTransactionForm({...transactionForm, walletId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المحفظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeWallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name} - {wallet.mobileNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">نوع الحركة</Label>
                      <Select value={transactionForm.type} onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionForm({...transactionForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">إيداع (تحويل)</SelectItem>
                          <SelectItem value="withdrawal">سحب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">المبلغ</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Fee and Total Calculation */}
                    {transactionForm.walletId && transactionForm.amount && !isNaN(parseFloat(transactionForm.amount)) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-blue-900">تفاصيل الحساب</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">المبلغ الأساسي:</span>
                            <span className="font-medium">{parseFloat(transactionForm.amount).toLocaleString()} جنيه</span>
                          </div>
                          {(() => {
                            const { fee, total } = calculateTotalWithFee(transactionForm.walletId, parseFloat(transactionForm.amount))
                            const wallet = wallets.find(w => w.id === transactionForm.walletId)
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نوع الرسوم:</span>
                                  <span className="font-medium">{getFeeDescription(wallet)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الرسوم المحسوبة:</span>
                                  <span className="font-medium text-blue-600">{fee.toLocaleString()} جنيه</span>
                                </div>
                                {wallet?.maxFeeAmount && wallet.maxFeeAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">الحد الأقصى للرسوم:</span>
                                    <span className="font-medium">{wallet.maxFeeAmount.toLocaleString()} جنيه</span>
                                  </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-blue-900">المبلغ الإجمالي:</span>
                                    <span className="font-bold text-blue-900 text-lg">{total.toLocaleString()} جنيه</span>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        placeholder="أدخل وصف الحركة"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTransaction(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleAddTransaction} disabled={transactionProcessing}>
                      {transactionProcessing ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Transaction Dialog */}
              <Dialog open={showEditTransaction} onOpenChange={setShowEditTransaction}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>تعديل حركة مالية</DialogTitle>
                    <DialogDescription>
                      قم بتعديل بيانات الحركة المالية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-wallet">المحفظة</Label>
                      <Select value={editTransactionForm.walletId} onValueChange={(value) => setEditTransactionForm({...editTransactionForm, walletId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المحفظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeWallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name} - {wallet.mobileNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-type">نوع الحركة</Label>
                      <Select value={editTransactionForm.type} onValueChange={(value: 'deposit' | 'withdrawal') => setEditTransactionForm({...editTransactionForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">إيداع</SelectItem>
                          <SelectItem value="withdrawal">سحب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-amount">المبلغ</Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        value={editTransactionForm.amount}
                        onChange={(e) => setEditTransactionForm({...editTransactionForm, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Fee and Total Calculation for Edit */}
                    {editTransactionForm.walletId && editTransactionForm.amount && !isNaN(parseFloat(editTransactionForm.amount)) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-blue-900">تفاصيل الحساب</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">المبلغ الأساسي:</span>
                            <span className="font-medium">{parseFloat(editTransactionForm.amount).toLocaleString()} جنيه</span>
                          </div>
                          {(() => {
                            const { fee, total } = calculateTotalWithFee(editTransactionForm.walletId, parseFloat(editTransactionForm.amount))
                            const wallet = wallets.find(w => w.id === editTransactionForm.walletId)
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نوع الرسوم:</span>
                                  <span className="font-medium">{getFeeDescription(wallet)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الرسوم المحسوبة:</span>
                                  <span className="font-medium text-blue-600">{fee.toLocaleString()} جنيه</span>
                                </div>
                                {wallet?.maxFeeAmount && wallet.maxFeeAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">الحد الأقصى للرسوم:</span>
                                    <span className="font-medium">{wallet.maxFeeAmount.toLocaleString()} جنيه</span>
                                  </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-blue-900">المبلغ الإجمالي:</span>
                                    <span className="font-bold text-blue-900 text-lg">{total.toLocaleString()} جنيه</span>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">الوصف</Label>
                      <Textarea
                        id="edit-description"
                        value={editTransactionForm.description}
                        onChange={(e) => setEditTransactionForm({...editTransactionForm, description: e.target.value})}
                        placeholder="أدخل وصف الحركة"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEditTransaction(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleUpdateTransaction} disabled={transactionProcessing}>
                      {transactionProcessing ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        'تحديث'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>لا توجد حركات مسجلة</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.walletName}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`font-bold text-lg ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} جنيه
                            {transaction.feeAmount > 0 && (
                              <div className="text-purple-600 text-sm">
                                <div>الرسوم: {(transaction.feeAmount || 0).toLocaleString()} جنيه</div>
                                <div className="font-semibold text-purple-700">
                                  الإجمالي: {(transaction.amount + (transaction.feeAmount || 0)).toLocaleString()} جنيه
                                </div>
                              </div>
                            )}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="mt-2"
                          >
                            <Edit className="h-3 w-3 ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}