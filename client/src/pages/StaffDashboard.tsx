import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  LogOut,
  Menu,
  X,
  ShoppingCart,
  TrendingUp,
  Package,
  BarChart3,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  totalSold?: number;
  totalProfit?: number;
}

interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  saleTime: any;
}

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // If admin, redirect to admin dashboard
            if (data.role === "admin") {
              window.location.href = "/admin-dashboard";
            }

            // If not approved, redirect to approval waiting
            if (data.status !== "approved") {
              window.location.href = "/approval-waiting";
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading user data");
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Load products and sales data
  useEffect(() => {
    if (!user?.uid) return;

    // Combined listener for products and initial data loading
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);

      // Calculate stats
      const lowStock = productsList.filter((p) => p.stock < 5).length;
      setStats((prev) => ({
        ...prev,
        totalProducts: productsList.length,
        lowStockItems: lowStock,
      }));
      
      // Once products are loaded, we can stop the initial loading screen
      setLoading(false);
    }, (error) => {
      console.error("Error loading products:", error);
      setLoading(false);
    });

    const q = query(collection(db, "daily_sales"), where("saleDate", "==", selectedDate));
    const unsubscribeSales = onSnapshot(q, (snapshot) => {
      const salesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SaleRecord[];
      setSales(salesList);

      const todayRevenue = salesList.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      setStats((prev) => ({
        ...prev,
        todaySales: salesList.length,
        totalRevenue: todayRevenue,
      }));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, [user, selectedDate]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6 space-y-8">
          {/* Logo/Title */}
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Kitch Staff</h1>
            <p className="text-slate-400 text-sm">Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </div>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "products"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                Products
              </div>
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "sales"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Daily Sales
              </div>
            </button>
          </nav>

          {/* User Info */}
          <div className="pt-8 border-t border-slate-700">
            <div className="mb-4">
              <p className="text-slate-400 text-sm">Logged in as</p>
              <p className="text-white font-semibold">{user?.displayName}</p>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white flex gap-2 justify-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-cyan-400 hover:bg-slate-800 p-2 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-2xl font-bold text-cyan-400">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "products" && "Products"}
                {activeTab === "sales" && "Daily Sales"}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Welcome back!</h2>
                <p className="text-slate-400">Here's a quick overview of your shop</p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total Products</p>
                        <p className="text-3xl font-bold text-cyan-400">{stats.totalProducts}</p>
                      </div>
                      <Package className="w-12 h-12 text-cyan-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Low Stock Items</p>
                        <p className="text-3xl font-bold text-yellow-400">{stats.lowStockItems}</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-yellow-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Today's Sales</p>
                        <p className="text-3xl font-bold text-green-400">{stats.todaySales}</p>
                      </div>
                      <ShoppingCart className="w-12 h-12 text-green-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Today's Revenue</p>
                        <p className="text-3xl font-bold text-purple-400">
                          {stats.totalRevenue.toFixed(0)} ETB
                        </p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-purple-400/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Info */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Your Role</p>
                      <p className="text-white font-semibold capitalize">{userData?.role || "Staff"}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Status</p>
                      <p className="text-green-400 font-semibold capitalize">{userData?.status || "Active"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Products</h2>
                <p className="text-slate-400">View all available products and stock levels</p>
              </div>

              {/* Products Table */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Product Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Product Name</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Category</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Price</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Stock</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Sold</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No products available
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                              <td className="py-3 px-4 text-slate-300">{product.category}</td>
                              <td className="py-3 px-4 text-green-400 font-semibold">{product.price} ETB</td>
                              <td className="py-3 px-4 text-blue-400 font-semibold">{product.stock}</td>
                              <td className="py-3 px-4 text-purple-400 font-semibold">{product.totalSold || 0}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    product.stock > 10
                                      ? "bg-green-500/20 text-green-400"
                                      : product.stock > 0
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Daily Sales</h2>
                <p className="text-slate-400">View sales records for the selected date</p>
              </div>

              {/* Date Selector */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <label className="text-slate-300 font-medium">Select Date:</label>
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

              {/* Sales Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.todaySales}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">{stats.totalRevenue.toFixed(0)} ETB</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Average Sale</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {stats.todaySales > 0 ? (stats.totalRevenue / stats.todaySales).toFixed(0) : 0} ETB
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Table */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Sales Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Product</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quantity</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Unit Price</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Total Amount</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No sales recorded for this date
                            </td>
                          </tr>
                        ) : (
                          sales.map((sale) => (
                            <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 px-4 text-white font-medium">{sale.productName}</td>
                              <td className="py-3 px-4 text-slate-300">{sale.quantity}</td>
                              <td className="py-3 px-4 text-green-400 font-semibold">{sale.unitPrice} ETB</td>
                              <td className="py-3 px-4 text-cyan-400 font-bold">{sale.totalAmount.toFixed(0)} ETB</td>
                              <td className="py-3 px-4 text-slate-400">
                                {sale.saleTime
                                  ? new Date(sale.saleTime?.toDate?.() || sale.saleTime).toLocaleTimeString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
