'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Image, Users, BarChart3, Edit, Archive, Trash2, RefreshCw, Loader2, Settings, Download, Upload, Smartphone, Home, Eye, DollarSign, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

export default function WalletManagement() {
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

  // Predefined wallet logos
  const predefinedLogos = [
    '🏦', '💳', '💰', '💵', '💴', '💶', '💷', '🪙', '🤑', '💸',
    '📱', '🏪', '🏛️', '🏧', '💼', '🏭', '🏢', '🏣', '🏤', '🏥'
  ]

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
        calculatedFee = wallet.feePercentage || 0
        break
      default:
        calculatedFee = 0
    }
    
    const maxFeeAmount = wallet.maxFeeAmount || 0
    const minFeeAmount = wallet.minFeeAmount || 0
    let feeAmount = calculatedFee
    
    // Apply maximum fee limit if set
    if (maxFeeAmount > 0 && feeAmount > maxFeeAmount) {
      feeAmount = maxFeeAmount
    }
    
    // Apply minimum fee if set and calculated fee is less than minimum
    if (minFeeAmount > 0 && feeAmount < minFeeAmount) {
      feeAmount = minFeeAmount
    }
    
    return feeAmount
  }

  // Get fee description for display
  const getFeeDescription = (wallet: any): string => {
    let description = ''
    switch (wallet.feeType) {
      case 'percentage':
        description = `${wallet.feePercentage || 0}% من المبلغ`
        break
      case 'perThousand':
        description = `${wallet.feePerThousand || 0} جنيه لكل 1000 جنيه`
        break
      case 'fixed':
        description = `${wallet.feePercentage || 0} جنيه ثابت`
        break
      default:
        description = 'لا توجد رسوم'
    }
    
    const maxFee = wallet.maxFeeAmount || 0
    const minFee = wallet.minFeeAmount || 0
    
    if (maxFee > 0 && minFee > 0) {
      description += ` (حد أدنى ${minFee} ج.م، حد أقصى ${maxFee} ج.م)`
    } else if (maxFee > 0) {
      description += ` (حد أقصى ${maxFee} ج.م)`
    } else if (minFee > 0) {
      description += ` (حد أدنى ${minFee} ج.م)`
    }
    
    return description
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

  // Check for low balance alerts
  const checkBalanceAlerts = () => {
    const alerts = []
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

  // Update monthly limit state when stats change
  useEffect(() => {
    setMonthlyLimit(stats.monthlyLimit)
  }, [stats.monthlyLimit])

  // Filter out archived wallets for main display
  const activeWallets = wallets.filter(w => !w.isArchived)
  const archivedWallets = wallets.filter(w => w.isArchived)

  // Check if there are any active wallets
  const hasActiveWallets = activeWallets.length > 0

  // Check for low balance alerts (moved after activeWallets is defined)
  const balanceAlerts = useMemo(() => checkBalanceAlerts(), [activeWallets])

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

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet)
    setEditForm({
      name: wallet.name,
      mobileNumber: wallet.mobileNumber,
      logo: wallet.logo || '',
      monthlyLimit: (wallet.monthlyLimit || 200000).toString(),
      dailyLimit: (wallet.dailyLimit || 60000).toString(),
      minBalanceAlert: (wallet.minBalanceAlert || 1000).toString(),
      feeType: wallet.feeType || 'percentage',
      feePercentage: (wallet.feePercentage || 0).toString(),
      feePerThousand: (wallet.feePerThousand || 0).toString(),
      maxFeeAmount: (wallet.maxFeeAmount || 0).toString(),
      minFeeAmount: (wallet.minFeeAmount || 0).toString()
    })
    setShowEditWallet(true)
  }

  const handleUpdateWallet = async () => {
    if (!editForm.name || !editForm.mobileNumber) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const monthlyLimit = parseFloat(editForm.monthlyLimit) || 200000
    const dailyLimit = parseFloat(editForm.dailyLimit) || 60000
    const minBalanceAlert = parseFloat(editForm.minBalanceAlert) || 1000
    const feePercentage = parseFloat(editForm.feePercentage) || 0
    const feePerThousand = parseFloat(editForm.feePerThousand) || 0
    const maxFeeAmount = parseFloat(editForm.maxFeeAmount) || 0
    const minFeeAmount = parseFloat(editForm.minFeeAmount) || 0

    if (feePercentage < 0 || feePerThousand < 0 || maxFeeAmount < 0 || minFeeAmount < 0 || monthlyLimit < 0 || dailyLimit < 0 || minBalanceAlert < 0) {
      setAlertMessage('جميع القيم يجب أن تكون أرقام موجبة')
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
          monthlyLimit,
          dailyLimit,
          minBalanceAlert,
          feeType: editForm.feeType,
          feePercentage,
          feePerThousand,
          maxFeeAmount,
          minFeeAmount
        })
      })

      if (response.ok) {
        const updatedWallet = await response.json()
        setWallets(wallets.map(w => w.id === editingWallet.id ? updatedWallet : w))
        setEditForm({ name: '', mobileNumber: '', logo: '', feeType: 'percentage', feePercentage: '', feePerThousand: '', maxFeeAmount: '', minFeeAmount: '' })
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

  const handleAddWallet = async () => {
    if (!walletForm.name || !walletForm.mobileNumber) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    // Check for duplicate mobile number
    if (wallets.some(w => w.mobileNumber === walletForm.mobileNumber && !w.isArchived)) {
      setAlertMessage('رقم الموبايل هذا مستخدم بالفعل')
      return
    }

    const monthlyLimit = parseFloat(walletForm.monthlyLimit) || 200000
    const dailyLimit = parseFloat(walletForm.dailyLimit) || 60000
    const minBalanceAlert = parseFloat(walletForm.minBalanceAlert) || 1000
    const feePercentage = parseFloat(walletForm.feePercentage) || 0
    const feePerThousand = parseFloat(walletForm.feePerThousand) || 0
    const maxFeeAmount = parseFloat(walletForm.maxFeeAmount) || 0
    const minFeeAmount = parseFloat(walletForm.minFeeAmount) || 0

    if (feePercentage < 0 || feePerThousand < 0 || maxFeeAmount < 0 || minFeeAmount < 0 || monthlyLimit < 0 || dailyLimit < 0 || minBalanceAlert < 0) {
      setAlertMessage('جميع القيم يجب أن تكون أرقام موجبة')
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
          monthlyLimit,
          dailyLimit,
          minBalanceAlert,
          feeType: walletForm.feeType,
          feePercentage,
          feePerThousand,
          maxFeeAmount,
          minFeeAmount
        })
      })

      if (response.ok) {
        const newWallet = await response.json()
        setWallets([...wallets, newWallet])
        setWalletForm({ name: '', mobileNumber: '', logo: '', monthlyLimit: '200000', dailyLimit: '60000', minBalanceAlert: '1000', feeType: 'percentage', feePercentage: '', feePerThousand: '', maxFeeAmount: '', minFeeAmount: '' })
        setShowAddWallet(false)
        setAlertMessage('تمت إضافة المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء إضافة المحفظة')
    } finally {
      setWalletProcessing(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!transactionForm.walletId || !transactionForm.amount) {
      setAlertMessage('يرجى ملء الحقول المطلوبة')
      return
    }

    const amount = parseFloat(transactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    // Check monthly and daily limits for the specific wallet
    const wallet = wallets.find(w => w.id === transactionForm.walletId)
    if (!wallet) {
      setAlertMessage('المحفظة المحددة غير موجودة')
      return
    }

    const walletStats = calculateWalletMonthlyStats(transactionForm.walletId)
    const dailyStats = calculateWalletDailyStats(transactionForm.walletId)
    
    if (walletStats.monthlyLimit + amount > wallet.monthlyLimit) {
      setAlertMessage(`تجاوز الحد الشهري المسموح به (${wallet.monthlyLimit?.toLocaleString() || 0} جنيه) لهذه المحفظة`)
      return
    }

    if (dailyStats.dailyLimit + amount > wallet.dailyLimit) {
      setAlertMessage(`تجاوز الحد اليومي المسموح به (${wallet.dailyLimit?.toLocaleString() || 0} جنيه) لهذه المحفظة`)
      return
    }

    setTransactionProcessing(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          amount,
          description: transactionForm.description || 'حركة مالية'
        })
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions([...transactions, newTransaction])
        
        // Update wallet balance
        const wallet = wallets.find(w => w.id === transactionForm.walletId)
        if (wallet) {
          const newBalance = wallet.balance + (transactionForm.type === 'deposit' ? amount : -amount)
          const newFees = wallet.totalFeesEarned + newTransaction.feeAmount
          setWallets(wallets.map(w => 
            w.id === transactionForm.walletId 
              ? { ...w, balance: newBalance, totalFeesEarned: newFees }
              : w
          ))
        }
        
        // Update last used wallet
        setLastUsedWalletId(transactionForm.walletId)
        
        setTransactionForm({ walletId: '', type: 'deposit', amount: '', description: '' })
        setShowTransaction(false)
        setAlertMessage('تمت إضافة الحركة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء إضافة الحركة')
    } finally {
      setTransactionProcessing(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const deletedTransaction = transactions.find(t => t.id === transactionId)
        if (deletedTransaction) {
          // Update wallet balance
          const wallet = wallets.find(w => w.id === deletedTransaction.walletId)
          if (wallet) {
            const newBalance = wallet.balance - (deletedTransaction.type === 'deposit' ? deletedTransaction.amount : -deletedTransaction.amount)
            const newFees = wallet.totalFeesEarned - deletedTransaction.feeAmount
            setWallets(wallets.map(w => 
              w.id === deletedTransaction.walletId 
                ? { ...w, balance: newBalance, totalFeesEarned: newFees }
                : w
            ))
          }
        }
        
        setTransactions(transactions.filter(t => t.id !== transactionId))
        setAlertMessage('تم حذف الحركة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء حذف الحركة')
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
    if (!editTransactionForm.walletId || !editTransactionForm.amount) {
      setAlertMessage('يرجى ملء الحقول المطلوبة')
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
          amount,
          description: editTransactionForm.description || 'حركة مالية'
        })
      })

      if (response.ok) {
        const updatedTransaction = await response.json()
        
        // Recalculate wallet balances for both old and new wallets
        const oldWallet = wallets.find(w => w.id === editingTransaction.walletId)
        const newWallet = wallets.find(w => w.id === editTransactionForm.walletId)
        
        if (oldWallet) {
          // Remove old transaction impact
          const oldBalance = oldWallet.balance - (editingTransaction.type === 'deposit' ? editingTransaction.amount : -editingTransaction.amount)
          const oldFees = oldWallet.totalFeesEarned - editingTransaction.feeAmount
          
          setWallets(wallets.map(w => 
            w.id === editingTransaction.walletId 
              ? { ...w, balance: oldBalance, totalFeesEarned: oldFees }
              : w
          ))
        }
        
        if (newWallet) {
          // Add new transaction impact
          const newBalance = newWallet.balance + (editTransactionForm.type === 'deposit' ? amount : -amount)
          const newFees = newWallet.totalFeesEarned + updatedTransaction.feeAmount
          
          setWallets(wallets.map(w => 
            w.id === editTransactionForm.walletId 
              ? { ...w, balance: newBalance, totalFeesEarned: newFees }
              : w
          ))
        }
        
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? updatedTransaction : t))
        setEditTransactionForm({ walletId: '', type: 'deposit', amount: '', description: '' })
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

  const handleAddTransactionClick = () => {
    if (!hasActiveWallets) {
      setShowWalletDialog(true)
    } else {
      setShowTransaction(true)
    }
  }

  const handleAddWalletFromDialog = () => {
    setShowWalletDialog(false)
    setShowAddWallet(true)
  }

  const handleViewWallet = (walletId: string) => {
    router.push(`/wallet/${walletId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">إدارة المحافظ</h1>
              <p className="text-muted-foreground mt-1">إدارة محافظك الإلكترونية ومعاملاتك المالية</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/cash-treasury')}
                className="flex items-center gap-2"
              >
                <PiggyBank className="h-4 w-4" />
                <span className="hidden sm:inline">خزينة الكاش</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/expenses')}
                className="flex items-center gap-2"
              >
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline">المصروفات</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/summary')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">ملخص الأعمال</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">الإعدادات</span>
              </Button>
              <Button
                onClick={() => setShowAddWallet(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة محفظة</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إيداع هذا الشهر</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeposits?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سحب هذا الشهر</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWithdrawals?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رصيد خزينة الكاش</CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashTreasury?.balance.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{netProfitData.netProfit?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
        </div>

        {/* Balance Alerts */}
        {balanceAlerts.length > 0 && (
          <div className="mb-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="font-medium mb-2">تنبيهات انخفاض الرصيد:</div>
                {balanceAlerts.map((alert, index) => (
                  <div key={index} className="text-sm">
                    • محفظة <strong>{alert.walletName}</strong>: الرصيد الحالي {alert.currentBalance?.toLocaleString() || 0} جنيه (أقل من الحد الأدنى {alert.minBalance?.toLocaleString() || 0} جنيه)
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  المحافظ النشطة
                </CardTitle>
                <CardDescription>
                  {activeWallets.length === 0 ? 'لا توجد محافظ نشطة' : `إجمالي ${activeWallets.length} محفظة نشطة`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeWallets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">لا توجد محافظ نشطة</p>
                    <p className="text-muted-foreground mb-4">قم بإضافة محفظة جديدة لبدء إدارة معاملاتك</p>
                    <Button onClick={() => setShowAddWallet(true)}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة محفظة جديدة
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {activeWallets.map((wallet) => (
                        <div key={wallet.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{wallet.logo || '🏦'}</div>
                              <div>
                                <h3 className="font-semibold">{wallet.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" />
                                  {wallet.mobileNumber}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {getFeeDescription(wallet)}
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">{wallet.balance?.toLocaleString() || 0} جنيه</p>
                              <div className="flex gap-1 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewWallet(wallet.id)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditWallet(wallet)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleAddTransactionClick}
                  className="w-full"
                  disabled={!hasActiveWallets}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة حركة جديدة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddWallet(true)}
                  className="w-full"
                >
                  <Wallet className="h-4 w-4 ml-2" />
                  إضافة محفظة جديدة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/settings')}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 ml-2" />
                  الإعدادات
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>إجمالي المعاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.transactionCount}</div>
                <p className="text-xs text-muted-foreground">{stats.monthName} {stats.year}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Action Button */}
      {hasActiveWallets && (
        <div className="fixed bottom-6 left-6 z-50">
          <Button
            onClick={() => setShowTransaction(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Add Wallet Dialog */}
        <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة محفظة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات المحفظة الجديدة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المحفظة</Label>
                <Input
                  id="name"
                  value={walletForm.name}
                  onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                  placeholder="مثال: محفظة فودافون كاش"
                />
              </div>
              
              <div>
                <Label htmlFor="mobileNumber">رقم الموبايل</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={walletForm.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setWalletForm({ ...walletForm, mobileNumber: value })
                  }}
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div>
                <Label>شعار المحفظة</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {predefinedLogos.map((logo, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={walletForm.logo === logo ? "default" : "outline"}
                      className="h-12 text-lg"
                      onClick={() => setWalletForm({ ...walletForm, logo })}
                    >
                      {logo}
                    </Button>
                  ))}
                </div>
                <Input
                  className="mt-2"
                  value={walletForm.logo}
                  onChange={(e) => setWalletForm({ ...walletForm, logo: e.target.value })}
                  placeholder="أو أدخل رابط صورة الشعار"
                />
              </div>

              <div>
                <Label htmlFor="monthlyLimit">الحد الشهري للمعاملات (جنيه)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  value={walletForm.monthlyLimit}
                  onChange={(e) => setWalletForm({ ...walletForm, monthlyLimit: e.target.value })}
                  placeholder="200000"
                />
              </div>

              <div>
                <Label htmlFor="dailyLimit">الحد اليومي للمعاملات (جنيه)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={walletForm.dailyLimit}
                  onChange={(e) => setWalletForm({ ...walletForm, dailyLimit: e.target.value })}
                  placeholder="60000"
                />
              </div>

              <div>
                <Label htmlFor="minBalanceAlert">تنبيه عند انخفاض الرصيد عن (جنيه)</Label>
                <Input
                  id="minBalanceAlert"
                  type="number"
                  value={walletForm.minBalanceAlert}
                  onChange={(e) => setWalletForm({ ...walletForm, minBalanceAlert: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="feeType">نوع الرسوم</Label>
                <Select value={walletForm.feeType} onValueChange={(value) => setWalletForm({ ...walletForm, feeType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                    <SelectItem value="perThousand">لكل 1000 جنيه</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {walletForm.feeType === 'percentage' && (
                <div>
                  <Label htmlFor="feePercentage">نسبة الرسوم (%)</Label>
                  <Input
                    id="feePercentage"
                    type="number"
                    step="0.1"
                    value={walletForm.feePercentage}
                    onChange={(e) => setWalletForm({ ...walletForm, feePercentage: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
              )}

              {walletForm.feeType === 'perThousand' && (
                <div>
                  <Label htmlFor="feePerThousand">الرسوم لكل 1000 جنيه</Label>
                  <Input
                    id="feePerThousand"
                    type="number"
                    step="0.5"
                    value={walletForm.feePerThousand}
                    onChange={(e) => setWalletForm({ ...walletForm, feePerThousand: e.target.value })}
                    placeholder="5"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="maxFeeAmount">أقصى رسوم (اختياري)</Label>
                <Input
                  id="maxFeeAmount"
                  type="number"
                  step="0.5"
                  value={walletForm.maxFeeAmount}
                  onChange={(e) => setWalletForm({ ...walletForm, maxFeeAmount: e.target.value })}
                  placeholder="20"
                />
              </div>

              <div>
                <Label htmlFor="minFeeAmount">أدنى رسوم (اختياري)</Label>
                <Input
                  id="minFeeAmount"
                  type="number"
                  step="0.5"
                  value={walletForm.minFeeAmount}
                  onChange={(e) => setWalletForm({ ...walletForm, minFeeAmount: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddWallet} disabled={walletProcessing} className="flex-1">
                  {walletProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  إضافة المحفظة
                </Button>
                <Button variant="outline" onClick={() => setShowAddWallet(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Transaction Dialog */}
        <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
          <DialogContent className={`max-w-md ${appSettings.numberPadEnabled === 'true' ? 'max-w-2xl' : 'max-w-md'}`}>
            <DialogHeader>
              <DialogTitle>إضافة حركة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات الحركة المالية
              </DialogDescription>
            </DialogHeader>
            <div className={`space-y-4 ${appSettings.numberPadEnabled === 'true' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="walletId">المحفظة</Label>
                  <Select value={transactionForm.walletId} onValueChange={(value) => setTransactionForm({ ...transactionForm, walletId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحفظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center gap-2">
                            <span>{wallet.logo || '🏦'}</span>
                            <div>
                              <span>{wallet.name}</span>
                              <span className="text-xs text-muted-foreground mr-2">{wallet.mobileNumber}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">نوع الحركة</Label>
                  <Select value={transactionForm.type} onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionForm({ ...transactionForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">إيداع</SelectItem>
                      <SelectItem value="withdrawal">سحب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="none"
                    readOnly={appSettings.numberPadEnabled === 'true'}
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setTransactionForm({ ...transactionForm, amount: value })
                    }}
                    placeholder="0.00"
                    onClick={(e) => {
                      if (appSettings.numberPadEnabled === 'true') {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
                    onFocus={(e) => {
                      if (appSettings.numberPadEnabled === 'true') {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
                    className={appSettings.numberPadEnabled === 'true' ? 'cursor-pointer' : ''}
                  />
                  {appSettings.numberPadEnabled === 'true' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      استخدم لوحة الأرقام المدمجة لإدخال المبلغ
                    </p>
                  )}
                  {transactionForm.walletId && transactionForm.amount && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {(() => {
                        const amount = parseFloat(transactionForm.amount)
                        if (!isNaN(amount) && amount > 0) {
                          const { fee, total } = calculateTotalWithFee(transactionForm.walletId, amount)
                          return (
                            <div>
                              <p>الرسوم: {fee.toFixed(2)} جنيه</p>
                              <p>الإجمالي: {total.toFixed(2)} جنيه</p>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="أدخل وصف الحركة"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddTransaction} disabled={transactionProcessing} className="flex-1">
                    {transactionProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                    إضافة الحركة
                  </Button>
                  <Button variant="outline" onClick={() => setShowTransaction(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>

              {/* Number Pad */}
              {appSettings.numberPadEnabled === 'true' && (
                <div className="lg:mt-0 mt-6">
                  <NumberPad
                    value={transactionForm.amount}
                    onChange={(value) => setTransactionForm({ ...transactionForm, amount: value })}
                    onClear={() => setTransactionForm({ ...transactionForm, amount: '' })}
                    onSubmit={handleAddTransaction}
                    placeholder="0.00"
                    disabled={transactionProcessing}
                    maxLength={10}
                    onInputClick={() => {
                      // Focus the input field briefly to trigger any focus effects
                      const amountInput = document.getElementById('amount') as HTMLInputElement
                      if (amountInput) {
                        amountInput.focus()
                        setTimeout(() => amountInput.blur(), 100)
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog open={showEditTransaction} onOpenChange={setShowEditTransaction}>
          <DialogContent className={`max-w-md ${appSettings.numberPadEnabled === 'true' ? 'max-w-2xl' : 'max-w-md'}`}>
            <DialogHeader>
              <DialogTitle>تعديل الحركة</DialogTitle>
              <DialogDescription>
                عدل بيانات الحركة المالية
              </DialogDescription>
            </DialogHeader>
            <div className={`space-y-4 ${appSettings.numberPadEnabled === 'true' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
              <div>
                <Label htmlFor="edit-walletId">المحفظة</Label>
                <Select value={editTransactionForm.walletId} onValueChange={(value) => setEditTransactionForm({ ...editTransactionForm, walletId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحفظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeWallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        <div className="flex items-center gap-2">
                          <span>{wallet.logo || '🏦'}</span>
                          <div>
                            <span>{wallet.name}</span>
                            <span className="text-xs text-muted-foreground mr-2">{wallet.mobileNumber}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-type">نوع الحركة</Label>
                <Select value={editTransactionForm.type} onValueChange={(value: 'deposit' | 'withdrawal') => setEditTransactionForm({ ...editTransactionForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">إيداع</SelectItem>
                    <SelectItem value="withdrawal">سحب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-amount">المبلغ</Label>
                <Input
                  id="edit-amount"
                  type="text"
                  inputMode="none"
                  readOnly={appSettings.numberPadEnabled === 'true'}
                  step="0.01"
                  value={editTransactionForm.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setEditTransactionForm({ ...editTransactionForm, amount: value })
                  }}
                  placeholder="0.00"
                  onClick={(e) => {
                    if (appSettings.numberPadEnabled === 'true') {
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                  }}
                  onFocus={(e) => {
                    if (appSettings.numberPadEnabled === 'true') {
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                  }}
                  className={appSettings.numberPadEnabled === 'true' ? 'cursor-pointer' : ''}
                />
                {appSettings.numberPadEnabled === 'true' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    استخدم لوحة الأرقام المدمجة لإدخال المبلغ
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-description">الوصف (اختياري)</Label>
                <Textarea
                  id="edit-description"
                  value={editTransactionForm.description}
                  onChange={(e) => setEditTransactionForm({ ...editTransactionForm, description: e.target.value })}
                  placeholder="أدخل وصف الحركة"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateTransaction} disabled={transactionProcessing} className="flex-1">
                  {transactionProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  تحديث الحركة
                </Button>
                <Button variant="outline" onClick={() => setShowEditTransaction(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>

            {/* Number Pad */}
            {appSettings.numberPadEnabled === 'true' && (
              <div className="lg:mt-0 mt-6">
                <NumberPad
                  value={editTransactionForm.amount}
                  onChange={(value) => setEditTransactionForm({ ...editTransactionForm, amount: value })}
                  onClear={() => setEditTransactionForm({ ...editTransactionForm, amount: '' })}
                  onSubmit={handleUpdateTransaction}
                  placeholder="0.00"
                  disabled={transactionProcessing}
                  maxLength={10}
                  onInputClick={() => {
                    // Focus on input field briefly to trigger any focus effects
                    const amountInput = document.getElementById('edit-amount') as HTMLInputElement
                    if (amountInput) {
                      amountInput.focus()
                      setTimeout(() => amountInput.blur(), 100)
                    }
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Wallet Dialog */}
        <Dialog open={showEditWallet} onOpenChange={setShowEditWallet}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل المحفظة</DialogTitle>
              <DialogDescription>
                عدل بيانات المحفظة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">اسم المحفظة</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-mobileNumber">رقم الموبايل</Label>
                <Input
                  id="edit-mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setEditForm({ ...editForm, mobileNumber: value })
                  }}
                />
              </div>

              <div>
                <Label>شعار المحفظة</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {predefinedLogos.map((logo, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={editForm.logo === logo ? "default" : "outline"}
                      className="h-12 text-lg"
                      onClick={() => setEditForm({ ...editForm, logo })}
                    >
                      {logo}
                    </Button>
                  ))}
                </div>
                <Input
                  className="mt-2"
                  value={editForm.logo}
                  onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                  placeholder="أو أدخل رابط صورة الشعار"
                />
              </div>

              <div>
                <Label htmlFor="edit-monthlyLimit">الحد الشهري للمعاملات (جنيه)</Label>
                <Input
                  id="edit-monthlyLimit"
                  type="number"
                  value={editForm.monthlyLimit}
                  onChange={(e) => setEditForm({ ...editForm, monthlyLimit: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-dailyLimit">الحد اليومي للمعاملات (جنيه)</Label>
                <Input
                  id="edit-dailyLimit"
                  type="number"
                  value={editForm.dailyLimit}
                  onChange={(e) => setEditForm({ ...editForm, dailyLimit: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-minBalanceAlert">تنبيه عند انخفاض الرصيد عن (جنيه)</Label>
                <Input
                  id="edit-minBalanceAlert"
                  type="number"
                  value={editForm.minBalanceAlert}
                  onChange={(e) => setEditForm({ ...editForm, minBalanceAlert: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-feeType">نوع الرسوم</Label>
                <Select value={editForm.feeType} onValueChange={(value) => setEditForm({ ...editForm, feeType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                    <SelectItem value="perThousand">لكل 1000 جنيه</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.feeType === 'percentage' && (
                <div>
                  <Label htmlFor="edit-feePercentage">نسبة الرسوم (%)</Label>
                  <Input
                    id="edit-feePercentage"
                    type="number"
                    step="0.1"
                    value={editForm.feePercentage}
                    onChange={(e) => setEditForm({ ...editForm, feePercentage: e.target.value })}
                  />
                </div>
              )}

              {editForm.feeType === 'perThousand' && (
                <div>
                  <Label htmlFor="edit-feePerThousand">الرسوم لكل 1000 جنيه</Label>
                  <Input
                    id="edit-feePerThousand"
                    type="number"
                    step="0.5"
                    value={editForm.feePerThousand}
                    onChange={(e) => setEditForm({ ...editForm, feePerThousand: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="edit-maxFeeAmount">أقصى رسوم (اختياري)</Label>
                <Input
                  id="edit-maxFeeAmount"
                  type="number"
                  step="0.5"
                  value={editForm.maxFeeAmount}
                  onChange={(e) => setEditForm({ ...editForm, maxFeeAmount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-minFeeAmount">أدنى رسوم (اختياري)</Label>
                <Input
                  id="edit-minFeeAmount"
                  type="number"
                  step="0.5"
                  value={editForm.minFeeAmount}
                  onChange={(e) => setEditForm({ ...editForm, minFeeAmount: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateWallet} disabled={walletProcessing} className="flex-1">
                  {walletProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  تحديث المحفظة
                </Button>
                <Button variant="outline" onClick={() => setShowEditWallet(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* No Wallet Dialog */}
        <AlertDialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>لا توجد محافظ نشطة</AlertDialogTitle>
              <AlertDialogDescription>
                يجب أن يكون لديك محفظة نشطة واحدة على الأقل لإضافة حركة مالية. هل ترغب في إضافة محفظة جديدة الآن؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddWalletFromDialog}>
                إضافة محفظة جديدة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )

  // Helper function to calculate total with fee
  function calculateTotalWithFee(walletId: string, amount: number): { fee: number; total: number } {
    const fee = calculateTransactionFee(walletId, amount)
    const total = amount + fee
    return { fee, total }
  }
}