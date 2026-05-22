import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { LogOut, ShoppingCart, User } from "lucide-react";
import { getUserOrders } from "../services/firestoreService";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.uid) {
        try {
          const userOrders = await getUserOrders(user.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-2">Welcome back, {user?.displayName || user?.email}</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="text-white">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Display Name</label>
              <p className="text-white">{user?.displayName || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">User ID</label>
              <p className="text-white text-sm font-mono">{user?.uid}</p>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Your Orders
            </CardTitle>
            <CardDescription>View and manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No orders yet</p>
                <Button
                  className="mt-4 bg-amber-500 hover:bg-amber-600"
                  onClick={() => (window.location.href = "/")}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-700 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-white">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-slate-400">
                        Status: <span className="capitalize">{order.status || "pending"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${order.total?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
