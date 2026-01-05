import { z } from 'zod';

// Category create/update schema
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

// User filter schema
export const userFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  role: z.enum(['all', 'admin', 'seller', 'buyer', 'unauthorized']).default('all'),
  status: z.enum(['all', 'active', 'banned']).default('all'),
});

// Seller request approval/rejection schema
export const reviewSellerRequestSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be either approve or reject' }),
  }),
  reason: z.string()
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.reason && data.reason.length >= 10),
  {
    message: 'Rejection reason is required and must be at least 10 characters',
    path: ['reason'],
  }
);

// Ban user schema
export const banUserSchema = z.object({
  reason: z.string()
    .min(10, 'Ban reason must be at least 10 characters')
    .max(500, 'Ban reason must not exceed 500 characters'),
});
