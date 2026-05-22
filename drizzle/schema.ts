import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow with role-based access control.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp_ms" }).notNull().default(new Date()),
  },
  (table) => ({
    openIdIdx: uniqueIndex("users_openId_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table for inventory and product management.
 * Stores kitchen equipment and materials from the PDF.
 */
export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(), // e.g., "Kitchen Appliances", "Cookware", "Tools", "Dining & Serving", "Storage", "Cleaning & Safety"
    price: real("price").notNull(),
    stock: integer("stock").notNull().default(0),
    imageUrl: text("imageUrl"),
    sku: text("sku").unique(),
    featured: integer("featured", { mode: "boolean" }).default(false),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
  }
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table for order management.
 * Tracks customer orders and order status.
 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  orderNumber: text("orderNumber").notNull().unique(),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] })
    .default("pending")
    .notNull(),
  totalAmount: real("totalAmount").notNull(),
  itemCount: integer("itemCount").notNull(),
  shippingAddress: text("shippingAddress"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table - tracks individual products in each order.
 */
export const orderItems = sqliteTable("orderItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * CMS Content table for managing landing page content.
 * Stores hero text, features, and other editable content.
 */
export const cmsContent = sqliteTable("cmsContent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(), // e.g., "hero_title", "hero_subtitle", "features_section_title"
  title: text("title"),
  content: text("content"), // Rich text or JSON
  imageUrl: text("imageUrl"),
  order: integer("order").default(0),
  published: integer("published", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type CMSContent = typeof cmsContent.$inferSelect;
export type InsertCMSContent = typeof cmsContent.$inferInsert;

/**
 * Testimonials table for managing customer testimonials.
 * Displayed on the landing page.
 */
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorName: text("authorName").notNull(),
  authorTitle: text("authorTitle"),
  authorImage: text("authorImage"),
  content: text("content").notNull(),
  rating: integer("rating").default(5), // 1-5 star rating
  published: integer("published", { mode: "boolean" }).default(true),
  order: integer("order").default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Analytics table for tracking user interactions and page views.
 * Used for the admin dashboard analytics module.
 */
export const analytics = sqliteTable("analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("eventType").notNull(), // e.g., "page_view", "product_view", "order_created", "user_signup"
  userId: integer("userId"),
  productId: integer("productId"),
  orderId: integer("orderId"),
  metadata: text("metadata"), // JSON for additional data
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Features table for managing landing page features.
 * Each feature has a title, description, icon, and display order.
 */
export const features = sqliteTable("features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"), // Icon name or SVG
  imageUrl: text("imageUrl"),
  order: integer("order").default(0),
  published: integer("published", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(new Date()),
});

export type Feature = typeof features.$inferSelect;
export type InsertFeature = typeof features.$inferInsert;
