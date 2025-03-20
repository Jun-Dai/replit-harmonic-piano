import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the note tuning format
export const noteSchema = z.object({
  name: z.string(),
  ratioNumerator: z.number().int().positive(),
  ratioDenominator: z.number().int().positive(),
  cents: z.number(),
  frequency: z.number().optional(),
});

export type Note = z.infer<typeof noteSchema>;

// Define the tuning configuration format
export const tuningConfigurations = pgTable("tuning_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseFrequency: real("base_frequency").notNull().default(440),
  decayLength: real("decay_length").notNull().default(3.0),
  notes: jsonb("notes").notNull().$type<Record<string, Note>>(),
  createdBy: text("created_by"),
});

export const insertTuningConfigSchema = createInsertSchema(tuningConfigurations).omit({
  id: true
});

export type InsertTuningConfig = z.infer<typeof insertTuningConfigSchema>;
export type TuningConfig = typeof tuningConfigurations.$inferSelect;

// Schema for users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
