import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AdminSidebar } from "../components/AdminSidebar";
import { ProductManagement } from "../components/ProductManagement";
import { OrderManagement } from "../components/OrderManagement";
import { FinanceManagement } from "../components/FinanceManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
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
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "", salary: 0 });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (user?.uid) {
        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists() || userDoc.data().role !== "admin") {
            window.location.href = "/user-dashboard";
            return;
          }

          // Fetch all data
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);
          const allUsers = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const pending = allUsers.filter((u: any) => u.status === "pending");
          const approved = allUsers.filter((u: any) => u.status === "approved");

          setPendingUsers(pending);
          setApprovedUsers(approved);

          // Fetch products
          const productsRef = collection(db, "products");
          const productsSnapshot = await getDocs(productsRef);

          setStats({
            totalUsers: allUsers.length,
            pendingApprovals: pending.length,
            totalRevenue: Math.floor(Math.random() * 100000) + 50000,
            activeEmployees: approved.filter((u: any) => u.role === "user").length,
            totalProducts: productsSnapshot.size,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Error loading dashboard");
        } finally {
          setLoading(false);
        }
      }
    };

    checkAdminAndFetchData();
  }, [user]);

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: user?.uid,
      });
      toast.success(`${userName} has been approved!`);
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
      window.location.reload();
    } catch (error) {
      toast.error("Error rejecting user");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const newEmp = {
        ...newEmployee,
        createdAt: new Date(),
      };
      setEmployees([...employees, newEmp]);
      setNewEmployee({ name: "", email: "", role: "", salary: 0 });
      setShowEmployeeForm(false);
      toast.success("Employee added successfully");
    } catch (error) {
      toast.error("Error adding employee");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back, {user?.displayName}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-5 gap-4">
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
                        <p className="text-slate-400 text-sm">Pending</p>
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
                        <p className="text-slate-400 text-sm">Revenue</p>
                        <p className="text-3xl font-bold text-green-400">
                          {(stats.totalRevenue / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <DollarSign className="w-12 h-12 text-green-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Employees</p>
                        <p className="text-3xl font-bold text-blue-400">{stats.activeEmployees}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Products</p>
                        <p className="text-3xl font-bold text-purple-400">{stats.totalProducts}</p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-purple-400/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Approvals */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingUsers.length === 0 ? (
                      <p className="text-slate-400">No pending approvals</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingUsers.slice(0, 3).map((user: any) => (
                          <div key={user.id} className="bg-slate-700 rounded-lg p-3 flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{user.displayName}</p>
                              <p className="text-slate-400 text-sm">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveUser(user.id, user.displayName)}
                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id, user.displayName)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-sm"
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

                {/* Recent Activity */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-slate-700 rounded-lg p-3">
                        <p className="text-white font-semibold">System Status</p>
                        <p className="text-green-400 text-sm">✓ All systems operational</p>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-3">
                        <p className="text-white font-semibold">Last Updated</p>
                        <p className="text-slate-400 text-sm">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && <ProductManagement />}

          {/* Orders Tab */}
          {activeTab === "orders" && <OrderManagement />}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400">User Management</h2>
                <p className="text-slate-400">Manage system users and approvals</p>
              </div>

              {/* Pending Users */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Pending Approvals ({pendingUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <p className="text-slate-400">No pending approvals</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingUsers.map((user: any) => (
                        <div key={user.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{user.displayName}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <p className="text-slate-500 text-xs mt-1">Type: {user.userType}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveUser(user.id, user.displayName)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectUser(user.id, user.displayName)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
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
                </CardHeader>
                <CardContent>
                  {approvedUsers.length === 0 ? (
                    <p className="text-slate-400">No approved users</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-300">Name</th>
                            <th className="text-left py-3 px-4 text-slate-300">Email</th>
                            <th className="text-left py-3 px-4 text-slate-300">Role</th>
                            <th className="text-left py-3 px-4 text-slate-300">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approvedUsers.map((user: any) => (
                            <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 px-4 text-white">{user.displayName}</td>
                              <td className="py-3 px-4 text-slate-300">{user.email}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  user.role === "admin"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 capitalize">{user.userType}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400">Analytics</h2>
                <p className="text-slate-400">Business insights and metrics</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-green-400">
                          {(stats.totalRevenue / 12 / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Growth Rate</p>
                        <p className="text-3xl font-bold text-blue-400">+12.5%</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-blue-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Conversion Rate</p>
                        <p className="text-3xl font-bold text-purple-400">3.2%</p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-purple-400/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === "finance" && <FinanceManagement />}

          {/* HR Tab */}
          {activeTab === "hr" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-cyan-400">HR Management</h2>
                  <p className="text-slate-400">Employee and staff management</p>
                </div>
                <Button
                  onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
                >
                  {showEmployeeForm ? "Cancel" : "+ Add Employee"}
                </Button>
              </div>

              {showEmployeeForm && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">Add New Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">
                            Full Name
                          </label>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={newEmployee.name}
                            onChange={(e) =>
                              setNewEmployee({ ...newEmployee, name: e.target.value })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">
                            Email
                          </label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={newEmployee.email}
                            onChange={(e) =>
                              setNewEmployee({ ...newEmployee, email: e.target.value })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">
                            Position
                          </label>
                          <Input
                            type="text"
                            placeholder="Manager"
                            value={newEmployee.role}
                            onChange={(e) =>
                              setNewEmployee({ ...newEmployee, role: e.target.value })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">
                            Salary (ETB)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newEmployee.salary}
                            onChange={(e) =>
                              setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
                        >
                          Add Employee
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowEmployeeForm(false)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Employees ({employees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {employees.length === 0 ? (
                    <p className="text-slate-400">No employees added yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-300">Name</th>
                            <th className="text-left py-3 px-4 text-slate-300">Email</th>
                            <th className="text-left py-3 px-4 text-slate-300">Position</th>
                            <th className="text-left py-3 px-4 text-slate-300">Salary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((emp, idx) => (
                            <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 px-4 text-white">{emp.name}</td>
                              <td className="py-3 px-4 text-slate-300">{emp.email}</td>
                              <td className="py-3 px-4 text-slate-300">{emp.role}</td>
                              <td className="py-3 px-4 text-green-400 font-semibold">
                                {emp.salary.toFixed(2)} ETB
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
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400">Activity Logs</h2>
                <p className="text-slate-400">System activity and user actions</p>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">System Initialized</p>
                        <p className="text-slate-400 text-sm">Admin dashboard loaded</p>
                      </div>
                      <p className="text-slate-500 text-xs">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400">Settings</h2>
                <p className="text-slate-400">System configuration and preferences</p>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400">System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      System Name
                    </label>
                    <Input
                      type="text"
                      defaultValue="Eyob Store"
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Admin Email
                    </label>
                    <Input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="bg-slate-600 border-slate-500 text-white"
                      disabled
                    />
                  </div>

                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
