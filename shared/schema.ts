import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll store configurations so users don't have to re-type them
export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Default Config"),
  token: text("token").notNull(), // User token
  message: text("message").notNull(),
  channelIds: text("channel_ids").notNull(), // Stored as comma-separated string
  delaySeconds: integer("delay_seconds").notNull().default(60),
  imageUrls: text("image_urls"), // Comma-separated or JSON array of image URLs
  isRunning: boolean("is_running").default(false),
  lastRunAt: timestamp("last_run_at"),
});

export const insertConfigSchema = createInsertSchema(configs).omit({ 
  id: true, 
  isRunning: true, 
  lastRunAt: true 
});

export type Config = typeof configs.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;

// API Types
export type StartRequest = {
  token: string;
  message: string;
  channelIds: string[]; // Sent as array for API
  delaySeconds: number;
  imageUrls?: string[];
};

export type LogEntry = {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
};

export type StatusResponse = {
  isRunning: boolean;
  logs: LogEntry[];
};
