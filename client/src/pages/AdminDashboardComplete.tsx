import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AdminSidebar } from "../components/AdminSidebar";
import { ProductManagementEnhanced } from "../components/ProductManagementEnhanced";
import { FinanceManagementEnhanced } from "../components/FinanceManagementEnhanced";
import { DailySalesLog } from "../components/DailySalesLog";
import { OrderManagement } from "../components/OrderManagement";
import { UserManagementEnhanced } from "../components/UserManagementEnhanced";
import { HRManagement } from "../components/HRManagement";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import {
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from "lucide-react";

export function AdminDashboardComplete() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    totalProducts: 0,
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    
    // Check admin status
    getDoc(doc(db, "users", user.uid)).then((userDoc) => {
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        window.location.href = "/user-dashboard";
        return;
      }

      // Real-time users
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pending = allUsers.filter((u: any) => u.status === "pending");
        setPendingUsers(pending);
        
        setStats(prev => ({
          ...prev,
          totalUsers: allUsers.length,
          pendingApprovals: pending.length,
        }));
      });

      // Real-time employees
      const unsubscribeEmployees = onSnapshot(collection(db, "employees"), (snapshot) => {
        setStats(prev => ({
          ...prev,
          activeEmployees: snapshot.docs.filter(d => d.data().status === "active").length,
        }));
      });

      // Real-time products
      const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
        setStats(prev => ({
          ...prev,
          totalProducts: snapshot.size,
        }));
      });

      // Real-time sales for revenue
      const unsubscribeSales = onSnapshot(collection(db, "daily_sales"), (snapshot) => {
        const totalRevenue = snapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
        setStats(prev => ({
          ...prev,
          totalRevenue,
        }));
      });

      setLoading(false);

      return () => {
        unsubscribeUsers();
        unsubscribeEmployees();
        unsubscribeProducts();
        unsubscribeSales();
      };
    }).catch(error => {
      console.error("Error checking admin status:", error);
      setLoading(false);
    });
  }, [user]);

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: user?.uid,
      });
      toast.success(`${userName} approved!`);
    } catch (error) {
      toast.error("Error approving user");
    }
  };

  const handleRejectUser = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: user?.uid,
      });
      toast.success(`${userName} rejected!`);
    } catch (error) {
      toast.error("Error rejecting user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 mb-2">Admin Overview</h1>
                <p className="text-slate-400">Welcome back, {user?.displayName || "Admin"}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                    <p className="text-slate-400 text-xs md:text-sm">Total Users</p>
                    <p className="text-xl md:text-2xl font-bold text-cyan-400">{stats.totalUsers}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                    <p className="text-slate-400 text-xs md:text-sm">Pending</p>
                    <p className="text-xl md:text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                    <p className="text-slate-400 text-xs md:text-sm">Revenue</p>
                    <p className="text-xl md:text-2xl font-bold text-green-400 truncate">{(stats.totalRevenue / 1000).toFixed(1)}K</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                    <p className="text-slate-400 text-xs md:text-sm">Employees</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-400">{stats.activeEmployees}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 col-span-2 lg:col-span-1">
                  <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                    <p className="text-slate-400 text-xs md:text-sm">Products</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-400">{stats.totalProducts}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Approvals */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingUsers.length === 0 ? (
                      <p className="text-slate-400 text-sm">No pending approvals at the moment.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingUsers.slice(0, 5).map((u: any) => (
                          <div key={u.id} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center border border-slate-600">
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate text-sm">{u.displayName}</p>
                              <p className="text-slate-400 text-xs truncate">{u.email}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveUser(u.id, u.displayName)}
                                className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectUser(u.id, u.displayName)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* System Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Business Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                        <span className="text-slate-300 text-sm">Total Revenue</span>
                        <span className="text-green-400 font-bold">{stats.totalRevenue.toLocaleString()} ETB</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                        <span className="text-slate-300 text-sm">Staff Count</span>
                        <span className="text-blue-400 font-bold">{stats.activeEmployees} Active</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                        <span className="text-slate-300 text-sm">Inventory Status</span>
                        <span className="text-purple-400 font-bold">{stats.totalProducts} Items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Feature Tabs */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "products" && <ProductManagementEnhanced />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "sales" && <DailySalesLog />}
            {activeTab === "finance" && <FinanceManagementEnhanced />}
            {activeTab === "users" && <UserManagementEnhanced />}
            {activeTab === "hr" && <HRManagement />}
            
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Business Analytics</h2>
                  <p className="text-slate-400">Deep dive into your performance metrics</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-400 text-sm">Growth Rate</p>
                      <p className="text-3xl font-bold text-green-400">+12.5%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-400 text-sm">Avg Order Value</p>
                      <p className="text-3xl font-bold text-blue-400">450 ETB</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-400 text-sm">Active Sessions</p>
                      <p className="text-3xl font-bold text-purple-400">24</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
