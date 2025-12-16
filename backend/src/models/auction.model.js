import { pgTable, serial, integer, varchar, text, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';
import { numeric } from 'drizzle-orm/sqlite-core';

export const auctions = pgTable('auctions', {
  id: serial('auction_id').primaryKey(),
  seller_id: integer('seller_id').notNull(),
  category_id: integer('category_id').notNull(),
  winner_id: integer('winner_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  starting_price: numeric('starting_price', { precision: 10, scale: 2 }).notNull(),
  buy_now_price: numeric('buy_now_price', { precision: 10, scale: 2 }),
  current_price: numeric('current_price', { precision: 10, scale: 2 }).notNull(),
  step_price: numeric('step_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  end_time: timestamp('end_time').notNull(),
  auto_extend: boolean('auto_extend').default(false).notNull(),
  status: varchar('status', { length: 50 }).notNull()
});