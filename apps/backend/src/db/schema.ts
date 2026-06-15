import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const decks = pgTable('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  theme: text('theme').notNull().default('default'),
  status: text('status').notNull().default('ready'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const slides = pgTable('slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  layoutId: text('layout_id').notNull(),
  position: integer('position').notNull(),
  slotData: jsonb('slot_data').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});