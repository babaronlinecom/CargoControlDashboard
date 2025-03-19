import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Import validation schemas
import {
  insertShipmentSchema,
  insertShipmentNoteSchema,
  insertRateFileSchema,
  insertRateEntrySchema,
  insertAramexApiLogSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertPaymentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes
  
  // Metrics Dashboard API
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Shipments API
  app.get("/api/shipments", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const dateRange = req.query.dateRange as string | undefined;
      const shipments = await storage.getShipments(status, dateRange);
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  app.get("/api/shipments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipmentById(id);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment details" });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const validationResult = insertShipmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const shipment = await storage.createShipment(validationResult.data);
      res.status(201).json(shipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create shipment" });
    }
  });

  app.patch("/api/shipments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const shipment = await storage.updateShipmentStatus(id, status);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shipment status" });
    }
  });

  app.post("/api/shipments/:id/notes", async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const validationResult = insertShipmentNoteSchema.safeParse({
        ...req.body,
        shipmentId
      });
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const note = await storage.addShipmentNote(validationResult.data);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to add shipment note" });
    }
  });

  // Rate Management API
  app.get("/api/rates/files", async (req, res) => {
    try {
      const files = await storage.getRateFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rate files" });
    }
  });

  app.get("/api/rates/entries/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const entries = await storage.getRateEntriesByFileId(fileId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rate entries" });
    }
  });

  app.post("/api/rates/upload", async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.files.file as any;
      
      if (file.mimetype !== 'text/csv') {
        return res.status(400).json({ message: "File must be a CSV" });
      }
      
      // Process the CSV file and create rate entries
      const result = await storage.processRateFile(file.name, file.data.toString());
      res.status(201).json(result);
    } catch (error) {
      console.error("Rate upload error:", error);
      res.status(500).json({ message: `Failed to process rate file: ${error.message}` });
    }
  });

  app.patch("/api/rates/entries", async (req, res) => {
    try {
      const { rates } = req.body;
      
      if (!Array.isArray(rates)) {
        return res.status(400).json({ message: "Rates must be an array" });
      }
      
      // Validate each rate entry
      for (const rate of rates) {
        const validationResult = insertRateEntrySchema.partial().safeParse(rate);
        
        if (!validationResult.success) {
          const error = fromZodError(validationResult.error);
          return res.status(400).json({ message: error.message });
        }
      }
      
      const updatedRates = await storage.updateRateEntries(rates);
      res.json(updatedRates);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rate entries" });
    }
  });

  // Aramex API Integration
  app.get("/api/aramex/status", async (req, res) => {
    try {
      const status = await storage.getAramexApiStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Aramex API status" });
    }
  });

  app.post("/api/aramex/calculate-rates", async (req, res) => {
    try {
      // Validate request
      const schema = z.object({
        originCountry: z.string(),
        originCity: z.string(),
        destinationCountry: z.string(),
        destinationCity: z.string(),
        weight: z.number(),
        packageType: z.string(),
        dimensions: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
        })
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('calculate-rates', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  app.post("/api/aramex/track", async (req, res) => {
    try {
      // Validate request
      const schema = z.object({
        trackingNumber: z.string()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('track', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  app.post("/api/aramex/locations", async (req, res) => {
    try {
      // Validate request
      const schema = z.object({
        country: z.string(),
        city: z.string().optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('locations', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  app.post("/api/aramex/shipments/create", async (req, res) => {
    try {
      // Validate request (simplified validation)
      if (!req.body.shipper || !req.body.consignee || !req.body.shipmentDetails) {
        return res.status(400).json({ 
          message: "Missing required fields: shipper, consignee, and shipmentDetails are required" 
        });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('create-shipment', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  app.post("/api/aramex/pickups/create", async (req, res) => {
    try {
      // Validate request (simplified validation)
      if (!req.body.pickup || !req.body.pickup.location) {
        return res.status(400).json({ 
          message: "Missing required fields: pickup information is required" 
        });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('create-pickup', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  app.post("/api/aramex/shipments/cancel", async (req, res) => {
    try {
      // Validate request
      const schema = z.object({
        shipmentNumber: z.string(),
        reason: z.string()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      // Make Aramex API call
      const result = await callAramexApi('cancel-shipment', req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: `Aramex API error: ${error.message}` });
    }
  });

  // Analytics API
  app.get("/api/analytics/shipments/trends", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      const chartType = req.query.chartType as string || "volume";
      
      const trends = await storage.getShipmentTrends(timeRange, chartType);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment trends" });
    }
  });

  app.get("/api/analytics/shipments/destinations", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      
      const destinations = await storage.getShipmentsByDestination(timeRange);
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment destinations" });
    }
  });

  app.get("/api/analytics/shipments/services", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      
      const services = await storage.getShipmentsByService(timeRange);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment services" });
    }
  });

  app.get("/api/analytics/statistics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      
      const statistics = await storage.getShipmentStatistics(timeRange);
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment statistics" });
    }
  });

  // Invoices API
  app.get("/api/invoices", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const dateRange = req.query.dateRange as string | undefined;
      const invoices = await storage.getInvoices(status, dateRange);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice details" });
    }
  });

  app.get("/api/invoices/number/:invoiceNumber", async (req, res) => {
    try {
      const invoiceNumber = req.params.invoiceNumber;
      const invoice = await storage.getInvoiceByNumber(invoiceNumber);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice details" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validationResult = insertInvoiceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const invoice = await storage.createInvoice(validationResult.data);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const invoice = await storage.updateInvoiceStatus(id, status);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  app.get("/api/invoices/:id/items", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const items = await storage.getInvoiceItems(invoiceId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice items" });
    }
  });

  app.post("/api/invoices/:id/items", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const validationResult = insertInvoiceItemSchema.safeParse({
        ...req.body,
        invoiceId
      });
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const item = await storage.addInvoiceItem(validationResult.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add invoice item" });
    }
  });

  app.patch("/api/invoices/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const item = await storage.updateInvoiceItem(id, updateData);
      
      if (!item) {
        return res.status(404).json({ message: "Invoice item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice item" });
    }
  });

  app.delete("/api/invoices/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoiceItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Invoice item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice item" });
    }
  });

  app.get("/api/invoices/:id/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const payments = await storage.getPaymentsByInvoiceId(invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/invoices/:id/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const validationResult = insertPaymentSchema.safeParse({
        ...req.body,
        invoiceId
      });
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const payment = await storage.addPayment(validationResult.data);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add payment" });
    }
  });

  app.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const pdfUrl = await storage.generateInvoicePdf(invoiceId);
      res.json({ pdfUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice PDF" });
    }
  });

  // Financial metrics
  app.get("/api/financial/metrics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      const metrics = await storage.getFinancialMetrics(timeRange);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial metrics" });
    }
  });

  app.get("/api/financial/revenue", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30days";
      const revenue = await storage.getRevenueByPeriod(timeRange);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });
  
  // Payments API (All payments across invoices)
  app.get("/api/payments", async (req, res) => {
    try {
      // Fetch all invoices
      const invoices = await storage.getInvoices();
      
      // Collect all payments for each invoice
      const allPayments = [];
      for (const invoice of invoices) {
        const payments = await storage.getPaymentsByInvoiceId(invoice.id);
        allPayments.push(...payments);
      }
      
      res.json(allPayments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Helper function to call Aramex API and log the request/response
  async function callAramexApi(endpoint: string, data: any) {
    const startTime = Date.now();
    const aramexEndpoint = getAramexEndpoint(endpoint);
    
    try {
      // Add Aramex API credentials
      const requestData = {
        ...data,
        clientInfo: getAramexCredentials()
      };
      
      // Call Aramex API
      const response = await axios.post(aramexEndpoint, requestData);
      const responseTime = Date.now() - startTime;
      
      // Log successful API call
      await storage.logAramexApiCall({
        endpoint,
        requestPayload: JSON.stringify(requestData),
        responsePayload: JSON.stringify(response.data),
        success: true,
        errorMessage: null,
        responseTime
      });
      
      return response.data;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.response?.data?.message || error.message;
      
      // Log failed API call
      await storage.logAramexApiCall({
        endpoint,
        requestPayload: JSON.stringify(data),
        responsePayload: error.response ? JSON.stringify(error.response.data) : null,
        success: false,
        errorMessage,
        responseTime
      });
      
      throw new Error(errorMessage);
    }
  }

  // Helper to get Aramex API credentials
  function getAramexCredentials() {
    return {
      accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || "1234567",
      accountPin: process.env.ARAMEX_ACCOUNT_PIN || "1234",
      accountEntity: process.env.ARAMEX_ACCOUNT_ENTITY || "LON",
      accountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE || "GB",
      userName: process.env.ARAMEX_USERNAME || "user@example.com",
      password: process.env.ARAMEX_PASSWORD || "password",
      version: "v1"
    };
  }

  // Helper to get the appropriate Aramex API endpoint
  function getAramexEndpoint(endpoint: string) {
    const baseUrl = process.env.ARAMEX_API_BASE_URL || "https://ws.aramex.net/api/";
    
    // Map endpoint names to actual Aramex API endpoints
    const endpoints: Record<string, string> = {
      'calculate-rates': `${baseUrl}shipping/calculate-rate`,
      'track': `${baseUrl}tracking/shipments`,
      'locations': `${baseUrl}locations/service-points`,
      'create-shipment': `${baseUrl}shipping/create-shipments`,
      'create-pickup': `${baseUrl}shipping/create-pickup`,
      'cancel-shipment': `${baseUrl}shipping/cancel-shipment`
    };
    
    return endpoints[endpoint] || baseUrl;
  }

  return httpServer;
}
