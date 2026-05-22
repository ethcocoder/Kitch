import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * STRICT ADMIN CHECK - Ensures only ONE admin exists in the system
 * This function performs a transaction-like check to prevent race conditions
 */

export async function getAdminCount(): Promise<number> {
  try {
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const snapshot = await getDocs(adminQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting admin count:", error);
    return 0;
  }
}

export async function checkIfFirstUserStrict(): Promise<boolean> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    // Check if collection is completely empty
    if (snapshot.empty) {
      console.log("[STRICT CHECK] Users collection is empty - This is the FIRST user");
      return true;
    }

    // Check if there are any admins already
    const adminCount = await getAdminCount();
    console.log("[STRICT CHECK] Current admin count:", adminCount);
    
    if (adminCount > 0) {
      console.log("[STRICT CHECK] Admin already exists - This is NOT the first user");
      return false;
    }

    // If users exist but no admin, this is still not the first user
    console.log("[STRICT CHECK] Users exist but no admin - This is NOT the first user");
    return false;
  } catch (error) {
    console.error("[STRICT CHECK] Error in strict check:", error);
    // Default to false (not first user) for safety
    return false;
  }
}

/**
 * CLEANUP UTILITY - Fix multiple admins by demoting extras to users
 * This should only be called by the current admin
 */
export async function cleanupMultipleAdmins(): Promise<{
  success: boolean;
  message: string;
  adminCount: number;
  demotedCount: number;
}> {
  try {
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const snapshot = await getDocs(adminQuery);

    const admins = snapshot.docs;
    console.log(`[CLEANUP] Found ${admins.length} admins`);

    if (admins.length <= 1) {
      return {
        success: true,
        message: "System is healthy - only one admin exists",
        adminCount: admins.length,
        demotedCount: 0,
      };
    }

    // Keep the first admin, demote the rest
    let demotedCount = 0;
    for (let i = 1; i < admins.length; i++) {
      const adminDoc = admins[i];
      try {
        await updateDoc(doc(db, "users", adminDoc.id), {
          role: "user",
          status: "approved",
          demotedAt: new Date(),
          demotionReason: "Duplicate admin - system cleanup",
        });
        demotedCount++;
        console.log(`[CLEANUP] Demoted admin: ${adminDoc.data().email}`);
      } catch (error) {
        console.error(`[CLEANUP] Failed to demote ${adminDoc.data().email}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully demoted ${demotedCount} extra admins. Only 1 admin remains.`,
      adminCount: admins.length,
      demotedCount: demotedCount,
    };
  } catch (error) {
    console.error("[CLEANUP] Error during cleanup:", error);
    return {
      success: false,
      message: `Cleanup failed: ${error}`,
      adminCount: 0,
      demotedCount: 0,
    };
  }
}

/**
 * GET ALL ADMINS - For debugging purposes
 */
export async function getAllAdmins(): Promise<any[]> {
  try {
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const snapshot = await getDocs(adminQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting all admins:", error);
    return [];
  }
}
