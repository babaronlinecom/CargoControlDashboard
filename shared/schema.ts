import { pgTable, text, serial, integer, boolean, timestamp, real as float, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
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

// Shipments table
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  destination: text("destination").notNull(),
  status: text("status").notNull(),
  date: timestamp("date").notNull(),
  customerName: text("customer_name").notNull(),
  origin: text("origin").notNull(),
  weight: float("weight"),
  serviceType: text("service_type"),
  dimensions: text("dimensions"), // JSON string with length, width, height
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect & {
  notes?: ShipmentNote[];
};

// Shipment notes table
export const shipmentNotes = pgTable("shipment_notes", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  createdBy: text("created_by"), // Optional user who created the note
});

export const insertShipmentNoteSchema = createInsertSchema(shipmentNotes).omit({
  id: true,
  timestamp: true,
});

export type InsertShipmentNote = z.infer<typeof insertShipmentNoteSchema>;
export type ShipmentNote = typeof shipmentNotes.$inferSelect;

// Rate files table
export const rateFiles = pgTable("rate_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  status: text("status").notNull(), // 'processed', 'error', 'pending'
  errorDetails: text("error_details"), // JSON string with error messages
});

export const insertRateFileSchema = createInsertSchema(rateFiles).omit({
  id: true,
  uploadDate: true,
});

export type InsertRateFile = z.infer<typeof insertRateFileSchema>;
export type RateFile = typeof rateFiles.$inferSelect & {
  errors?: string[];
};

// Rate entries table
export const rateEntries = pgTable("rate_entries", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => rateFiles.id),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  weight: text("weight").notNull(), // Could be like "5kg", "10kg", etc.
  serviceType: text("service_type").notNull(),
  rate: float("rate").notNull(),
  currency: text("currency").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
});

export const insertRateEntrySchema = createInsertSchema(rateEntries).omit({
  id: true,
});

export type InsertRateEntry = z.infer<typeof insertRateEntrySchema>;
export type RateEntry = typeof rateEntries.$inferSelect;

// Analytics data table (for caching frequently accessed metrics)
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(), // e.g., "shipment_volume", "delivery_time"
  timeRange: text("time_range").notNull(), // e.g., "7days", "30days"
  data: text("data").notNull(), // JSON string with the metric data
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({
  id: true,
  updatedAt: true,
});

export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type AnalyticsData = typeof analyticsData.$inferSelect;

// Aramex API logs
export const aramexApiLogs = pgTable("aramex_api_logs", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  requestPayload: text("request_payload"), // JSON string of the request
  responsePayload: text("response_payload"), // JSON string of the response
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  responseTime: integer("response_time"), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAramexApiLogSchema = createInsertSchema(aramexApiLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAramexApiLog = z.infer<typeof insertAramexApiLogSchema>;
export type AramexApiLog = typeof aramexApiLogs.$inferSelect;
