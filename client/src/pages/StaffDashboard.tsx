import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { StaffProductManagement } from "../components/StaffProductManagement";
import { StaffDailySalesLog } from "../components/StaffDailySalesLog";

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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalRevenue: 0,
  });

  // Handle responsive sidebar initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            if (data.role === "admin") {
              window.location.href = "/admin-dashboard";
            }

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

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);

      const lowStock = productsList.filter((p) => p.stock < 5).length;
      setStats((prev) => ({
        ...prev,
        totalProducts: productsList.length,
        lowStockItems: lowStock,
      }));
      
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "sales", label: "Daily Sales", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-cyan-400">Kitch Staff</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-cyan-400 p-2 hover:bg-slate-800 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

        {/* Sidebar Overlay for Mobile removed as requested */}

      <style>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-[55] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 hidden lg:block">
            <h1 className="text-2xl font-bold text-cyan-400">Kitch Staff</h1>
            <p className="text-slate-400 text-sm">Dashboard</p>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(100, 116, 139, 0.5) transparent'
          }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-cyan-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-800 mt-auto">
            <div className="mb-4 px-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Staff Member</p>
              <p className="text-white font-semibold truncate">{user?.displayName || user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full flex gap-2 justify-center items-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">Welcome back!</h2>
                <p className="text-slate-400">Here's your shop overview for today</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Products</p>
                        <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.totalProducts}</p>
                      </div>
                      <Package className="w-10 h-10 text-cyan-400/20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Low Stock</p>
                        <p className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.lowStockItems}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-yellow-400/20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Sales</p>
                        <p className="text-2xl md:text-3xl font-bold text-green-400">{stats.todaySales}</p>
                      </div>
                      <ShoppingCart className="w-10 h-10 text-green-400/20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Revenue</p>
                        <p className="text-2xl md:text-3xl font-bold text-purple-400 truncate">
                          {stats.totalRevenue.toFixed(0)} ETB
                        </p>
                      </div>
                      <BarChart3 className="w-10 h-10 text-purple-400/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400 text-lg">Staff Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Your Role</p>
                      <p className="text-white font-semibold capitalize">{userData?.role || "Staff"}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Status</p>
                      <p className="text-green-400 font-semibold capitalize">{userData?.status || "Active"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StaffProductManagement />
            </div>
          )}

          {activeTab === "sales" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StaffDailySalesLog />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
