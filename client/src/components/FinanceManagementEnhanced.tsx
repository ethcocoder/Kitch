import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { exportMonthlyReportPDF, exportMonthlyReportExcel } from "../lib/exportUtils";

interface FinanceData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  completedOrders: number;
  pendingPayments: number;
  paidOrders: number;
  unpaidOrders: number;
  partialPayments: number;
  monthlyRevenue: { month: string; amount: number }[];
  categoryRevenue: { category: string; amount: number }[];
  paymentBreakdown: {
    paid: number;
    unpaid: number;
    partial: number;
  };
}

export function FinanceManagementEnhanced() {
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    completedOrders: 0,
    pendingPayments: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    partialPayments: 0,
    monthlyRevenue: [],
    categoryRevenue: [],
    paymentBreakdown: { paid: 0, unpaid: 0, partial: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: 0, category: "" });

  useEffect(() => {
    setLoading(true);
    const salesRef = collection(db, "daily_sales");
    
    const unsubscribe = onSnapshot(salesRef, (snapshot) => {
      const sales = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Filter sales for selected month
      const monthSales = sales.filter((sale) => {
        const saleMonth = sale.saleDate?.substring(0, 7) || (sale.saleTime ? new Date(sale.saleTime?.toDate?.() || sale.saleTime).toISOString().substring(0, 7) : "");
        return saleMonth === selectedMonth;
      });

      // Calculate metrics
      const totalRevenue = monthSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      const totalCost = monthSales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
      const netProfit = totalRevenue - totalCost;

      // In a real app, expenses would be fetched from an 'expenses' collection
      // For now, we use the totalCost from sales as the base for expenses
      const totalExpenses = totalCost;

      // Calculate monthly breakdown
      const monthlyData: { [key: string]: number } = {};
      sales.forEach((sale) => {
        const month = sale.saleDate?.substring(0, 7) || (sale.saleTime ? new Date(sale.saleTime?.toDate?.() || sale.saleTime).toISOString().substring(0, 7) : "");
        if (month) {
          monthlyData[month] = (monthlyData[month] || 0) + (sale.totalAmount || 0);
        }
      });

      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      // Category revenue based on actual data
      const catData: { [key: string]: number } = {};
      monthSales.forEach((sale) => {
        const cat = sale.category || "General";
        catData[cat] = (catData[cat] || 0) + (sale.totalAmount || 0);
      });
      const categoryRevenue = Object.entries(catData).map(([category, amount]) => ({ category, amount }));

      setFinanceData({
        totalRevenue,
        totalExpenses,
        netProfit,
        completedOrders: monthSales.length,
        pendingPayments: 0,
        paidOrders: monthSales.length,
        unpaidOrders: 0,
        partialPayments: 0,
        monthlyRevenue,
        categoryRevenue,
        paymentBreakdown: {
          paid: monthSales.length,
          unpaid: 0,
          partial: 0,
        },
      });

      // No expenses collection yet, so we'll show an empty list or actual cost breakdown if available
      setExpenses([]);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching finance data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedMonth]);

  const handleExportMonthlyPDF = () => {
    const report = {
      month: new Date(selectedMonth + "-01").toLocaleString("en-US", { month: "long" }),
      year: parseInt(selectedMonth.split("-")[0]),
      totalItemsSold: financeData.completedOrders,
      totalRevenue: financeData.totalRevenue,
      totalCost: financeData.totalExpenses,
      totalProfit: financeData.netProfit,
      dailyBreakdown: financeData.monthlyRevenue.map((item) => ({
        date: item.month,
        totalItemsSold: 0,
        totalRevenue: item.amount,
        totalCost: 0,
        totalProfit: 0,
      })),
    };

    exportMonthlyReportPDF(report);
    toast.success("Monthly report exported to PDF");
  };

  const handleExportMonthlyExcel = () => {
    const report = {
      month: new Date(selectedMonth + "-01").toLocaleString("en-US", { month: "long" }),
      year: parseInt(selectedMonth.split("-")[0]),
      totalItemsSold: financeData.completedOrders,
      totalRevenue: financeData.totalRevenue,
      totalCost: financeData.totalExpenses,
      totalProfit: financeData.netProfit,
      dailyBreakdown: financeData.monthlyRevenue.map((item) => ({
        date: item.month,
        totalItemsSold: 0,
        totalRevenue: item.amount,
        totalCost: 0,
        totalProfit: 0,
      })),
    };

    exportMonthlyReportExcel(report);
    toast.success("Monthly report exported to Excel");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const profitMargin = financeData.totalRevenue > 0
    ? ((financeData.netProfit / financeData.totalRevenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">Finance Management</h2>
          <p className="text-slate-400">Comprehensive financial overview and reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportMonthlyExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            Excel
          </Button>
          <Button
            onClick={handleExportMonthlyPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-slate-300">
              {new Date(selectedMonth + "-01").toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  {(financeData.totalRevenue / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-500 mt-1">ETB</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-red-400">
                  {(financeData.totalExpenses / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-500 mt-1">ETB</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Net Profit</p>
                <p className={`text-3xl font-bold ${financeData.netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {(financeData.netProfit / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-500 mt-1">ETB</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Profit Margin</p>
                <p className="text-3xl font-bold text-purple-400">{profitMargin}%</p>
                <p className="text-xs text-slate-500 mt-1">ROI</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order & Payment Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Completed Orders</span>
              <span className="text-green-400 font-bold">{financeData.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Pending Payments</span>
              <span className="text-yellow-400 font-bold">0 ETB</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Paid</span>
              <span className="text-green-400 font-bold">{financeData.paidOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Unpaid</span>
              <span className="text-red-400 font-bold">{financeData.unpaidOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Partial</span>
              <span className="text-yellow-400 font-bold">{financeData.partialPayments}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-lg">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-slate-300 mb-1">Payment Collection</p>
              <p className="text-2xl font-bold text-green-400">
                {financeData.paidOrders + financeData.partialPayments > 0
                  ? (
                      ((financeData.paidOrders + financeData.partialPayments) /
                        (financeData.paidOrders + financeData.unpaidOrders + financeData.partialPayments)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Monthly Revenue</CardTitle>
          <CardDescription>Revenue trend over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {financeData.monthlyRevenue.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No revenue data available</p>
          ) : (
            <div className="space-y-3">
              {financeData.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-slate-300 w-20">{item.month}</span>
                  <div className="flex-1 bg-slate-700 rounded-lg h-8 mx-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
                      style={{
                        width: `${
                          (item.amount / Math.max(...financeData.monthlyRevenue.map((m) => m.amount), 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-green-400 font-bold w-24 text-right">
                    {(item.amount / 1000).toFixed(1)}K ETB
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Revenue */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Revenue by Category</CardTitle>
          <CardDescription>Sales breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          {financeData.categoryRevenue.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No category data available</p>
          ) : (
            <div className="space-y-3">
              {financeData.categoryRevenue.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-slate-300">{item.category}</span>
                  <div className="flex-1 bg-slate-700 rounded-lg h-6 mx-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                      style={{
                        width: `${
                          (item.amount / Math.max(...financeData.categoryRevenue.map((c) => c.amount), 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-purple-400 font-bold w-24 text-right">
                    {(item.amount / 1000).toFixed(1)}K ETB
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Monthly Expenses</CardTitle>
          <CardDescription>All expenses for {new Date(selectedMonth + "-01").toLocaleString("en-US", { month: "long", year: "numeric" })}</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No expenses recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{expense.description}</td>
                      <td className="py-3 px-4 text-slate-300">{expense.category}</td>
                      <td className="py-3 px-4 text-red-400 font-semibold">
                        {expense.amount.toFixed(0)} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
