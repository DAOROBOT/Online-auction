import { z } from 'zod';
import { priceSchema } from './common.schemas';

// Create auction schema
export const createAuctionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .refine((val) => val !== '<p></p>' && val !== '', 'Description is required'),
  startingPrice: z.number()
    .positive('Starting price must be positive')
    .min(1000, 'Starting price must be at least 1,000'),
  stepPrice: z.number()
    .positive('Step price must be positive')
    .min(100, 'Step price must be at least 100'),
  buyNowPrice: z.number()
    .positive('Buy now price must be positive')
    .optional()
    .nullable(),
  categoryId: z.string()
    .min(1, 'Category is required'),
  endTime: z.string()
    .min(1, 'End time is required')
    .refine(
      (date) => new Date(date) > new Date(),
      'End time must be in the future'
    )
    .refine(
      (date) => new Date(date) > new Date(Date.now() + 60 * 60 * 1000),
      'End time must be at least 1 hour from now'
    ),
  autoExtend: z.boolean(),
  images: z.array(z.any())
    .min(3, 'At least 3 images are required')
    .max(10, 'Maximum 10 images allowed'),
}).refine(
  (data) => !data.buyNowPrice || data.buyNowPrice > data.startingPrice,
  {
    message: 'Buy now price must be greater than starting price',
    path: ['buyNowPrice'],
  }
);

// Bid placement schema
export const placeBidSchema = z.object({
  bidAmount: z.number()
    .positive('Bid amount must be positive')
    .finite('Bid amount must be a valid number'),
}).refine(
  (data, ctx) => {
    // Note: Additional validation against currentPrice + stepPrice
    // should be done in the component with the actual product data
    return true;
  }
);

// Comment schema
export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must not exceed 500 characters')
    .transform((val) => val.trim()),
});
