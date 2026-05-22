import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { getAllAdmins, cleanupMultipleAdmins, getAdminCount } from "../lib/strictAdminCheck";

export function AdminCleanup() {
  const { user } = useAuth();
  const [adminCount, setAdminCount] = useState(0);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user?.uid]);

  const checkAdminStatus = async () => {
    try {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsCurrentUserAdmin(true);
          await loadAdminInfo();
        } else {
          toast.error("You must be an admin to access this page");
          window.location.href = "/user-dashboard";
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error verifying admin status");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminInfo = async () => {
    try {
      const count = await getAdminCount();
      setAdminCount(count);

      const adminsList = await getAllAdmins();
      setAdmins(adminsList);
    } catch (error) {
      console.error("Error loading admin info:", error);
      toast.error("Failed to load admin information");
    }
  };

  const handleCleanup = async () => {
    if (!confirm("This will demote extra admins to regular users. Continue?")) {
      return;
    }

    setCleaning(true);
    try {
      const result = await cleanupMultipleAdmins();

      if (result.success) {
        toast.success(result.message);
        await loadAdminInfo();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast.error("Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isCurrentUserAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 w-96">
          <CardContent className="pt-6">
            <p className="text-red-400 text-center">You must be an admin to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Admin System Cleanup</h1>
          <p className="text-slate-400">Fix multiple admin accounts in the system</p>
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${adminCount > 1 ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}>
          <CardHeader>
            <CardTitle className={adminCount > 1 ? "text-red-400" : "text-green-400"}>
              {adminCount > 1 ? "⚠️ Multiple Admins Detected" : "✅ System Healthy"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {adminCount > 1 ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              <div>
                <p className="text-slate-300 font-semibold">Current Admin Count: {adminCount}</p>
                <p className="text-slate-400 text-sm">
                  {adminCount > 1
                    ? "Multiple admins found. This should be fixed immediately."
                    : "Only one admin exists. System is operating correctly."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admins List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Current Admins ({admins.length})</CardTitle>
            <CardDescription>All users with admin role</CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No admins found</p>
            ) : (
              <div className="space-y-3">
                {admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className={`bg-slate-700 rounded-lg p-4 flex justify-between items-center ${
                      index === 0 ? "border-2 border-green-500" : "border border-slate-600"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold">{admin.displayName}</p>
                      <p className="text-slate-400 text-sm">{admin.email}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Created: {new Date(admin.createdAt?.toDate?.() || admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {index === 0 && (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Primary Admin
                        </span>
                      )}
                      {index > 0 && (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Duplicate
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cleanup Instructions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">1.</span>
              <p>The system will keep the first admin account (Primary Admin)</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">2.</span>
              <p>All other admin accounts will be demoted to regular users</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">3.</span>
              <p>Demoted users will still have approved status and can use the system</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">4.</span>
              <p>Only one admin will remain to manage the system</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {adminCount > 1 && (
            <Button
              onClick={handleCleanup}
              disabled={cleaning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {cleaning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Fix Multiple Admins
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => window.location.href = "/admin-dashboard"}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Warning */}
        {adminCount > 1 && (
          <Card className="bg-yellow-500/10 border-yellow-500">
            <CardContent className="pt-6">
              <p className="text-yellow-400 text-sm">
                <strong>Warning:</strong> Multiple admin accounts can lead to conflicting changes and security issues.
                Please run the cleanup immediately.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
