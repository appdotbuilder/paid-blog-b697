import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  signUpInputSchema,
  signInInputSchema,
  createPostInputSchema,
  updatePostInputSchema,
  updateUserCreditsInputSchema,
  purchaseCreditsInputSchema
} from './schema';

// Import handlers
import { signUp, signIn, getCurrentUser } from './handlers/auth';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getUserPosts, 
  getActivePosts, 
  cleanupExpiredPosts 
} from './handlers/posts';
import { 
  updateUserCredits, 
  getAllUsers, 
  getUserStats, 
  purchaseCredits 
} from './handlers/admin';
import { uploadImage, deleteImage } from './handlers/images';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Mock authentication middleware (replace with real JWT verification)
const authenticatedProcedure = publicProcedure.use(async ({ next, ctx }) => {
  // This is a placeholder! Real implementation should:
  // 1. Extract JWT token from request headers
  // 2. Verify and decode the token
  // 3. Add user info to context
  const mockUser = { id: 1, isAdmin: false };
  return next({
    ctx: {
      ...ctx,
      user: mockUser,
    },
  });
});

const adminProcedure = authenticatedProcedure.use(async ({ next, ctx }) => {
  // This is a placeholder! Real implementation should:
  // Check if user is admin, throw error if not
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    signUp: publicProcedure
      .input(signUpInputSchema)
      .mutation(({ input }) => signUp(input)),
    
    signIn: publicProcedure
      .input(signInInputSchema)
      .mutation(({ input }) => signIn(input)),
    
    getCurrentUser: authenticatedProcedure
      .query(({ ctx }) => getCurrentUser('mock-token')),
  }),

  // Post management routes
  posts: router({
    create: authenticatedProcedure
      .input(createPostInputSchema)
      .mutation(({ input, ctx }) => createPost(ctx.user!.id, input)),
    
    update: authenticatedProcedure
      .input(updatePostInputSchema)
      .mutation(({ input, ctx }) => updatePost(ctx.user!.id, input)),
    
    delete: authenticatedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => deletePost(ctx.user!.id, input.id)),
    
    getUserPosts: authenticatedProcedure
      .query(({ ctx }) => getUserPosts(ctx.user!.id)),
    
    getActive: publicProcedure
      .query(() => getActivePosts()),
    
    cleanupExpired: publicProcedure
      .mutation(() => cleanupExpiredPosts()),
  }),

  // Admin routes
  admin: router({
    updateUserCredits: adminProcedure
      .input(updateUserCreditsInputSchema)
      .mutation(({ input, ctx }) => updateUserCredits(ctx.user!.id, input)),
    
    getAllUsers: adminProcedure
      .query(({ ctx }) => getAllUsers(ctx.user!.id)),
    
    getStats: adminProcedure
      .query(({ ctx }) => getUserStats(ctx.user!.id)),
  }),

  // Credit management
  credits: router({
    purchase: authenticatedProcedure
      .input(purchaseCreditsInputSchema)
      .mutation(({ input, ctx }) => purchaseCredits(ctx.user!.id, input)),
  }),

  // Image management
  images: router({
    upload: authenticatedProcedure
      .input(z.object({ imageData: z.string() }))
      .mutation(({ input, ctx }) => uploadImage(input.imageData, ctx.user!.id)),
    
    delete: authenticatedProcedure
      .input(z.object({ imagePath: z.string() }))
      .mutation(({ input }) => deleteImage(input.imagePath)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log('🚀 Paid Blog Application Server Started');
  console.log('📝 Features: User Auth, Paid Posts, Admin Panel, Image Upload');
}

start();