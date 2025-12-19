"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Target
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface SummaryData {
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
  totalExpenses: number;
  netChange: number;
  transactionCount: number;
  expenseCount: number;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  mobileNumber: string;
}

export default function SummaryPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summaryData, setSummaryData] = useState<{
    daily: SummaryData | null;
    weekly: SummaryData | null;
    monthly: SummaryData | null;
    custom: SummaryData | null;
  }>({
    daily: null,
    weekly: null,
    monthly: null,
    custom: null
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (selectedWallet) {
      fetchSummaryData();
    }
  }, [selectedWallet, selectedDate]);

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallets");
      const data = await response.json();
      setWallets(data.filter((w: any) => !w.isArchived));
      if (data.length > 0 && !selectedWallet) {
        setSelectedWallet(data[0].id);
      }
    } catch (error) {
      toast.error("فشل في جلب المحافظ");
    }
  };

  const fetchSummaryData = async () => {
    if (!selectedWallet) return;
    
    setLoading(true);
    try {
      // Fetch daily summary
      const dailyResponse = await fetch(
        `/api/summary/daily?walletId=${selectedWallet}&date=${format(selectedDate, "yyyy-MM-dd")}`
      );
      const dailyData = await dailyResponse.json();

      // Fetch weekly summary
      const weeklyResponse = await fetch(
        `/api/summary/weekly?walletId=${selectedWallet}&date=${format(selectedDate, "yyyy-MM-dd")}`
      );
      const weeklyData = await weeklyResponse.json();

      // Fetch monthly summary
      const monthlyResponse = await fetch(
        `/api/summary/monthly?walletId=${selectedWallet}&date=${format(selectedDate, "yyyy-MM-dd")}`
      );
      const monthlyData = await monthlyResponse.json();

      setSummaryData({
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        custom: null
      });
    } catch (error) {
      toast.error("فشل في جلب بيانات الملخص");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ج.م`;
  };

  const SummaryCard = ({ title, value, icon: Icon, trend, color = "default" }: {
    title: string;
    value: string;
    icon: any;
    trend?: number;
    color?: "default" | "destructive" | "success";
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          color === "destructive" ? "text-red-600" : 
          color === "success" ? "text-green-600" : 
          ""
        }`}>
          {value}
        </div>
        {trend !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SummaryTable = ({ data }: { data: SummaryData | null }) => {
    if (!data) return <div className="text-center py-8">لا توجد بيانات متاحة</div>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="رصيد أول المدة"
            value={formatCurrency(data.openingBalance)}
            icon={Wallet}
          />
          <SummaryCard
            title="صافي التغير"
            value={formatCurrency(data.netChange)}
            icon={TrendingUp}
            color={data.netChange >= 0 ? "success" : "destructive"}
          />
          <SummaryCard
            title="رصيد آخر المدة"
            value={formatCurrency(data.closingBalance)}
            icon={DollarSign}
          />
          <SummaryCard
            title="إجمالي المعاملات"
            value={data.transactionCount.toString()}
            icon={Receipt}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="إجمالي الإيداعات"
            value={formatCurrency(data.totalDeposits)}
            icon={ArrowUpRight}
            color="success"
          />
          <SummaryCard
            title="إجمالي السحوبات"
            value={formatCurrency(data.totalWithdrawals)}
            icon={ArrowDownRight}
            color="destructive"
          />
          <SummaryCard
            title="إجمالي الرسوم"
            value={formatCurrency(data.totalFees)}
            icon={Target}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="إجمالي المصروفات"
            value={formatCurrency(data.totalExpenses)}
            icon={TrendingDown}
            color="destructive"
          />
          <SummaryCard
            title="عدد المصروفات"
            value={data.expenseCount.toString()}
            icon={CalendarIcon}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الملخص المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>رصيد أول المدة:</span>
                <span className="font-medium">{formatCurrency(data.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>+</span>
                <span>إجمالي الإيداعات:</span>
                <span className="font-medium text-green-600">{formatCurrency(data.totalDeposits)}</span>
              </div>
              <div className="flex justify-between">
                <span>-</span>
                <span>إجمالي السحوبات:</span>
                <span className="font-medium text-red-600">{formatCurrency(data.totalWithdrawals)}</span>
              </div>
              <div className="flex justify-between">
                <span>-</span>
                <span>إجمالي الرسوم:</span>
                <span className="font-medium text-red-600">{formatCurrency(data.totalFees)}</span>
              </div>
              <div className="flex justify-between">
                <span>-</span>
                <span>إجمالي المصروفات:</span>
                <span className="font-medium text-red-600">{formatCurrency(data.totalExpenses)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>=</span>
                <span>رصيد آخر المدة:</span>
                <span className={data.closingBalance >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(data.closingBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ملخص الأعمال</h1>
          <p className="text-muted-foreground">نظرة شاملة على الأداء المالي اليومي والأسبوعي والشهري</p>
        </div>
      </div>

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            اختيار المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المحفظة" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} - {wallet.balance.toLocaleString()} ج.م
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            اختيار التاريخ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            locale={ar}
          />
        </CardContent>
      </Card>

      {/* Summary Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">ملخص يومي</TabsTrigger>
          <TabsTrigger value="weekly">ملخص أسبوعي</TabsTrigger>
          <TabsTrigger value="monthly">ملخص شهري</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الملخص اليومي</CardTitle>
              <CardDescription>
                ملخص الأعمال ليوم {format(selectedDate, "dd MMMM yyyy", { locale: ar })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <SummaryTable data={summaryData.daily} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الملخص الأسبوعي</CardTitle>
              <CardDescription>
                ملخص الأعمال من يوم السبت إلى يوم الجمعة للأسبوع الحالي
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <SummaryTable data={summaryData.weekly} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الملخص الشهري</CardTitle>
              <CardDescription>
                ملخص الأعمال لشهر {format(selectedDate, "MMMM yyyy", { locale: ar })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <SummaryTable data={summaryData.monthly} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}