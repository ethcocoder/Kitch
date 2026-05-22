import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { InsertUser, users, products, orders, orderItems, cmsContent, testimonials, features, analytics } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "kitch.db");
      const sqlite = new Database(dbPath);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const now = new Date();
    const existingUser = await getUserByOpenId(user.openId);

    if (existingUser) {
      const updateData: Partial<InsertUser> = {
        lastSignedIn: now,
      };

      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
      if (user.role !== undefined) updateData.role = user.role;

      updateData.updatedAt = now;

      await db.update(users).set(updateData).where(eq(users.openId, user.openId));
    } else {
      const insertData: InsertUser = {
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.openId === ENV.ownerOpenId ? 'admin' : (user.role || 'user'),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      };

      await db.insert(users).values(insertData);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.featured, true));
}

// CMS Content queries
export async function getCMSContentByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cmsContent).where(eq(cmsContent.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCMSContent() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cmsContent).where(eq(cmsContent.published, true));
}

// Testimonials queries
export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(testimonials).where(eq(testimonials.published, true));
}

// Features queries
export async function getAllFeatures() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(features).where(eq(features.published, true));
}

// Orders queries
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Analytics queries
export async function trackEvent(eventType: string, userId?: number, productId?: number, orderId?: number, metadata?: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(analytics).values({
    eventType,
    userId,
    productId,
    orderId,
    metadata,
    createdAt: new Date(),
  });
}
