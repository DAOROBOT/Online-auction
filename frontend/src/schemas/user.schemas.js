import { z } from 'zod';
import { phoneSchema } from './common.schemas';

// Update user info schema
export const updateUserInfoSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  address: z.string()
    .max(300, 'Address must not exceed 300 characters')
    .optional(),
});

// Become seller request schema
export const becomeSellerSchema = z.object({
  reason: z.string()
    .min(50, 'Reason must be at least 50 characters')
    .max(2000, 'Reason must not exceed 2000 characters'),
});
