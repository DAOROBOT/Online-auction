import { pgTable, serial, varchar, text, decimal, timestamp, boolean, integer, pgEnum, date, primaryKey } from "drizzle-orm/pg-core";

// --- ENUMS ---
export const userRoleEnum = pgEnum('user_role', ['unauthorized', 'buyer', 'seller', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'banned']);
export const auctionStatusEnum = pgEnum('auction_status', ['active', 'sold', 'ended', 'cancelled']);

// --- 1. USERS TABLE ---
export const users = pgTable('users', {
  id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  encryptedPassword: varchar('encrypted_password', { length: 255 }).notNull(),
  fullName: text('full_name'),
  role: userRoleEnum('role').default('unauthorized'),
  status: userStatusEnum('status').default('active'),
  avatarUrl: text('avatar_url'),
  birthday: date('birthday'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  ratingCount: integer('rating_count').default(0),
  positiveRatingCount: integer('positive_rating_count').default(0),
  otp: varchar('otp'),
  googleId: varchar('google_id', { length: 100 }),
  facebookId: varchar('facebook_id', { length: 100 }),
  isVerified: boolean('is_verified').default(false),
});

// --- 2. CATEGORIES TABLE ---
export const categories = pgTable('categories', {
  id: serial('category_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  parentId: integer('parent_id'), // Self-referencing FK
  description: text('description'),
});

// --- 3. AUCTIONS TABLE ---
export const auctions = pgTable('auctions', {
  id: serial('auction_id').primaryKey(),
  sellerId: integer('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  winnerId: integer('winner_id').references(() => users.id), // Nullable until won

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  // Prices (Use decimal for money)
  startingPrice: decimal('starting_price', { precision: 10, scale: 2 }).notNull(),
  buyNowPrice: decimal('buy_now_price', { precision: 10, scale: 2 }),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  stepPrice: decimal('step_price', { precision: 10, scale: 2 }).default('1.00'),
  
  // Timing
  createdAt: timestamp('created_at').defaultNow(),
  endTime: timestamp('end_time').notNull(),
  
  // Status
  status: auctionStatusEnum('status').default('active'),
  autoExtend: boolean('auto_extend').default(false),
  bidCount: integer('bid_count').default(0),
});

// --- 4. AUCTION IMAGES TABLE ---
export const auctionImages = pgTable('auction_images', {
  id: serial('image_id').primaryKey(),
  auctionId: integer('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').default(false),
});

// --- 5. BIDS TABLE ---
export const bids = pgTable('bids', {
  id: serial('bid_id').primaryKey(),
  auctionId: integer('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }),
  bidderId: integer('bidder_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  bidTime: timestamp('bid_time').defaultNow(),
});

// --- 6. REVIEWS TABLE (Based on your dashboard requirements) ---
export const reviews = pgTable('reviews', {
  id: serial('review_id').primaryKey(),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id), // Who wrote it
  targetId: integer('target_id').notNull().references(() => users.id),   // Who received it (Seller)
  auctionId: integer('auction_id').notNull().references(() => auctions.id), // Context
  isGoodRating: boolean('is_good_rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- 7. SELLER REQUESTS TABLE ---
export const sellerRequestStatusEnum = pgEnum('seller_request_status', ['pending', 'approved', 'rejected']);

export const sellerRequests = pgTable('seller_requests', {
  id: serial('request_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  status: sellerRequestStatusEnum('status').default('pending'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  sellerExpiryDate: timestamp('seller_expiry_date', { withTimezone: true }), // When the seller role expires (7 days after approval)
});

// --- 8. USER FAVORITES TABLE ---
export const userFavorites = pgTable('user_favorites', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  auctionId: integer('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.auctionId] }),
}));

// --- 9. ORDERS TABLE (Post-auction transaction) ---
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',      // Step 1: Waiting for buyer to provide payment info
  'pending_confirmation', // Step 2: Waiting for seller to confirm payment
  'pending_delivery',     // Step 2b: Seller confirmed, waiting for shipping
  'pending_receipt',      // Step 3: Waiting for buyer to confirm receipt
  'pending_review',       // Step 4: Waiting for reviews
  'completed',            // All done
  'cancelled'             // Cancelled by seller
]);

export const orders = pgTable('orders', {
  id: serial('order_id').primaryKey(),
  auctionId: integer('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }).unique(),
  buyerId: integer('buyer_id').notNull().references(() => users.id),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  
  // Final price
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  
  // Status tracking
  status: orderStatusEnum('status').default('pending_payment'),
  
  // Step 1: Buyer payment info
  paymentProofUrl: text('payment_proof_url'),      // Payment screenshot/invoice
  shippingAddress: text('shipping_address'),
  buyerPhone: varchar('buyer_phone', { length: 20 }),
  paymentSubmittedAt: timestamp('payment_submitted_at'),
  
  // Step 2: Seller confirmation
  paymentConfirmedAt: timestamp('payment_confirmed_at'),
  shippingProofUrl: text('shipping_proof_url'),    // Shipping invoice/tracking
  trackingNumber: varchar('tracking_number', { length: 100 }),
  shippingSubmittedAt: timestamp('shipping_submitted_at'),
  
  // Step 3: Buyer confirms receipt
  receiptConfirmedAt: timestamp('receipt_confirmed_at'),
  
  // Cancellation
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: integer('cancelled_by').references(() => users.id),
  cancelReason: text('cancel_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- 10. ORDER MESSAGES TABLE (Chat between buyer and seller) ---
export const orderMessages = pgTable('order_messages', {
  id: serial('message_id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  imageUrl: text('image_url'),  // Optional image attachment
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});


// --- ADVANCED: RELATIONS (For easier querying) ---

// export const usersRelations = relations(users, ({ many }) => ({
//   auctions: many(auctions, { relationName: 'sellerAuctions' }),
//   bids: many(bids),
//   reviewsWritten: many(reviews, { relationName: 'reviewsWritten' }),
//   reviewsReceived: many(reviews, { relationName: 'reviewsReceived' }),
// }));

// export const categoriesRelations = relations(categories, ({ one, many }) => ({
//   parent: one(categories, {
//     fields: [categories.parentId],
//     references: [categories.id],
//     relationName: 'subcategories',
//   }),
//   children: many(categories, { relationName: 'subcategories' }),
//   auctions: many(auctions),
// }));

// export const auctionsRelations = relations(auctions, ({ one, many }) => ({
//   seller: one(users, {
//     fields: [auctions.sellerId],
//     references: [users.id],
//     relationName: 'sellerAuctions',
//   }),
//   winner: one(users, {
//     fields: [auctions.winnerId],
//     references: [users.id],
//   }),
//   category: one(categories, {
//     fields: [auctions.categoryId],
//     references: [categories.id],
//   }),
//   images: many(auctionImages),
//   bids: many(bids),
// }));

// export const bidsRelations = relations(bids, ({ one }) => ({
//   auction: one(auctions, {
//     fields: [bids.auctionId],
//     references: [auctions.id],
//   }),
//   bidder: one(users, {
//     fields: [bids.bidderId],
//     references: [users.id],
//   }),
// }));

// export const auctionImagesRelations = relations(auctionImages, ({ one }) => ({
//   auction: one(auctions, {
//     fields: [auctionImages.auctionId],
//     references: [auctions.id],
//   }),
// }));