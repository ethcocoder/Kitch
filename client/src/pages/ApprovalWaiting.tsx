import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Clock, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export function ApprovalWaiting() {
  const { user, logout } = useAuth();
  const [userStatus, setUserStatus] = useState<"pending" | "approved" | "rejected" | "loading">("loading");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserStatus(data.status || "pending");

            // If approved, redirect to dashboard
            if (data.status === "approved") {
              window.location.href = data.role === "admin" ? "/admin-dashboard" : "/user-dashboard";
            }
          }
        } catch (error) {
          console.error("Error checking approval status:", error);
          toast.error("Error checking status");
        }
      }
    };

    // Check immediately and then every 5 seconds
    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (userStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (userStatus === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-red-400 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-3xl">✕</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-2">Application Rejected</h1>
          <p className="text-slate-300 mb-6">
            Your application has been rejected. Please contact support for more information.
          </p>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Pending Approval</h1>

        {/* Message */}
        <p className="text-slate-300 mb-6">
          Your account is awaiting approval from the administrator. This typically takes 24-48 hours.
        </p>

        {/* User Info */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 text-left">
          <div className="mb-4">
            <label className="text-slate-400 text-sm">Email</label>
            <p className="text-white font-semibold">{user?.email}</p>
          </div>
          <div className="mb-4">
            <label className="text-slate-400 text-sm">Display Name</label>
            <p className="text-white font-semibold">{user?.displayName}</p>
          </div>
          <div>
            <label className="text-slate-400 text-sm">Status</label>
            <p className="text-yellow-400 font-semibold">Pending Review</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            You will be automatically redirected once your account is approved. You can also check back later.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg"
          >
            Refresh Status
          </Button>
          <Button
            onClick={handleLogout}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
