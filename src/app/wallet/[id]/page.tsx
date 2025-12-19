'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Edit, Trash2, ArrowLeft, Loader2, Smartphone, DollarSign, Calendar, Eye } from 'lucide-react'

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

export default function WalletDetail() {
  const params = useParams()
  const router = useRouter()
  const walletId = params.id as string

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTransaction, setShowTransaction] = useState(false)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [transactionForm, setTransactionForm] = useState({
    walletId: walletId,
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  const [editTransactionForm, setEditTransactionForm] = useState({
    walletId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  // Calculate fee for a transaction
  const calculateTransactionFee = (amount: number): number => {
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
    return maxFeeAmount > 0 ? Math.min(calculatedFee, maxFeeAmount) : calculatedFee
  }

  // Get fee description for display
  const getFeeDescription = (): string => {
    if (!wallet) return 'لا توجد رسوم'
    
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

  // Calculate monthly statistics for this wallet
  const calculateWalletMonthlyStats = () => {
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
      year: currentYear,
      remainingLimit: Math.max(0, 200000 - monthlyLimit)
    }
  }

  const walletStats = useMemo(() => calculateWalletMonthlyStats(), [transactions, walletId])

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [walletResponse, transactionsResponse] = await Promise.all([
          fetch(`/api/wallets/${walletId}`),
          fetch('/api/transactions')
        ])
        
        if (walletResponse.ok && transactionsResponse.ok) {
          const [walletData, transactionsData] = await Promise.all([
            walletResponse.json(),
            transactionsResponse.json()
          ])
          setWallet(walletData)
          setTransactions(transactionsData.filter((t: Transaction) => t.walletId === walletId))
        } else {
          setAlertMessage('المحفظة غير موجودة')
          router.push('/')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setAlertMessage('حدث خطأ أثناء تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    if (walletId) {
      loadData()
    }
  }, [walletId, router])

  // Clear alert message after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  const handleAddTransaction = async () => {
    if (!transactionForm.amount) {
      setAlertMessage('يرجى ملء الحقول المطلوبة')
      return
    }

    const amount = parseFloat(transactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    // Check monthly limit for this wallet
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
          amount,
          description: transactionForm.description || 'حركة مالية'
        })
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions([...transactions, newTransaction])
        
        // Update wallet balance
        if (wallet) {
          const newBalance = wallet.balance + (transactionForm.type === 'deposit' ? amount : -amount)
          const newFees = wallet.totalFeesEarned + newTransaction.feeAmount
          setWallet({ ...wallet, balance: newBalance, totalFeesEarned: newFees })
        }
        
        setTransactionForm({ walletId, type: 'deposit', amount: '', description: '' })
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
        if (deletedTransaction && wallet) {
          // Update wallet balance
          const newBalance = wallet.balance - (deletedTransaction.type === 'deposit' ? deletedTransaction.amount : -deletedTransaction.amount)
          const newFees = wallet.totalFeesEarned - deletedTransaction.feeAmount
          setWallet({ ...wallet, balance: newBalance, totalFeesEarned: newFees })
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
    if (!editTransactionForm.amount) {
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
      const response = await fetch(`/api/transactions/${editingTransaction!.id}`, {
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
        
        // Recalculate wallet balance
        if (wallet) {
          // Remove old transaction impact
          const oldBalance = wallet.balance - (editingTransaction!.type === 'deposit' ? editingTransaction!.amount : -editingTransaction!.amount)
          const oldFees = wallet.totalFeesEarned - editingTransaction!.feeAmount
          
          // Add new transaction impact
          const newBalance = oldBalance + (editTransactionForm.type === 'deposit' ? amount : -amount)
          const newFees = oldFees + updatedTransaction.feeAmount
          
          setWallet({ ...wallet, balance: newBalance, totalFeesEarned: newFees })
        }
        
        setTransactions(transactions.map(t => t.id === editingTransaction!.id ? updatedTransaction : t))
        setEditTransactionForm({ walletId, type: 'deposit', amount: '', description: '' })
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

  if (!wallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">المحفظة غير موجودة</p>
          <Button onClick={() => router.push('/')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{wallet.logo || '🏦'}</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{wallet.name}</h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  {wallet.mobileNumber}
                </p>
              </div>
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
              <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet.balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إيداع هذا الشهر</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletStats.totalDeposits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سحب هذا الشهر</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletStats.totalWithdrawals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الرسوم المكتسبة</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet.totalFeesEarned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Limit Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>الحد الشهري للمحفظة</CardTitle>
            <CardDescription>
              الحد الأقصى للمعاملات الشهرية: 200,000 جنيه
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>المستخدم</span>
                <span>{walletStats.monthlyLimit.toLocaleString()} جنيه</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>المتبقي</span>
                <span>{walletStats.remainingLimit.toLocaleString()} جنيه</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (walletStats.monthlyLimit / 200000) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {walletStats.transactionCount} معاملة في {walletStats.monthName} {walletStats.year}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  سجل الحركات
                </CardTitle>
                <CardDescription>
                  جميع الحركات المالية لهذه المحفظة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">لا توجد حركات</p>
                    <p className="text-muted-foreground mb-4">قم بإضافة حركة جديدة لبدء تسجيل المعاملات</p>
                    <Button onClick={() => setShowTransaction(true)}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة حركة جديدة
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                                  {transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                              <p className="font-medium">
                                {transaction.amount.toLocaleString()} جنيه
                              </p>
                              {transaction.feeAmount > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  الرسوم: {transaction.feeAmount.toFixed(2)} جنيه
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {transaction.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف هذه الحركة؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                  onClick={() => setShowTransaction(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة حركة جديدة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 ml-2" />
                  عرض جميع المحافظ
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المحفظة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">نوع الرسوم</p>
                  <p className="font-medium">{getFeeDescription()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">
                    {new Date(wallet.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإيداعات</p>
                  <p className="font-medium">{wallet.totalDeposits.toLocaleString()} جنيه</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي السحوبات</p>
                  <p className="font-medium">{wallet.totalWithdrawals.toLocaleString()} جنيه</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Transaction Dialog */}
        <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة حركة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات الحركة المالية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  type="number"
                  inputMode="numeric"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setTransactionForm({ ...transactionForm, amount: value })
                  }}
                  placeholder="0.00"
                />
                {transactionForm.amount && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {(() => {
                      const amount = parseFloat(transactionForm.amount)
                      if (!isNaN(amount) && amount > 0) {
                        const fee = calculateTransactionFee(amount)
                        const total = amount + fee
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
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog open={showEditTransaction} onOpenChange={setShowEditTransaction}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل الحركة</DialogTitle>
              <DialogDescription>
                عدل بيانات الحركة المالية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  type="number"
                  inputMode="numeric"
                  step="0.01"
                  value={editTransactionForm.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setEditTransactionForm({ ...editTransactionForm, amount: value })
                  }}
                  placeholder="0.00"
                />
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}