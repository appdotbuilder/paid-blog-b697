import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  credits: z.number().int().nonnegative(),
  post_count: z.number().int().nonnegative(),
  is_admin: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Auth schemas
export const signUpInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type SignInInput = z.infer<typeof signInInputSchema>;

// Post schema
export const postSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  description: z.string(),
  phone_number: z.string(),
  image_path: z.string().nullable(),
  is_active: z.boolean(),
  expires_at: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Post = z.infer<typeof postSchema>;

// Post input schemas
export const createPostInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  phone_number: z.string().regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
  image_data: z.string().optional() // Base64 encoded image data
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

export const updatePostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  phone_number: z.string().regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  image_data: z.string().optional()
});

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Admin credit management schema
export const updateUserCreditsInputSchema = z.object({
  user_id: z.number(),
  credits: z.number().int().nonnegative()
});

export type UpdateUserCreditsInput = z.infer<typeof updateUserCreditsInputSchema>;

// Public post display schema (without sensitive user data)
export const publicPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  phone_number: z.string(),
  image_path: z.string().nullable(),
  created_at: z.coerce.date()
});

export type PublicPost = z.infer<typeof publicPostSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  user: userSchema.omit({ password_hash: true }),
  token: z.string()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Credit purchase schema
export const purchaseCreditsInputSchema = z.object({
  amount: z.number().int().positive().max(1000) // Max 1000 credits per purchase
});

export type PurchaseCreditsInput = z.infer<typeof purchaseCreditsInputSchema>;