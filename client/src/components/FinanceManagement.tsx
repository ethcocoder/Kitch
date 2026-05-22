import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { toast } from "sonner";

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

export function FinanceManagement() {
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
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: 0, category: "" });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      // Fetch all orders
      const ordersRef = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersRef);
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Fetch all products for category revenue
      const productsRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Calculate revenue metrics
      const completedOrders = orders.filter((o) => o.status === "completed");
      const totalRevenue = completedOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
      const unpaidOrders = orders.filter((o) => o.paymentStatus === "unpaid").length;
      const partialPayments = orders.filter((o) => o.paymentStatus === "partial").length;
      const pendingPayments = orders
        .filter((o) => o.paymentStatus !== "paid")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Calculate monthly revenue
      const monthlyData: { [key: string]: number } = {};
      orders.forEach((order) => {
        if (order.status === "completed" && order.paymentStatus === "paid") {
          const date = new Date(order.orderDate?.toDate?.() || order.orderDate);
          const monthKey = date.toISOString().slice(0, 7);
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (order.totalAmount || 0);
        }
      });

      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      // Calculate category revenue
      const categoryData: { [key: string]: number } = {};
      orders.forEach((order) => {
        if (order.status === "completed" && order.paymentStatus === "paid") {
          order.items?.forEach((item: any) => {
            const product = products.find((p) => p.id === item.productId);
            const category = product?.category || "Uncategorized";
            categoryData[category] = (categoryData[category] || 0) + (item.total || 0);
          });
        }
      });

      const categoryRevenue = Object.entries(categoryData)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Calculate expenses (mock data for now)
      const totalExpenses = 50000; // Mock expense
      const netProfit = totalRevenue - totalExpenses;

      setFinanceData({
        totalRevenue,
        totalExpenses,
        netProfit,
        completedOrders: completedOrders.length,
        pendingPayments,
        paidOrders,
        unpaidOrders,
        partialPayments,
        monthlyRevenue,
        categoryRevenue,
        paymentBreakdown: {
          paid: paidOrders,
          unpaid: unpaidOrders,
          partial: partialPayments,
        },
      });

      // Mock expenses
      setExpenses([
        { id: 1, description: "Rent", amount: 15000, category: "Rent", date: new Date() },
        { id: 2, description: "Utilities", amount: 5000, category: "Utilities", date: new Date() },
        { id: 3, description: "Staff Salary", amount: 30000, category: "Payroll", date: new Date() },
      ]);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast.error("Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || expenseForm.amount <= 0 || !expenseForm.category) {
      toast.error("Please fill in all expense fields");
      return;
    }

    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      date: new Date(),
    };

    setExpenses([...expenses, newExpense]);
    setExpenseForm({ description: "", amount: 0, category: "" });
    toast.success("Expense added successfully");
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
      <div>
        <h2 className="text-3xl font-bold text-cyan-400">Finance Management</h2>
        <p className="text-slate-400">Comprehensive financial overview and reports</p>
      </div>

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
              <span className="text-yellow-400 font-bold">{financeData.pendingPayments.toFixed(0)} ETB</span>
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
                          (item.amount / Math.max(...financeData.monthlyRevenue.map((m) => m.amount))) * 100
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
                          (item.amount / Math.max(...financeData.categoryRevenue.map((c) => c.amount))) * 100
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

      {/* Expense Management */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Expense Management</CardTitle>
          <CardDescription>Track and manage business expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="bg-slate-700 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-white">Add New Expense</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <Input
                type="text"
                placeholder="Description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <Input
                type="text"
                placeholder="Category"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <Input
                type="number"
                placeholder="Amount (ETB)"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                Add Expense
              </Button>
            </div>
          </form>

          {/* Expenses Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white">{expense.description}</td>
                    <td className="py-3 px-4 text-slate-300">{expense.category}</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">{expense.amount.toFixed(2)} ETB</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Expenses */}
          <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Total Expenses This Month:</span>
            <span className="text-red-400 font-bold text-xl">
              {expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)} ETB
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-300">Total Revenue</span>
                <span className="text-green-400 font-bold">{financeData.totalRevenue.toFixed(0)} ETB</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-300">Total Expenses</span>
                <span className="text-red-400 font-bold">{financeData.totalExpenses.toFixed(0)} ETB</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-300">Pending Payments</span>
                <span className="text-yellow-400 font-bold">{financeData.pendingPayments.toFixed(0)} ETB</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-500/20 rounded-lg p-3">
                <p className="text-slate-300 text-sm">Net Profit</p>
                <p className={`text-2xl font-bold ${financeData.netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {financeData.netProfit.toFixed(0)} ETB
                </p>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-3">
                <p className="text-slate-300 text-sm">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-400">{profitMargin}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
