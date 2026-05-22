import { pgTable, serial, text, integer, timestamp, boolean, doublePrecision, uniqueIndex } from "drizzle-orm/pg-core";

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
 * Products table for inventory and product management.
 */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    price: doublePrecision("price").notNull(),
    stock: integer("stock").notNull().default(0),
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
