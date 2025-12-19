'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  AlertCircle, 
  Wallet, 
  Home,
  RefreshCw,
  Loader2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import NumberPad from '@/components/ui/number-pad'

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
  referenceId?: string
  date: string
  createdAt: string
}

interface Wallet {
  id: string
  name: string
  mobileNumber: string
  balance: number
  logo?: string
}

interface Transfer {
  id: string
  fromWalletId?: string
  toWalletId?: string
  fromCashTreasury: boolean
  toCashTreasury: boolean
  amount: number
  description: string
  date: string
  createdAt: string
  fromWallet?: Wallet
  toWallet?: Wallet
}

export default function CashTreasuryManagement() {
  const [cashTreasury, setCashTreasury] = useState<CashTreasury | null>(null)
  const [transactions, setTransactions] = useState<CashTreasuryTransaction[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState('')
  const [appSettings, setAppSettings] = useState({
    numberPadEnabled: 'false'
  })

  // Form states
  const [transactionForm, setTransactionForm] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  const [transferForm, setTransferForm] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: '',
    fromCashTreasury: false,
    toCashTreasury: false
  })

  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [processing, setProcessing] = useState(false)

  const router = useRouter()

  // Calculate monthly return rate
  const calculateMonthlyReturnRate = () => {
    if (!cashTreasury || cashTreasury.totalDeposits === 0) return 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = transactions.filter(t => {
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

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cashTreasuryResponse, transactionsResponse, transfersResponse, walletsResponse, settingsResponse] = await Promise.all([
          fetch('/api/cash-treasury'),
          fetch('/api/cash-treasury/transactions'),
          fetch('/api/transfers'),
          fetch('/api/wallets'),
          fetch('/api/settings')
        ])
        
        if (cashTreasuryResponse.ok && transactionsResponse.ok && transfersResponse.ok && walletsResponse.ok && settingsResponse.ok) {
          const [cashTreasuryData, transactionsData, transfersData, walletsData, settingsData] = await Promise.all([
            cashTreasuryResponse.json(),
            transactionsResponse.json(),
            transfersResponse.json(),
            walletsResponse.json(),
            settingsResponse.json()
          ])
          setCashTreasury(cashTreasuryData)
          setTransactions(transactionsData)
          setTransfers(transfersData)
          setWallets(walletsData.filter((w: Wallet) => !w.isArchived))
          setAppSettings({
            numberPadEnabled: settingsData.numberPadEnabled || 'false'
          })
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

  const handleAddTransaction = async () => {
    if (!transactionForm.amount) {
      setAlertMessage('يرجى إدخال المبلغ')
      return
    }

    const amount = parseFloat(transactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    if (transactionForm.type === 'withdrawal' && cashTreasury && cashTreasury.balance < amount) {
      setAlertMessage('رصيد خزينة الكاش غير كافي')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/cash-treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transactionForm.type,
          amount,
          description: transactionForm.description || `${transactionForm.type === 'deposit' ? 'إيداع' : 'سحب'} في خزينة الكاش`
        })
      })

      if (response.ok) {
        const updatedCashTreasury = await response.json()
        setCashTreasury(updatedCashTreasury)
        
        // Reload transactions
        const transactionsResponse = await fetch('/api/cash-treasury/transactions')
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()
          setTransactions(transactionsData)
        }
        
        setTransactionForm({ type: 'deposit', amount: '', description: '' })
        setShowTransactionDialog(false)
        setAlertMessage('تمت إضافة الحركة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء إضافة الحركة')
    } finally {
      setProcessing(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferForm.amount) {
      setAlertMessage('يرجى إدخال المبلغ')
      return
    }

    const amount = parseFloat(transferForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage('يرجى إدخال مبلغ صحيح')
      return
    }

    if (!transferForm.fromWalletId && !transferForm.fromCashTreasury) {
      setAlertMessage('يرجى تحديد مصدر التحويل')
      return
    }

    if (!transferForm.toWalletId && !transferForm.toCashTreasury) {
      setAlertMessage('يرجى تحديد وجهة التحويل')
      return
    }

    if (transferForm.fromWalletId === transferForm.toWalletId) {
      setAlertMessage('لا يمكن التحويل إلى نفس المحفظة')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWalletId: transferForm.fromWalletId || null,
          toWalletId: transferForm.toWalletId || null,
          amount,
          description: transferForm.description || 'تحويل أموال',
          fromCashTreasury: transferForm.fromCashTreasury,
          toCashTreasury: transferForm.toCashTreasury
        })
      })

      if (response.ok) {
        const transfer = await response.json()
        
        // Reload data
        const [cashTreasuryResponse, transfersResponse, walletsResponse] = await Promise.all([
          fetch('/api/cash-treasury'),
          fetch('/api/transfers'),
          fetch('/api/wallets')
        ])
        
        if (cashTreasuryResponse.ok && transfersResponse.ok && walletsResponse.ok) {
          const [cashTreasuryData, transfersData, walletsData] = await Promise.all([
            cashTreasuryResponse.json(),
            transfersResponse.json(),
            walletsResponse.json()
          ])
          setCashTreasury(cashTreasuryData)
          setTransfers(transfersData)
          setWallets(walletsData.filter((w: Wallet) => !w.isArchived))
        }
        
        setTransferForm({ fromWalletId: '', toWalletId: '', amount: '', description: '', fromCashTreasury: false, toCashTreasury: false })
        setShowTransferDialog(false)
        setAlertMessage('تم التحويل بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء التحويل')
    } finally {
      setProcessing(false)
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

  const monthlyReturnRate = calculateMonthlyReturnRate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">إدارة خزينة الكاش</h1>
              <p className="text-muted-foreground mt-1">إدارة خزينة الكاش والتحويلات بين المحافظ</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </Button>
              <Button
                onClick={() => setShowTransactionDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>حركة خزينة</span>
              </Button>
              <Button
                onClick={() => setShowTransferDialog(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>تحويل</span>
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
              <CardTitle className="text-sm font-medium">رصيد خزينة الكاش</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashTreasury?.balance.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيداعات</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashTreasury?.totalDeposits.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي السحوبات</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashTreasury?.totalWithdrawals.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة العائد الشهري</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyReturnRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">حركات خزينة الكاش</TabsTrigger>
            <TabsTrigger value="transfers">التحويلات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>حركات خزينة الكاش</CardTitle>
                <CardDescription>سجل جميع حركات خزينة الكاش</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد حركات حالياً</p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {transaction.type === 'deposit' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} جنيه
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات</CardTitle>
                <CardDescription>سجل جميع التحويلات بين المحافظ وخزينة الكاش</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {transfers.length === 0 ? (
                      <div className="text-center py-8">
                        <ArrowLeftRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد تحويلات حالياً</p>
                      </div>
                    ) : (
                      transfers.map((transfer) => (
                        <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100">
                              <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{transfer.description}</p>
                              <p className="text-sm text-muted-foreground">
                                من: {transfer.fromCashTreasury ? 'خزينة الكاش' : transfer.fromWallet?.name} → 
                                إلى: {transfer.toCashTreasury ? 'خزينة الكاش' : transfer.toWallet?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transfer.date).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {transfer.amount.toLocaleString()} جنيه
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              تحويل
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Transaction Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة حركة خزينة</DialogTitle>
              <DialogDescription>
                إضافة إيداع أو سحب من خزينة الكاش
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  النوع
                </Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value: 'deposit' | 'withdrawal') => 
                    setTransactionForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">إيداع</SelectItem>
                    <SelectItem value="withdrawal">سحب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  المبلغ
                </Label>
                <div className="col-span-3">
                  {appSettings.numberPadEnabled === 'true' ? (
                    <NumberPad
                      value={transactionForm.amount}
                      onChange={(value) => setTransactionForm(prev => ({ ...prev, amount: value }))}
                      placeholder="أدخل المبلغ"
                    />
                  ) : (
                    <Input
                      id="amount"
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="أدخل المبلغ"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  الوصف
                </Label>
                <Textarea
                  id="description"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف الحركة (اختياري)"
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddTransaction} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>تحويل أموال</DialogTitle>
              <DialogDescription>
                تحويل الأموال بين المحافظ وخزينة الكاش
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fromSource" className="text-right">
                  من
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    value={transferForm.fromCashTreasury ? 'cash-treasury' : transferForm.fromWalletId}
                    onValueChange={(value) => {
                      if (value === 'cash-treasury') {
                        setTransferForm(prev => ({ ...prev, fromCashTreasury: true, fromWalletId: '' }))
                      } else {
                        setTransferForm(prev => ({ ...prev, fromCashTreasury: false, fromWalletId: value }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المصدر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash-treasury">خزينة الكاش</SelectItem>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.balance.toLocaleString()} جنيه)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="toDestination" className="text-right">
                  إلى
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    value={transferForm.toCashTreasury ? 'cash-treasury' : transferForm.toWalletId}
                    onValueChange={(value) => {
                      if (value === 'cash-treasury') {
                        setTransferForm(prev => ({ ...prev, toCashTreasury: true, toWalletId: '' }))
                      } else {
                        setTransferForm(prev => ({ ...prev, toCashTreasury: false, toWalletId: value }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الوجهة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash-treasury">خزينة الكاش</SelectItem>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.balance.toLocaleString()} جنيه)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferAmount" className="text-right">
                  المبلغ
                </Label>
                <div className="col-span-3">
                  {appSettings.numberPadEnabled === 'true' ? (
                    <NumberPad
                      value={transferForm.amount}
                      onChange={(value) => setTransferForm(prev => ({ ...prev, amount: value }))}
                      placeholder="أدخل المبلغ"
                    />
                  ) : (
                    <Input
                      id="transferAmount"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="أدخل المبلغ"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferDescription" className="text-right">
                  الوصف
                </Label>
                <Textarea
                  id="transferDescription"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف التحويل (اختياري)"
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleTransfer} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                تحويل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}