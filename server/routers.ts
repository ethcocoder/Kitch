import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getAllCMSContent,
  getCMSContentByKey,
  getAllTestimonials,
  getAllFeatures,
  getUserOrders,
  getOrderById,
  trackEvent,
} from "./db";
import { TRPCError } from "@trpc/server";

// Admin procedure - only admins can access
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products Router
  products: router({
    list: publicProcedure.query(async () => {
      return await getAllProducts();
    }),
    featured: publicProcedure.query(async () => {
      return await getFeaturedProducts();
    }),
    byId: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await getProductById(input);
    }),
  }),

  // CMS Router
  cms: router({
    content: publicProcedure.query(async () => {
      return await getAllCMSContent();
    }),
    byKey: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await getCMSContentByKey(input);
    }),
  }),

  // Testimonials Router
  testimonials: router({
    list: publicProcedure.query(async () => {
      return await getAllTestimonials();
    }),
  }),

  // Features Router
  features: router({
    list: publicProcedure.query(async () => {
      return await getAllFeatures();
    }),
  }),

  // Orders Router
  orders: router({
    userOrders: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOrders(ctx.user.id);
    }),
    byId: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const order = await getOrderById(input);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return order;
    }),
  }),

  // Analytics Router
  analytics: router({
    track: publicProcedure
      .input(
        z.object({
          eventType: z.string(),
          productId: z.number().optional(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await trackEvent(input.eventType, ctx.user?.id, input.productId, undefined, input.metadata);
        return { success: true };
      }),
  }),

  // Admin Router
  admin: router({
    dashboard: adminProcedure.query(async () => {
      // Return dashboard stats
      return {
        totalProducts: (await getAllProducts()).length,
        totalTestimonials: (await getAllTestimonials()).length,
        totalFeatures: (await getAllFeatures()).length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
