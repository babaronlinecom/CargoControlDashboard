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

// Invoice tables
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  awbNumber: text("awb_number").notNull(), // Air Waybill number
  status: text("status").notNull().default("unpaid"), // unpaid, paid, overdue, cancelled
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  totalAmount: float("total_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  notes: text("notes"),
  billingAddress: text("billing_address").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  pdfUrl: text("pdf_url"), // URL to the generated PDF
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice line items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: float("unit_price").notNull(),
  taxRate: float("tax_rate").default(0),
  discount: float("discount").default(0),
  lineTotal: float("line_total").notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Payment records
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  amount: float("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(), // credit_card, bank_transfer, cash, etc.
  transactionId: text("transaction_id"),
  notes: text("notes"),
  status: text("status").notNull().default("completed"), // completed, pending, failed, refunded
  receivedBy: text("received_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
