import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

export function AdminPromotion() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.uid) {
        try {
          // Get current user role
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUserRole(userDoc.data().role);
          }

          // Get user count
          const usersRef = collection(db, "users");
          const snapshot = await getDocs(usersRef);
          setUserCount(snapshot.size);
        } catch (error) {
          console.error("Error checking status:", error);
        }
      }
    };

    checkStatus();
  }, [user]);

  const handlePromoteToAdmin = async () => {
    if (!user?.uid) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        role: "admin",
        status: "approved",
        approvedAt: new Date(),
        approvedBy: "manual-promotion",
      });

      toast.success("You have been promoted to Admin!");
      setTimeout(() => {
        window.location.href = "/admin-dashboard";
      }, 1000);
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Error promoting to admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Admin Promotion</CardTitle>
            <CardDescription>Promote your account to admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-slate-400 text-sm">Email</label>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Current Role</label>
                <p className="text-white font-semibold capitalize">{currentUserRole || "Loading..."}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Total Users in System</label>
                <p className="text-white font-semibold">{userCount}</p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                {userCount === 1
                  ? "You are the only user. Click below to promote yourself to Admin."
                  : `There are ${userCount} users in the system. Only the first user should be promoted to Admin.`}
              </p>
            </div>

            {currentUserRole !== "admin" && (
              <Button
                onClick={handlePromoteToAdmin}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg"
              >
                {loading ? "Promoting..." : "Promote to Admin"}
              </Button>
            )}

            {currentUserRole === "admin" && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-300 text-sm">✓ You are already an Admin</p>
              </div>
            )}

            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
