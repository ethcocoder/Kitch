import { collection, getDocs, query, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Check if there are any users in the database
 */
export async function hasAnyUsers(): Promise<boolean> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking for existing users:", error);
    return true; // Default to true (assume users exist) for safety
  }
}

/**
 * Promote a user to admin
 */
export async function promoteToAdmin(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: "admin",
      status: "approved",
      approvedAt: new Date(),
      approvedBy: "system",
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
}

/**
 * Get the count of users in the database
 */
export async function getUserCount(): Promise<number> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting user count:", error);
    return 0;
  }
}
