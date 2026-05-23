import { pgTable, serial, text, integer, timestamp, boolean, doublePrecision, uniqueIndex, date } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: text("open_id").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("login_method"),
    role: text("role").default("user").notNull(), // "user" or "admin"
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    lastSignedIn: timestamp("last_signed_in").notNull().defaultNow(),
  },
  (table) => ({
    openIdIdx: uniqueIndex("users_open_id_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Enhanced Products table with sales tracking.
 */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    price: doublePrecision("price").notNull(),
    cost: doublePrecision("cost").default(0), // Cost price for profit calculation
    stock: integer("stock").notNull().default(0),
    totalSold: integer("total_sold").default(0), // Lifetime sold count
    totalProfit: doublePrecision("total_profit").default(0), // Lifetime profit
    imageUrl: text("image_url"),
    sku: text("sku").unique(),
    featured: boolean("featured").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Daily Sales Log - tracks individual sales with profit calculation.
 */
export const dailySales = pgTable("daily_sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  unitCost: doublePrecision("unit_cost").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(), // quantity * unitPrice
  totalCost: doublePrecision("total_cost").notNull(), // quantity * unitCost
  profit: doublePrecision("profit").notNull(), // totalAmount - totalCost
  saleDate: date("sale_date").notNull(), // Date of sale
  saleTime: timestamp("sale_time").notNull().defaultNow(), // Exact timestamp
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DailySale = typeof dailySales.$inferSelect;
export type InsertDailySale = typeof dailySales.$inferInsert;

/**
 * Daily Attendance - tracks what was sold each day.
 */
export const dailyAttendance = pgTable("daily_attendance", {
  id: serial("id").primaryKey(),
  attendanceDate: date("attendance_date").notNull(),
  totalItemsSold: integer("total_items_sold").notNull().default(0),
  totalRevenue: doublePrecision("total_revenue").notNull().default(0),
  totalCost: doublePrecision("total_cost").notNull().default(0),
  totalProfit: doublePrecision("total_profit").notNull().default(0),
  itemCount: integer("item_count").notNull().default(0), // Number of different products sold
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DailyAttendance = typeof dailyAttendance.$inferSelect;
export type InsertDailyAttendance = typeof dailyAttendance.$inferInsert;

/**
 * Orders table for order management.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").default("pending").notNull(), // "pending", "processing", etc.
  totalAmount: doublePrecision("total_amount").notNull(),
  itemCount: integer("item_count").notNull(),
  shippingAddress: text("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table.
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * CMS Content table.
 */
export const cmsContent = pgTable("cms_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  order: integer("order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CMSContent = typeof cmsContent.$inferSelect;
export type InsertCMSContent = typeof cmsContent.$inferInsert;

/**
 * Testimonials table.
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title"),
  authorImage: text("author_image"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Analytics table.
 */
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  userId: integer("user_id"),
  productId: integer("product_id"),
  orderId: integer("order_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Features table.
 */
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  order: integer("order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Feature = typeof features.$inferSelect;
export type InsertFeature = typeof features.$inferInsert;
