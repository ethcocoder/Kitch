import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, getDocs, updateDoc, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, DollarSign, BarChart3, CheckCircle, XCircle, Clock, Menu, X } from "lucide-react";

export function AdminDashboardNew() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "financial" | "hr">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeEmployees: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists() || userDoc.data().role !== "admin") {
            window.location.href = "/user-dashboard";
            return;
          }

          // Fetch all users
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);
          const allUsers = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Separate pending and approved users
          const pending = allUsers.filter((u: any) => u.status === "pending");
          const approved = allUsers.filter((u: any) => u.status === "approved");

          setPendingUsers(pending);
          setApprovedUsers(approved);

          // Calculate stats
          setStats({
            totalUsers: allUsers.length,
            pendingApprovals: pending.length,
            totalRevenue: Math.floor(Math.random() * 50000) + 10000, // Placeholder
            activeEmployees: approved.filter((u: any) => u.role === "user").length,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Error loading dashboard data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: user?.uid,
      });
      toast.success(`${userName} has been approved!`);
      // Refresh data
      window.location.reload();
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
      toast.success(`${userName} has been rejected!`);
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast.error("Error rejecting user");
    }
  };

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
          <p className="text-cyan-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome, {user?.displayName}</p>
          </div>
          <div className="hidden md:flex gap-4">
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white flex gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white flex gap-2 justify-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-cyan-400">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Approvals</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingApprovals}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Employees</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.activeEmployees}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview" as const, label: "Overview" },
            { id: "users" as const, label: "User Management" },
            { id: "financial" as const, label: "Financial" },
            { id: "hr" as const, label: "HR Management" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-cyan-400">System Overview</CardTitle>
                <CardDescription>Key metrics and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">System Status</p>
                    <p className="text-green-400 font-semibold">✓ All Systems Operational</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Last Updated</p>
                    <p className="text-white font-semibold">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Pending Users */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Pending Approvals ({pendingUsers.length})</CardTitle>
                <CardDescription>Users awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-slate-400">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{user.displayName}</p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                          <p className="text-slate-500 text-xs mt-1">Type: {user.userType}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveUser(user.id, user.displayName)}
                            className="bg-green-500 hover:bg-green-600 text-white flex gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectUser(user.id, user.displayName)}
                            className="bg-red-500 hover:bg-red-600 text-white flex gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approved Users */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400">Approved Users ({approvedUsers.length})</CardTitle>
                <CardDescription>Active users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedUsers.length === 0 ? (
                  <p className="text-slate-400">No approved users</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {approvedUsers.map((user: any) => (
                      <div key={user.id} className="bg-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{user.displayName}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                (user as any).role === "admin" ? "bg-purple-500/30 text-purple-300" : "bg-blue-500/30 text-blue-300"
                              }`}>
                                {user.role.toUpperCase()}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300">
                                {user.userType}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-500 text-xs">
                            Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "financial" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Financial Dashboard</CardTitle>
              <CardDescription>Revenue and financial metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Monthly Average</p>
                  <p className="text-3xl font-bold text-blue-400">${(stats.totalRevenue / 12 / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Growth Rate</p>
                  <p className="text-3xl font-bold text-yellow-400">+12.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "hr" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">HR Management</CardTitle>
              <CardDescription>Employee and staff management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Total Staff</p>
                    <p className="text-3xl font-bold text-blue-400">{approvedUsers.filter((u: any) => u.role === "user").length}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Admins</p>
                    <p className="text-3xl font-bold text-purple-400">{approvedUsers.filter((u: any) => u.role === "admin").length}</p>
                  </div>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
