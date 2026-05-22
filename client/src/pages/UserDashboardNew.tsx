import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { LogOut, ShoppingCart, User, Home } from "lucide-react";

export function UserDashboardNew() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // If not approved, redirect to approval waiting
            if (data.status !== "approved") {
              window.location.href = "/approval-waiting";
            }

            // If admin, redirect to admin dashboard
            if (data.role === "admin") {
              window.location.href = "/admin-dashboard";
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading user data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome, {user?.displayName}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white flex gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-1">Welcome back!</h2>
                <p className="text-slate-300">You're all set and ready to go.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Account Status</p>
                  <p className="text-2xl font-bold text-green-400">Active</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-xl">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">User Type</p>
                  <p className="text-2xl font-bold text-blue-400 capitalize">{userData?.userType}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-xl">👤</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {userData?.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-xl">📅</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-400">Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <label className="text-slate-400 text-sm block mb-1">Email</label>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <label className="text-slate-400 text-sm block mb-1">Display Name</label>
                <p className="text-white font-semibold">{user?.displayName}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <label className="text-slate-400 text-sm block mb-1">Role</label>
                <p className="text-white font-semibold capitalize">{userData?.role}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <label className="text-slate-400 text-sm block mb-1">Status</label>
                <p className="text-green-400 font-semibold capitalize">{userData?.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Browse Products
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
