import { collection, getDocs, query, where, getDoc, doc, Query } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Global data fetching utility with error handling
 * Ensures all data fetching is consistent and handles errors gracefully
 */

export async function fetchCollection(collectionName: string, queryConstraints?: any[]) {
  try {
    const collRef = collection(db, collectionName);
    let q: Query;

    if (queryConstraints && queryConstraints.length > 0) {
      q = query(collRef, ...queryConstraints);
    } else {
      q = query(collRef);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function fetchDocument(collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${documentId}:`, error);
    return null;
  }
}

export async function fetchUsers() {
  return fetchCollection("users");
}

export async function fetchProducts() {
  return fetchCollection("products");
}

export async function fetchOrders() {
  return fetchCollection("orders");
}

export async function fetchEmployees() {
  return fetchCollection("employees");
}

export async function fetchExpenses() {
  return fetchCollection("expenses");
}

export async function fetchPendingUsers() {
  return fetchCollection("users", [where("status", "==", "pending")]);
}

export async function fetchApprovedUsers() {
  return fetchCollection("users", [where("status", "==", "approved")]);
}

export async function fetchAdmins() {
  return fetchCollection("users", [where("role", "==", "admin")]);
}

export async function fetchUser(userId: string) {
  return fetchDocument("users", userId);
}

export async function fetchProduct(productId: string) {
  return fetchDocument("products", productId);
}

export async function fetchOrder(orderId: string) {
  return fetchDocument("orders", orderId);
}
