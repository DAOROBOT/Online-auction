import { pgTable, serial, integer, varchar, text, numeric, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

// Define the enum first
export const auctionStatusEnum = pgEnum('auction_status', ['active', 'completed', 'cancelled']);

export const auctions = pgTable('auctions', {
  auction_id: serial('auction_id').primaryKey(),
  seller_id: integer('seller_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.categoryId),
  winner_id: integer('winner_id').references(() => users.userId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  starting_price: numeric('starting_price', { precision: 10, scale: 2 }).notNull(),
  buy_now_price: numeric('buy_now_price', { precision: 10, scale: 2 }),
  current_price: numeric('current_price', { precision: 10, scale: 2 }).default('0.00'),
  step_price: numeric('step_price', { precision: 10, scale: 2 }).default('1.00'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  end_time: timestamp('end_time', { withTimezone: true }).notNull(),
  auto_extend: boolean('auto_extend').default(false),
  status: auctionStatusEnum('status').default('active')
});
