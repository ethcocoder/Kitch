import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";

export function UserDashboardNew() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();

            // If not approved, redirect to approval waiting
            if (data.status !== "approved") {
              window.location.href = "/approval-waiting";
              return;
            }

            // If admin, redirect to admin dashboard
            if (data.role === "admin") {
              window.location.href = "/admin-dashboard";
              return;
            }

            // If staff/user, redirect to staff dashboard
            window.location.href = "/staff-dashboard";
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading user data");
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-cyan-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
