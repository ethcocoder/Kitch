import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Download, Calendar } from "lucide-react";
import { exportDailyReportExcel, exportDailyReportPDF } from "../lib/exportUtils";

interface SaleRecord {
  id: string;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalAmount: number;
  totalCost: number;
  profit: number;
  saleDate: string;
  saleTime: any;
  notes?: string;
  category?: string;
}

interface DailyStats {
  date: string;
  totalItemsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  itemCount: number;
}

export function DailySalesLog() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [products, setProducts] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: selectedDate,
    totalItemsSold: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    itemCount: 0,
  });

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    notes: "",
    category: "",
  });

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const salesRef = collection(db, "daily_sales");
    const q = query(salesRef, where("saleDate", "==", selectedDate));
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SaleRecord[];

      setSales(salesList);

      // Calculate daily statistics
      const stats = {
        date: selectedDate,
        totalItemsSold: salesList.reduce((sum, s) => sum + s.quantity, 0),
        totalRevenue: salesList.reduce((sum, s) => sum + s.totalAmount, 0),
        totalCost: salesList.reduce((sum, s) => sum + s.totalCost, 0),
        totalProfit: salesList.reduce((sum, s) => sum + s.profit, 0),
        itemCount: salesList.length,
      };

      setDailyStats(stats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching daily sales:", error);
      setSales([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error("Please select a product and fill in all required fields");
      return;
    }

    try {
      const selectedProduct = products.find((p) => p.id === formData.productId);
      if (!selectedProduct) {
        toast.error("Product not found");
        return;
      }

      const totalAmount = formData.quantity * formData.unitPrice;
      const totalCost = formData.quantity * formData.unitCost;
      const profit = totalAmount - totalCost;

      // Record the sale
      await addDoc(collection(db, "daily_sales"), {
        productId: formData.productId,
        productName: selectedProduct.name,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        unitCost: formData.unitCost,
        totalAmount: totalAmount,
        totalCost: totalCost,
        profit: profit,
        category: selectedProduct.category,
        saleDate: selectedDate,
        saleTime: new Date(),
        notes: formData.notes,
      });

      // Update product stock and totals
      const newStock = selectedProduct.stock - formData.quantity;
      const newTotalSold = (selectedProduct.totalSold || 0) + formData.quantity;
      const newTotalProfit = (selectedProduct.totalProfit || 0) + profit;

      await updateDoc(doc(db, "products", formData.productId), {
        stock: Math.max(0, newStock),
        totalSold: newTotalSold,
        totalProfit: newTotalProfit,
        updatedAt: new Date(),
      });

      toast.success("Sale recorded successfully");
      setFormData({
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
        notes: "",
        category: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to record sale");
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale record?")) return;

    try {
      await deleteDoc(doc(db, "daily_sales", id));
      toast.success("Sale deleted successfully");
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
    }
  };

  const handleExportPDF = () => {
    if (sales.length === 0) {
      toast.error("No sales data to export");
      return;
    }

    const report = {
      date: selectedDate,
      totalItemsSold: dailyStats.totalItemsSold,
      totalRevenue: dailyStats.totalRevenue,
      totalCost: dailyStats.totalCost,
      totalProfit: dailyStats.totalProfit,
      items: sales,
    };

    exportDailyReportPDF(report);
    toast.success("Exported to PDF");
  };

  const handleExportExcel = () => {
    if (sales.length === 0) {
      toast.error("No sales data to export");
      return;
    }

    const report = {
      date: selectedDate,
      totalItemsSold: dailyStats.totalItemsSold,
      totalRevenue: dailyStats.totalRevenue,
      totalCost: dailyStats.totalCost,
      totalProfit: dailyStats.totalProfit,
      items: sales,
    };

    exportDailyReportExcel(report);
    toast.success("Exported to Excel");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">Daily Sales Log</h2>
          <p className="text-slate-400">Track daily sales and attendance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            PDF
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "Record Sale"}
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-slate-300">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Items Sold</p>
            <p className="text-2xl font-bold text-cyan-400">{dailyStats.totalItemsSold}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Different Products</p>
            <p className="text-2xl font-bold text-blue-400">{dailyStats.itemCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">{dailyStats.totalRevenue.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Cost</p>
            <p className="text-2xl font-bold text-orange-400">{dailyStats.totalCost.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Daily Profit</p>
            <p className="text-2xl font-bold text-yellow-400">{dailyStats.totalProfit.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
      </div>

      {/* Sale Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Record New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => {
                      const selected = products.find((p) => p.id === e.target.value);
                      if (selected) {
                        setFormData({
                          ...formData,
                          productId: e.target.value,
                          productName: selected.name,
                          unitPrice: selected.price,
                          unitCost: selected.cost || 0,
                          category: selected.category,
                        });
                      }
                    }}
                    className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Unit Price (ETB) *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Unit Cost (ETB)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              {formData.unitPrice > 0 && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-slate-400 text-sm">Total Amount</p>
                      <p className="text-xl font-bold text-green-400">
                        {(formData.quantity * formData.unitPrice).toFixed(2)} ETB
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Cost</p>
                      <p className="text-xl font-bold text-orange-400">
                        {(formData.quantity * formData.unitCost).toFixed(2)} ETB
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Profit</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {(formData.quantity * (formData.unitPrice - formData.unitCost)).toFixed(2)} ETB
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Margin</p>
                      <p className="text-xl font-bold text-purple-400">
                        {formData.unitPrice > 0
                          ? (((formData.unitPrice - formData.unitCost) / formData.unitPrice) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    {formData.productId && (
                      <div>
                        <p className="text-slate-400 text-sm">Available Stock</p>
                        <p className="text-xl font-bold text-blue-400">
                          {products.find((p) => p.id === formData.productId)?.stock || 0}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes about this sale"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-white placeholder-slate-500 rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg"
                >
                  Record Sale
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Today's Sales ({sales.length})</CardTitle>
          <CardDescription>All sales recorded for {selectedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No sales recorded for this date</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Qty</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Unit Price</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Cost</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Profit</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Time</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{sale.productName}</td>
                      <td className="py-3 px-4 text-slate-300">{sale.quantity}</td>
                      <td className="py-3 px-4 text-slate-300">{sale.unitPrice.toFixed(2)} ETB</td>
                      <td className="py-3 px-4 text-green-400 font-semibold">
                        {sale.totalAmount.toFixed(2)} ETB
                      </td>
                      <td className="py-3 px-4 text-orange-400">{sale.totalCost.toFixed(2)} ETB</td>
                      <td className="py-3 px-4 text-yellow-400 font-semibold">
                        {sale.profit.toFixed(2)} ETB
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {new Date(sale.saleTime?.toDate?.() || sale.saleTime).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
