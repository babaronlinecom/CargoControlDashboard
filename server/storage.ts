import {
  users,
  type User,
  type InsertUser,
  shipments,
  type Shipment,
  type InsertShipment,
  shipmentNotes,
  type ShipmentNote,
  type InsertShipmentNote,
  rateFiles,
  type RateFile,
  type InsertRateFile,
  rateEntries,
  type RateEntry,
  type InsertRateEntry,
  aramexApiLogs,
  type AramexApiLog,
  type InsertAramexApiLog,
  analyticsData,
  type AnalyticsData,
  type InsertAnalyticsData,
  invoices,
  type Invoice,
  type InsertInvoice,
  invoiceItems,
  type InvoiceItem,
  type InsertInvoiceItem,
  payments,
  type Payment,
  type InsertPayment,
} from "@shared/schema";

// Mock data for tracking colors
const CHART_COLORS = [
  "rgba(30, 64, 175, 0.7)", // primary
  "rgba(59, 130, 246, 0.7)", // secondary
  "rgba(16, 185, 129, 0.7)", // green
  "rgba(245, 158, 11, 0.7)", // yellow
  "rgba(239, 68, 68, 0.7)", // red
];

export interface IStorage {
  // User methods (keeping the original ones)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shipment methods
  getShipments(status?: string, dateRange?: string): Promise<Shipment[]>;
  getShipmentById(id: number): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(
    id: number,
    status: string
  ): Promise<Shipment | undefined>;
  addShipmentNote(note: InsertShipmentNote): Promise<ShipmentNote>;

  // Rate management methods
  getRateFiles(): Promise<RateFile[]>;
  getRateEntriesByFileId(fileId: number): Promise<RateEntry[]>;
  processRateFile(filename: string, content: string): Promise<RateFile>;
  updateRateEntries(rates: Partial<RateEntry>[]): Promise<RateEntry[]>;

  // Aramex API methods
  getAramexApiStatus(): Promise<{
    connected: boolean;
    lastCall: string | null;
    responseTime: number | null;
  }>;
  logAramexApiCall(log: InsertAramexApiLog): Promise<AramexApiLog>;

  // Invoice and financial management methods
  getInvoices(status?: string, dateRange?: string): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  addInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(
    id: number,
    item: Partial<InvoiceItem>
  ): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;
  getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]>;
  addPayment(payment: InsertPayment): Promise<Payment>;
  generateInvoicePdf(invoiceId: number): Promise<string>; // Returns the URL to the PDF file
  getFinancialMetrics(timeRange: string): Promise<{
    totalRevenue: { value: number; change: number; period: string };
    outstandingBalance: { value: number; change: number; period: string };
    paidInvoices: { value: number; change: number; period: string };
    overdueInvoices: { value: number; change: number; period: string };
  }>;
  getRevenueByPeriod(timeRange: string): Promise<{
    labels: string[];
    data: number[];
  }>;

  // Analytics methods
  getDashboardMetrics(): Promise<{
    totalShipments: { value: number; change: number; period: string };
    activeDeliveries: { value: number; change: number; period: string };
    pendingApproval: { value: number; change: number; period: string };
    deliveryIssues: { value: number; change: number; period: string };
  }>;
  getShipmentTrends(
    timeRange: string,
    chartType: string
  ): Promise<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  }>;
  getShipmentsByDestination(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }>;
  getShipmentsByService(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }>;
  getShipmentStatistics(timeRange: string): Promise<{
    totalShipments: number;
    percentChange: number;
    avgDeliveryTime: number;
    deliveryTimeChange: number;
    onTimePercentage: number;
    onTimeChange: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shipments: Map<number, Shipment>;
  private shipmentNotes: Map<number, ShipmentNote>;
  private rateFiles: Map<number, RateFile>;
  private rateEntries: Map<number, RateEntry>;
  private aramexApiLogs: Map<number, AramexApiLog>;
  private analyticsData: Map<number, AnalyticsData>;

  // Financial model maps
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private payments: Map<number, Payment>;

  private currentUserId: number;
  private currentShipmentId: number;
  private currentNoteId: number;
  private currentRateFileId: number;
  private currentRateEntryId: number;
  private currentLogId: number;
  private currentAnalyticsDataId: number;
  private currentInvoiceId: number;
  private currentInvoiceItemId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.shipments = new Map();
    this.shipmentNotes = new Map();
    this.rateFiles = new Map();
    this.rateEntries = new Map();
    this.aramexApiLogs = new Map();
    this.analyticsData = new Map();

    // Initialize financial model maps
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.payments = new Map();

    this.currentUserId = 1;
    this.currentShipmentId = 1;
    this.currentNoteId = 1;
    this.currentRateFileId = 1;
    this.currentRateEntryId = 1;
    this.currentLogId = 1;
    this.currentAnalyticsDataId = 1;
    this.currentInvoiceId = 1;
    this.currentInvoiceItemId = 1;
    this.currentPaymentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods (keeping the original ones)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Shipment methods
  async getShipments(status?: string, dateRange?: string): Promise<Shipment[]> {
    let shipments = Array.from(this.shipments.values());

    // Filter by status if provided
    if (status && status !== "all") {
      shipments = shipments.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by date range if provided
    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "7days":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90days":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "thismonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
      }

      shipments = shipments.filter((s) => new Date(s.date) >= startDate);
    }

    // Add notes to each shipment
    return this.addNotesToShipments(shipments);
  }

  async getShipmentById(id: number): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    // Add notes to the shipment
    return (await this.addNotesToShipments([shipment]))[0];
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = this.currentShipmentId++;
    const shipment: Shipment = { ...insertShipment, id };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async updateShipmentStatus(
    id: number,
    status: string
  ): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    const updatedShipment = { ...shipment, status, updatedAt: new Date() };
    this.shipments.set(id, updatedShipment);

    // Add notes to the updated shipment
    return (await this.addNotesToShipments([updatedShipment]))[0];
  }

  async addShipmentNote(insertNote: InsertShipmentNote): Promise<ShipmentNote> {
    const id = this.currentNoteId++;
    const note: ShipmentNote = {
      ...insertNote,
      id,
      timestamp: new Date(),
    };

    this.shipmentNotes.set(id, note);
    return note;
  }

  // Rate management methods
  async getRateFiles(): Promise<RateFile[]> {
    return Array.from(this.rateFiles.values()).map((file) => {
      // Parse error details from JSON string if it exists
      if (file.errorDetails) {
        const errors = JSON.parse(file.errorDetails);
        return { ...file, errors };
      }
      return file;
    });
  }

  async getRateEntriesByFileId(fileId: number): Promise<RateEntry[]> {
    return Array.from(this.rateEntries.values()).filter(
      (entry) => entry.fileId === fileId
    );
  }

  async processRateFile(filename: string, content: string): Promise<RateFile> {
    // Create a new rate file entry
    const fileId = this.currentRateFileId++;
    const file: RateFile = {
      id: fileId,
      filename,
      uploadDate: new Date(),
      status: "pending",
      errorDetails: null,
    };

    try {
      // Simple parsing of CSV content
      const lines = content.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      // Validate headers
      const requiredHeaders = [
        "Origin",
        "Destination",
        "Weight",
        "ServiceType",
        "Rate",
        "Currency",
        "EffectiveDate",
        "ExpiryDate",
      ];

      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          throw new Error(`Missing required header: ${header}`);
        }
      }

      // Process data rows
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};

        // Create object from headers and values
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || "";
        }

        // Validate row data
        if (!row.Origin) errors.push(`Row ${i}: Missing Origin`);
        if (!row.Destination) errors.push(`Row ${i}: Missing Destination`);
        if (!row.Weight) errors.push(`Row ${i}: Missing Weight`);
        if (!row.ServiceType) errors.push(`Row ${i}: Missing ServiceType`);
        if (!row.Rate) errors.push(`Row ${i}: Missing Rate`);
        if (row.Rate && isNaN(parseFloat(row.Rate))) {
          errors.push(`Row ${i}: Rate must be a number`);
        }
        if (!row.Currency) errors.push(`Row ${i}: Missing Currency`);
        if (row.Currency && !/^[A-Z]{3}$/.test(row.Currency)) {
          errors.push(`Row ${i}: Currency must be a 3-letter code`);
        }
        if (!row.EffectiveDate) errors.push(`Row ${i}: Missing EffectiveDate`);
        if (!row.ExpiryDate) errors.push(`Row ${i}: Missing ExpiryDate`);

        // If no errors, create rate entry
        if (!errors.some((err) => err.startsWith(`Row ${i}:`))) {
          const entryId = this.currentRateEntryId++;
          const entry: RateEntry = {
            id: entryId,
            fileId,
            origin: row.Origin,
            destination: row.Destination,
            weight: row.Weight,
            serviceType: row.ServiceType,
            rate: parseFloat(row.Rate),
            currency: row.Currency,
            effectiveDate: new Date(row.EffectiveDate),
            expiryDate: new Date(row.ExpiryDate),
          };

          this.rateEntries.set(entryId, entry);
        }
      }

      // Update file status based on errors
      if (errors.length > 0) {
        file.status = "error";
        file.errorDetails = JSON.stringify(errors);
      } else {
        file.status = "processed";
      }
    } catch (error) {
      file.status = "error";
      file.errorDetails = JSON.stringify([error.message]);
    }

    // Save the file
    this.rateFiles.set(fileId, file);

    // Add errors to the returned file if needed
    if (file.errorDetails) {
      return {
        ...file,
        errors: JSON.parse(file.errorDetails),
      };
    }

    return file;
  }

  async updateRateEntries(rates: Partial<RateEntry>[]): Promise<RateEntry[]> {
    const updatedEntries: RateEntry[] = [];

    for (const rate of rates) {
      if (!rate.id) continue;

      const existingEntry = this.rateEntries.get(rate.id);
      if (existingEntry) {
        const updatedEntry = { ...existingEntry, ...rate };
        this.rateEntries.set(rate.id, updatedEntry);
        updatedEntries.push(updatedEntry);
      }
    }

    return updatedEntries;
  }

  // Aramex API methods
  async getAramexApiStatus(): Promise<{
    connected: boolean;
    lastCall: string | null;
    responseTime: number | null;
  }> {
    // Get the most recent API log
    const logs = Array.from(this.aramexApiLogs.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (logs.length === 0) {
      return {
        connected: false,
        lastCall: null,
        responseTime: null,
      };
    }

    const lastLog = logs[0];

    return {
      connected: lastLog.success,
      lastCall: lastLog.timestamp.toISOString(),
      responseTime: lastLog.responseTime || 0,
    };
  }

  async logAramexApiCall(insertLog: InsertAramexApiLog): Promise<AramexApiLog> {
    const id = this.currentLogId++;
    const log: AramexApiLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };

    this.aramexApiLogs.set(id, log);
    return log;
  }

  // Invoice and financial management methods
  async getInvoices(status?: string, dateRange?: string): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());

    // Filter by status if provided
    if (status && status !== "all") {
      invoices = invoices.filter(
        (i) => i.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by date range if provided
    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "7days":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90days":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "thismonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
      }

      invoices = invoices.filter((i) => new Date(i.issueDate) >= startDate);
    }

    return invoices;
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByNumber(
    invoiceNumber: string
  ): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.invoiceNumber === invoiceNumber
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoiceStatus(
    id: number,
    status: string
  ): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice = {
      ...invoice,
      status,
      updatedAt: new Date(),
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }

  async addInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.currentInvoiceItemId++;
    const item: InvoiceItem = {
      ...insertItem,
      id,
    };

    this.invoiceItems.set(id, item);

    // Update invoice total
    const invoice = this.invoices.get(insertItem.invoiceId);
    if (invoice) {
      const updatedInvoice = {
        ...invoice,
        totalAmount: invoice.totalAmount + insertItem.lineTotal,
        updatedAt: new Date(),
      };
      this.invoices.set(invoice.id, updatedInvoice);
    }

    return item;
  }

  async updateInvoiceItem(
    id: number,
    itemUpdate: Partial<InvoiceItem>
  ): Promise<InvoiceItem | undefined> {
    const item = this.invoiceItems.get(id);
    if (!item) return undefined;

    const originalTotal = item.lineTotal;
    const updatedItem = { ...item, ...itemUpdate };

    this.invoiceItems.set(id, updatedItem);

    // Update invoice total if the line total has changed
    if (updatedItem.lineTotal !== originalTotal) {
      const invoice = this.invoices.get(item.invoiceId);
      if (invoice) {
        const updatedInvoice = {
          ...invoice,
          totalAmount:
            invoice.totalAmount - originalTotal + updatedItem.lineTotal,
          updatedAt: new Date(),
        };
        this.invoices.set(invoice.id, updatedInvoice);
      }
    }

    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const item = this.invoiceItems.get(id);
    if (!item) return false;

    // Update invoice total
    const invoice = this.invoices.get(item.invoiceId);
    if (invoice) {
      const updatedInvoice = {
        ...invoice,
        totalAmount: Math.max(0, invoice.totalAmount - item.lineTotal), // Ensure never negative
        updatedAt: new Date(),
      };
      this.invoices.set(invoice.id, updatedInvoice);
    }

    this.invoiceItems.delete(id);
    return true;
  }

  async getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.invoiceId === invoiceId
    );
  }

  async addPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
    };

    this.payments.set(id, newPayment);

    // Update invoice status if the payment completes the amount
    const invoice = this.invoices.get(payment.invoiceId);
    if (invoice) {
      const allPayments = await this.getPaymentsByInvoiceId(invoice.id);
      const totalPaid =
        allPayments.reduce((sum, p) => sum + p.amount, 0) + payment.amount;

      if (totalPaid >= invoice.totalAmount) {
        const updatedInvoice = {
          ...invoice,
          status: "paid",
          updatedAt: new Date(),
        };
        this.invoices.set(invoice.id, updatedInvoice);
      } else if (invoice.status === "unpaid" && totalPaid > 0) {
        const updatedInvoice = {
          ...invoice,
          status: "partial",
          updatedAt: new Date(),
        };
        this.invoices.set(invoice.id, updatedInvoice);
      }
    }

    return newPayment;
  }

  async generateInvoicePdf(invoiceId: number): Promise<string> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    // Generate a barcode for tracking
    const barcode = invoice.awbNumber;

    // In a real implementation, we would generate an actual PDF here
    // For now, we'll just return a mock URL
    const pdfUrl = `/invoices/${invoice.invoiceNumber}.pdf`;

    // Update the invoice with the PDF URL
    const updatedInvoice = {
      ...invoice,
      pdfUrl,
      updatedAt: new Date(),
    };

    this.invoices.set(invoiceId, updatedInvoice);

    return pdfUrl;
  }

  async getFinancialMetrics(timeRange: string): Promise<{
    totalRevenue: { value: number; change: number; period: string };
    outstandingBalance: { value: number; change: number; period: string };
    paidInvoices: { value: number; change: number; period: string };
    overdueInvoices: { value: number; change: number; period: string };
  }> {
    const allInvoices = Array.from(this.invoices.values());
    const now = new Date();

    // Determine date ranges based on timeRange
    let currentStartDate: Date;
    let previousStartDate: Date;

    switch (timeRange) {
      case "7days":
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        currentStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Current period invoices
    const currentInvoices = allInvoices.filter(
      (i) => new Date(i.issueDate) >= currentStartDate
    );

    // Previous period invoices
    const previousInvoices = allInvoices.filter(
      (i) =>
        new Date(i.issueDate) >= previousStartDate &&
        new Date(i.issueDate) < currentStartDate
    );

    // Calculate total revenue
    const currentRevenue = currentInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    const previousRevenue = previousInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate outstanding balance
    const currentOutstanding = currentInvoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const previousOutstanding = previousInvoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const outstandingChange =
      previousOutstanding > 0
        ? ((currentOutstanding - previousOutstanding) / previousOutstanding) *
          100
        : 0;

    // Count paid invoices
    const currentPaidCount = currentInvoices.filter(
      (i) => i.status === "paid"
    ).length;
    const previousPaidCount = previousInvoices.filter(
      (i) => i.status === "paid"
    ).length;
    const paidChange =
      previousPaidCount > 0
        ? ((currentPaidCount - previousPaidCount) / previousPaidCount) * 100
        : 0;

    // Count overdue invoices
    const currentOverdueCount = currentInvoices.filter(
      (i) => i.status !== "paid" && new Date(i.dueDate) < now
    ).length;
    const previousOverdueCount = previousInvoices.filter(
      (i) => i.status !== "paid" && new Date(i.dueDate) < currentStartDate
    ).length;
    const overdueChange =
      previousOverdueCount > 0
        ? ((currentOverdueCount - previousOverdueCount) /
            previousOverdueCount) *
          100
        : 0;

    return {
      totalRevenue: {
        value: currentRevenue,
        change: revenueChange,
        period: timeRange === "7days" ? "last week" : "last month",
      },
      outstandingBalance: {
        value: currentOutstanding,
        change: outstandingChange,
        period: timeRange === "7days" ? "last week" : "last month",
      },
      paidInvoices: {
        value: currentPaidCount,
        change: paidChange,
        period: timeRange === "7days" ? "last week" : "last month",
      },
      overdueInvoices: {
        value: currentOverdueCount,
        change: overdueChange,
        period: timeRange === "7days" ? "last week" : "last month",
      },
    };
  }

  async getRevenueByPeriod(timeRange: string): Promise<{
    labels: string[];
    data: number[];
  }> {
    const allInvoices = Array.from(this.invoices.values());
    const now = new Date();

    // Determine date range and format based on timeRange
    let startDate: Date;
    let labels: string[] = [];
    let format: string;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        format = "day";
        // Generate last 7 days as labels
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(
            date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          );
        }
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        format = "week";
        // Generate last 13 weeks (90 days) as labels
        for (let i = 12; i >= 0; i--) {
          const weekStart = new Date(
            now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
          );
          const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          labels.push(
            `${weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}-${weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`
          );
        }
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        format = "month";
        // Generate last 12 months as labels
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(date.toLocaleDateString("en-US", { month: "short" }));
        }
        break;
      case "30days":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        format = "day";
        // Generate last 6 periods (5 days each) as labels
        for (let i = 5; i >= 0; i--) {
          const endDay = now.getTime() - i * 5 * 24 * 60 * 60 * 1000;
          const startDay = endDay - 5 * 24 * 60 * 60 * 1000;
          labels.push(
            `${new Date(startDay).getDate()}-${new Date(
              endDay
            ).getDate()} ${new Date(endDay).toLocaleDateString("en-US", {
              month: "short",
            })}`
          );
        }
    }

    // Filter invoices within the time range
    const filteredInvoices = allInvoices.filter(
      (i) => new Date(i.issueDate) >= startDate
    );

    // Calculate revenue per period
    const data = new Array(labels.length).fill(0);

    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.issueDate);
      let index = 0;

      if (format === "day" && timeRange === "7days") {
        // For 7 days, each label is a single day
        const daysSinceStart = Math.floor(
          (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysSinceStart >= 0 && daysSinceStart < 7) {
          index = daysSinceStart;
        }
      } else if (format === "day" && timeRange === "30days") {
        // For 30 days, each label is a 5-day period
        const daysSinceStart = Math.floor(
          (date.getTime() - startDate.getTime()) / (24 * 660 * 1000)
        );
        if (daysSinceStart >= 0 && daysSinceStart < 30) {
          index = Math.floor(daysSinceStart / 5);
        }
      } else if (format === "week") {
        // For 90 days, each label is a week
        const weeksSinceStart = Math.floor(
          (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        if (weeksSinceStart >= 0 && weeksSinceStart < 13) {
          index = weeksSinceStart;
        }
      } else if (format === "month") {
        // For 1 year, each label is a month
        const monthsSinceStart =
          (date.getFullYear() - startDate.getFullYear()) * 12 +
          (date.getMonth() - startDate.getMonth());
        if (monthsSinceStart >= 0 && monthsSinceStart < 12) {
          index = monthsSinceStart;
        }
      }

      if (index >= 0 && index < data.length) {
        data[index] += invoice.totalAmount;
      }
    });

    return { labels, data };
  }

  // Analytics methods
  async getDashboardMetrics(): Promise<{
    totalShipments: { value: number; change: number; period: string };
    activeDeliveries: { value: number; change: number; period: string };
    pendingApproval: { value: number; change: number; period: string };
    deliveryIssues: { value: number; change: number; period: string };
  }> {
    // Get shipments data
    const allShipments = Array.from(this.shipments.values());
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Shipments in the last 30 days
    const recentShipments = allShipments.filter(
      (s) => new Date(s.date) >= thirtyDaysAgo
    );

    // Shipments in the previous 30 days (30-60 days ago)
    const previousShipments = allShipments.filter(
      (s) =>
        new Date(s.date) >= sixtyDaysAgo && new Date(s.date) < thirtyDaysAgo
    );

    // Total shipments
    const totalShipments = recentShipments.length;
    const previousTotalShipments = previousShipments.length;
    const totalShipmentsChange =
      previousTotalShipments > 0
        ? ((totalShipments - previousTotalShipments) / previousTotalShipments) *
          100
        : 0;

    // Active deliveries (in transit)
    const activeDeliveries = recentShipments.filter(
      (s) => s.status.toLowerCase() === "in transit"
    ).length;
    const previousActiveDeliveries = previousShipments.filter(
      (s) => s.status.toLowerCase() === "in transit"
    ).length;
    const activeDeliveriesChange =
      previousActiveDeliveries > 0
        ? ((activeDeliveries - previousActiveDeliveries) /
            previousActiveDeliveries) *
          100
        : 0;

    // Pending approval
    const pendingApproval = recentShipments.filter(
      (s) => s.status.toLowerCase() === "pending"
    ).length;
    const previousPendingApproval = previousShipments.filter(
      (s) => s.status.toLowerCase() === "pending"
    ).length;
    const pendingApprovalChange =
      previousPendingApproval > 0
        ? ((pendingApproval - previousPendingApproval) /
            previousPendingApproval) *
          100
        : 0;

    // Delivery issues (cancelled)
    const deliveryIssues = recentShipments.filter(
      (s) => s.status.toLowerCase() === "cancelled"
    ).length;
    const previousDeliveryIssues = previousShipments.filter(
      (s) => s.status.toLowerCase() === "cancelled"
    ).length;
    const deliveryIssuesChange =
      previousDeliveryIssues > 0
        ? ((deliveryIssues - previousDeliveryIssues) / previousDeliveryIssues) *
          100
        : 0;

    return {
      totalShipments: {
        value: totalShipments,
        change: totalShipmentsChange,
        period: "last month",
      },
      activeDeliveries: {
        value: activeDeliveries,
        change: activeDeliveriesChange,
        period: "last week",
      },
      pendingApproval: {
        value: pendingApproval,
        change: pendingApprovalChange,
        period: "last week",
      },
      deliveryIssues: {
        value: deliveryIssues,
        change: deliveryIssuesChange,
        period: "last week",
      },
    };
  }

  async getShipmentTrends(
    timeRange: string,
    chartType: string
  ): Promise<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  }> {
    // Get all shipments
    const allShipments = Array.from(this.shipments.values());

    // Determine date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;
    let labels: string[] = [];
    let format: string;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        format = "day";
        // Generate last 7 days as labels
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(
            date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          );
        }
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        format = "week";
        // Generate last 13 weeks (90 days) as labels
        for (let i = 12; i >= 0; i--) {
          labels.push(`Week ${i + 1}`);
        }
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        format = "month";
        // Generate last 12 months as labels
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(date.toLocaleDateString("en-US", { month: "short" }));
        }
        break;
      case "30days":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        format = "day";
        // Generate last 6 periods (5 days each) as labels
        for (let i = 5; i >= 0; i--) {
          const endDay = now.getTime() - i * 5 * 24 * 60 * 60 * 1000;
          const startDay = endDay - 5 * 24 * 60 * 60 * 1000;
          labels.push(
            `${new Date(startDay).getDate()}-${new Date(
              endDay
            ).getDate()} ${new Date(endDay).toLocaleDateString("en-US", {
              month: "short",
            })}`
          );
        }
    }

    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      (s) => new Date(s.date) >= startDate
    );

    // Prepare datasets based on chart type
    if (chartType === "volume") {
      // Group shipments by service type (Express vs Standard)
      const expressShipments = filteredShipments.filter((s) =>
        s.serviceType?.toLowerCase().includes("express")
      );
      const standardShipments = filteredShipments.filter(
        (s) => !s.serviceType?.toLowerCase().includes("express")
      );

      // Count shipments per period based on the format
      const expressData = countShipmentsPerPeriod(
        expressShipments,
        labels,
        format
      );
      const standardData = countShipmentsPerPeriod(
        standardShipments,
        labels,
        format
      );

      return {
        labels,
        datasets: [
          {
            label: "Express Deliveries",
            backgroundColor: "rgba(30, 64, 175, 0.1)",
            borderColor: "rgba(30, 64, 175, 1)",
            data: expressData,
          },
          {
            label: "Standard Deliveries",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)",
            data: standardData,
          },
        ],
      };
    } else if (chartType === "revenue") {
      // Calculate revenue (rate * weight) per period
      const expressRevenue = calculateRevenuePerPeriod(
        filteredShipments.filter((s) =>
          s.serviceType?.toLowerCase().includes("express")
        ),
        labels,
        format
      );
      const standardRevenue = calculateRevenuePerPeriod(
        filteredShipments.filter(
          (s) => !s.serviceType?.toLowerCase().includes("express")
        ),
        labels,
        format
      );

      return {
        labels,
        datasets: [
          {
            label: "Express Revenue",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 1)",
            data: expressRevenue,
          },
          {
            label: "Standard Revenue",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 1)",
            data: standardRevenue,
          },
        ],
      };
    } else {
      // Weight per period
      const expressWeight = calculateWeightPerPeriod(
        filteredShipments.filter((s) =>
          s.serviceType?.toLowerCase().includes("express")
        ),
        labels,
        format
      );
      const standardWeight = calculateWeightPerPeriod(
        filteredShipments.filter(
          (s) => !s.serviceType?.toLowerCase().includes("express")
        ),
        labels,
        format
      );

      return {
        labels,
        datasets: [
          {
            label: "Express Weight (kg)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 1)",
            data: expressWeight,
          },
          {
            label: "Standard Weight (kg)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 1)",
            data: standardWeight,
          },
        ],
      };
    }
  }

  async getShipmentsByDestination(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }> {
    // Get all shipments
    const allShipments = Array.from(this.shipments.values());

    // Determine date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      (s) => new Date(s.date) >= startDate
    );

    // Group shipments by destination
    const destinationCounts = new Map<string, number>();

    filteredShipments.forEach((shipment) => {
      const destination = shipment.destination;
      destinationCounts.set(
        destination,
        (destinationCounts.get(destination) || 0) + 1
      );
    });

    // Sort destinations by count (descending) and take top 5
    const topDestinations = Array.from(destinationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Calculate "Other" category
    const otherCount =
      filteredShipments.length -
      topDestinations.reduce((sum, [_, count]) => sum + count, 0);

    // Prepare chart data
    const labels = [...topDestinations.map(([dest]) => dest)];
    const data = [...topDestinations.map(([_, count]) => count)];

    // Add "Other" category if there are more destinations
    if (otherCount > 0) {
      labels.push("Other");
      data.push(otherCount);
    }

    // Assign colors
    const backgroundColor = labels.map(
      (_, i) => CHART_COLORS[i % CHART_COLORS.length]
    );

    return {
      labels,
      data,
      backgroundColor,
    };
  }

  async getShipmentsByService(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }> {
    // Get all shipments
    const allShipments = Array.from(this.shipments.values());

    // Determine date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      (s) => new Date(s.date) >= startDate
    );

    // Define service types
    const serviceTypes = [
      "Express",
      "Standard",
      "Economy",
      "Same Day",
      "International",
    ];

    // Count shipments by service type
    const serviceCounts = serviceTypes.map((type) => {
      return {
        type,
        count: filteredShipments.filter((s) =>
          s.serviceType?.toLowerCase().includes(type.toLowerCase())
        ).length,
      };
    });

    // Calculate "Other" category (shipments without a recognized service type)
    const otherCount =
      filteredShipments.length -
      serviceCounts.reduce((sum, { count }) => sum + count, 0);

    // Prepare chart data
    const labels = serviceCounts.map((s) => s.type);
    const data = serviceCounts.map((s) => s.count);

    // Add "Other" category if there are shipments with unrecognized service types
    if (otherCount > 0) {
      labels.push("Other");
      data.push(otherCount);
    }

    // Assign colors
    const backgroundColor = labels.map(
      (_, i) => CHART_COLORS[i % CHART_COLORS.length]
    );

    return {
      labels,
      data,
      backgroundColor,
    };
  }

  async getShipmentStatistics(timeRange: string): Promise<{
    totalShipments: number;
    percentChange: number;
    avgDeliveryTime: number;
    deliveryTimeChange: number;
    onTimePercentage: number;
    onTimeChange: number;
  }> {
    // Get all shipments
    const allShipments = Array.from(this.shipments.values());

    // Determine date ranges based on timeRange parameter
    const now = new Date();
    let currentStartDate: Date;
    let previousStartDate: Date;

    switch (timeRange) {
      case "7days":
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        currentStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Filter shipments within the current period
    const currentShipments = allShipments.filter(
      (s) => new Date(s.date) >= currentStartDate
    );

    // Filter shipments within the previous period
    const previousShipments = allShipments.filter(
      (s) =>
        new Date(s.date) >= previousStartDate &&
        new Date(s.date) < currentStartDate
    );

    // Calculate total shipments
    const totalShipments = currentShipments.length;
    const previousTotalShipments = previousShipments.length;

    // Calculate percent change in total shipments
    const percentChange =
      previousTotalShipments > 0
        ? ((totalShipments - previousTotalShipments) / previousTotalShipments) *
          100
        : 0;

    // Calculate average delivery time (in days)
    const avgDeliveryTime = calculateAverageDeliveryTime(currentShipments);
    const previousAvgDeliveryTime =
      calculateAverageDeliveryTime(previousShipments);

    // Calculate percent change in delivery time
    const deliveryTimeChange =
      previousAvgDeliveryTime > 0
        ? ((avgDeliveryTime - previousAvgDeliveryTime) /
            previousAvgDeliveryTime) *
          100
        : 0;

    // Calculate on-time delivery percentage
    const onTimePercentage = calculateOnTimePercentage(currentShipments);
    const previousOnTimePercentage =
      calculateOnTimePercentage(previousShipments);

    // Calculate change in on-time delivery percentage
    const onTimeChange =
      previousOnTimePercentage > 0
        ? onTimePercentage - previousOnTimePercentage
        : 0;

    return {
      totalShipments,
      percentChange,
      avgDeliveryTime,
      deliveryTimeChange,
      onTimePercentage,
      onTimeChange,
    };
  }

  // Helper methods
  private async addNotesToShipments(
    shipments: Shipment[]
  ): Promise<Shipment[]> {
    const shipmentIds = shipments.map((s) => s.id);

    // Get all notes for these shipments
    const notes = Array.from(this.shipmentNotes.values()).filter((note) =>
      shipmentIds.includes(note.shipmentId)
    );

    // Group notes by shipment id
    const notesByShipmentId = new Map<number, ShipmentNote[]>();

    notes.forEach((note) => {
      const shipmentId = note.shipmentId;
      const shipmentNotes = notesByShipmentId.get(shipmentId) || [];
      shipmentNotes.push(note);
      notesByShipmentId.set(shipmentId, shipmentNotes);
    });

    // Add notes to each shipment
    return shipments.map((shipment) => {
      const shipmentNotes = notesByShipmentId.get(shipment.id) || [];
      return {
        ...shipment,
        notes: shipmentNotes,
      };
    });
  }

  // Initialize sample data for demo purposes
  private initializeSampleData() {
    // Sample shipments with diverse statuses and dates
    const sampleShipments: Partial<Shipment>[] = [
      // Recent shipments
      {
        trackingNumber: "ARX-78294-2",
        destination: "Dubai, UAE",
        status: "Delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        customerName: "Ahmed Al Mansoor",
        origin: "London, UK",
        weight: 5.2,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 30, width: 20, height: 10 }),
      },
      {
        trackingNumber: "ARX-65432-8",
        destination: "Riyadh, KSA",
        status: "In Transit",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        customerName: "Fatima Al Saud",
        origin: "Cairo, Egypt",
        weight: 3.8,
        serviceType: "Standard",
        dimensions: JSON.stringify({ length: 25, width: 15, height: 8 }),
      },
      // Pending shipments
      {
        trackingNumber: "ARX-92134-4",
        destination: "Kuwait City, Kuwait",
        status: "Pending",
        date: new Date(),
        customerName: "Mohammed Al Kazemi",
        origin: "Doha, Qatar",
        weight: 7.1,
        serviceType: "Economy",
        dimensions: JSON.stringify({ length: 40, width: 30, height: 20 }),
      },
      // Problem shipments
      {
        trackingNumber: "ARX-35671-6",
        destination: "Doha, Qatar",
        status: "Delayed",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        customerName: "Aisha Al Thani",
        origin: "Abu Dhabi, UAE",
        weight: 2.3,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 20, width: 15, height: 10 }),
      },
      {
        trackingNumber: "ARX-43219-10",
        destination: "Manama, Bahrain",
        status: "Lost",
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        customerName: "Ali Al Bahraini",
        origin: "Muscat, Oman",
        weight: 4.5,
        serviceType: "Standard",
        dimensions: JSON.stringify({ length: 35, width: 25, height: 15 }),
      },
      // Historical shipments
      {
        trackingNumber: "ARX-11111-1",
        destination: "Sharjah, UAE",
        status: "Delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 30)),
        customerName: "Hassan Ahmed",
        origin: "Mumbai, India",
        weight: 1.5,
        serviceType: "Economy",
        dimensions: JSON.stringify({ length: 15, width: 10, height: 5 }),
      },
      {
        trackingNumber: "ARX-22222-2",
        destination: "Abu Dhabi, UAE",
        status: "Cancelled",
        date: new Date(new Date().setDate(new Date().getDate() - 15)),
        customerName: "Layla Mohammed",
        origin: "Istanbul, Turkey",
        weight: 8.7,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 45, width: 35, height: 25 }),
      },
      {
        trackingNumber: "ARX-78294-2",
        destination: "Dubai, UAE",
        status: "Delivered",
        date: new Date("2023-08-12"),
        customerName: "Ahmed Al Mansoor",
        origin: "London, UK",
        weight: 5.2,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 30, width: 20, height: 10 }),
      },
      {
        trackingNumber: "ARX-65432-9",
        destination: "Riyadh, KSA",
        status: "In Transit",
        date: new Date("2023-08-14"),
        customerName: "Fatima Al Saud",
        origin: "Cairo, Egypt",
        weight: 3.8,
        serviceType: "Standard",
        dimensions: JSON.stringify({ length: 25, width: 15, height: 8 }),
      },
      {
        trackingNumber: "ARX-92134-3",
        destination: "Kuwait City, Kuwait",
        status: "Pending",
        date: new Date("2023-08-15"),
        customerName: "Mohammed Al Kazemi",
        origin: "Doha, Qatar",
        weight: 7.1,
        serviceType: "Economy",
        dimensions: JSON.stringify({ length: 40, width: 30, height: 20 }),
      },
      {
        trackingNumber: "ARX-35671-5",
        destination: "Doha, Qatar",
        status: "Cancelled",
        date: new Date("2023-08-11"),
        customerName: "Aisha Al Thani",
        origin: "Abu Dhabi, UAE",
        weight: 2.3,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 20, width: 15, height: 10 }),
      },
      {
        trackingNumber: "ARX-43219-9",
        destination: "Manama, Bahrain",
        status: "In Transit",
        date: new Date("2023-08-16"),
        customerName: "Ali Al Bahraini",
        origin: "Muscat, Oman",
        weight: 4.5,
        serviceType: "Standard",
        dimensions: JSON.stringify({ length: 35, width: 25, height: 15 }),
      },
    ];

    // Add sample shipments
    sampleShipments.forEach((shipment) => {
      const id = this.currentShipmentId++;
      this.shipments.set(id, { ...shipment, id } as Shipment);
    });

    // Add sample shipment notes
    const sampleNotes: Partial<ShipmentNote>[] = [
      {
        shipmentId: 1,
        text: "Package handed to courier for delivery",
        timestamp: new Date("2023-08-12T10:30:00"),
        createdBy: "System",
      },
      {
        shipmentId: 1,
        text: "Delivery completed, signed by recipient",
        timestamp: new Date("2023-08-12T14:45:00"),
        createdBy: "Delivery Agent",
      },
      {
        shipmentId: 2,
        text: "Package in transit to destination",
        timestamp: new Date("2023-08-14T08:15:00"),
        createdBy: "System",
      },
      {
        shipmentId: 3,
        text: "Awaiting pickup by courier",
        timestamp: new Date("2023-08-15T09:20:00"),
        createdBy: "System",
      },
    ];

    // Add sample notes
    sampleNotes.forEach((note) => {
      const id = this.currentNoteId++;
      this.shipmentNotes.set(id, { ...note, id } as ShipmentNote);
    });

    // Sample rate entries
    const sampleRateFiles: Partial<RateFile>[] = [
      {
        filename: "rates_2023_q3.csv",
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        status: "active",
        recordCount: 150,
      },
      {
        filename: "rates_2023_q2.csv",
        uploadDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        status: "archived",
        recordCount: 120,
      },
    ];

    // Add sample rate files
    sampleRateFiles.forEach((file) => {
      const id = this.currentRateFileId++;
      this.rateFiles.set(id, { ...file, id } as RateFile);
    });

    // Sample rate entries
    const sampleRateEntries: Partial<RateEntry>[] = [
      {
        fileId: 1,
        origin: "Dubai",
        destination: "London",
        weight: "0-5kg",
        serviceType: "Express",
        rate: 150.0,
        currency: "USD",
      },
      {
        fileId: 1,
        origin: "Dubai",
        destination: "London",
        weight: "5-10kg",
        serviceType: "Express",
        rate: 250.0,
        currency: "USD",
      },
      {
        fileId: 1,
        origin: "Dubai",
        destination: "New York",
        weight: "0-5kg",
        serviceType: "Standard",
        rate: 100.0,
        currency: "USD",
      },
    ];

    // Add sample rate entries
    sampleRateEntries.forEach((entry) => {
      const id = this.currentRateEntryId++;
      this.rateEntries.set(id, { ...entry, id } as RateEntry);
    });

    // Sample Aramex API logs
    const sampleApiLogs: Partial<AramexApiLog>[] = [
      {
        endpoint: "/shipping/rate-calculator",
        requestPayload: JSON.stringify({
          origin: "Dubai",
          destination: "London",
          weight: 5.2,
          serviceType: "Express",
        }),
        responsePayload: JSON.stringify({
          totalRate: 150.0,
          currency: "USD",
          estimatedDays: 3,
        }),
        timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
        status: "success",
        responseTime: 250,
      },
      {
        endpoint: "/tracking/shipment-status",
        requestPayload: JSON.stringify({
          trackingNumber: "ARX-78294-2",
        }),
        responsePayload: JSON.stringify({
          status: "Delivered",
          location: "Dubai",
          timestamp: new Date(),
        }),
        timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
        status: "success",
        responseTime: 180,
      },
      {
        endpoint: "/shipping/create-shipment",
        requestPayload: JSON.stringify({
          origin: "Dubai",
          destination: "Riyadh",
          weight: 3.8,
          serviceType: "Standard",
        }),
        responsePayload: JSON.stringify({
          error: "Invalid destination address",
          code: "ERR_INVALID_ADDRESS",
        }),
        timestamp: new Date(
          new Date().setMinutes(new Date().getMinutes() - 30)
        ),
        status: "error",
        responseTime: 350,
      },
    ];

    // Add sample API logs
    sampleApiLogs.forEach((log) => {
      const id = this.currentLogId++;
      this.aramexApiLogs.set(id, { ...log, id } as AramexApiLog);
    });

    // Sample data will be handled by the DatabaseStorage implementation

    // Sample invoices
    const sampleInvoices: Partial<Invoice>[] = [
      {
        invoiceNumber: "INV-2023-001",
        awbNumber: "33449959723",
        status: "paid",
        issueDate: new Date("2023-08-10"),
        dueDate: new Date("2023-09-10"),
        totalAmount: 750.5,
        currency: "USD",
        notes: "Priority shipment service",
        billingAddress: "123 Financial District, Dubai, UAE",
        shippingAddress: "456 Business Bay, Dubai, UAE",
        customerName: "Ahmed Al Mansoor",
        customerEmail: "ahmed@example.com",
        customerPhone: "+971-50-1234567",
        pdfUrl: "/invoices/INV-2023-001.pdf",
      },
      {
        invoiceNumber: "INV-2023-002",
        awbNumber: "33449959724",
        status: "unpaid",
        issueDate: new Date("2023-08-15"),
        dueDate: new Date("2023-09-15"),
        totalAmount: 458.75,
        currency: "USD",
        notes: "Standard international shipping",
        billingAddress: "789 Sheikh Zayed Road, Dubai, UAE",
        shippingAddress: "321 Marina District, Dubai, UAE",
        customerName: "Mohammed Ali",
        customerEmail: "mohammed@example.com",
        customerPhone: "+971-55-9876543",
      },
      {
        invoiceNumber: "INV-2023-003",
        awbNumber: "33449959725",
        status: "overdue",
        issueDate: new Date("2023-07-20"),
        dueDate: new Date("2023-08-20"),
        totalAmount: 1250.0,
        currency: "USD",
        notes: "Express international delivery with insurance",
        billingAddress: "567 Downtown Area, Dubai, UAE",
        shippingAddress: "890 Dubai Mall, Dubai, UAE",
        customerName: "Sara Khan",
        customerEmail: "sara@example.com",
        customerPhone: "+971-52-5557777",
      },
    ];

    // Sample invoice items
    const sampleInvoiceItems: Partial<InvoiceItem>[] = [
      {
        invoiceId: 1,
        description: "Express International Shipping (ARX-78294-2)",
        quantity: 1,
        unitPrice: 650.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 682.5,
      },
      {
        invoiceId: 1,
        description: "Packaging and Handling Fee",
        quantity: 1,
        unitPrice: 50.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 52.5,
      },
      {
        invoiceId: 1,
        description: "Insurance Premium",
        quantity: 1,
        unitPrice: 15.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 15.75,
      },
      {
        invoiceId: 2,
        description: "Standard International Shipping (ARX-78294-2)",
        quantity: 1,
        unitPrice: 385.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 404.25,
      },
      {
        invoiceId: 2,
        description: "Customs Documentation Fee",
        quantity: 1,
        unitPrice: 45.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 47.25,
      },
      {
        invoiceId: 2,
        description: "Tracking Service",
        quantity: 1,
        unitPrice: 7.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 7.35,
      },
      {
        invoiceId: 3,
        description: "Premium Express Shipping (ARX-78294-3)",
        quantity: 1,
        unitPrice: 950.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 997.5,
      },
      {
        invoiceId: 3,
        description: "Premium Insurance Coverage",
        quantity: 1,
        unitPrice: 200.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 210.0,
      },
      {
        invoiceId: 3,
        description: "Priority Handling",
        quantity: 1,
        unitPrice: 40.0,
        taxRate: 5,
        discount: 0,
        lineTotal: 42.5,
      },
    ];

    // Sample payments
    const samplePayments: Partial<Payment>[] = [
      {
        invoiceId: 1,
        amount: 750.5,
        paymentDate: new Date("2023-08-25"),
        paymentMethod: "credit_card",
        transactionId: "TXN-12345-ABCDE",
        notes: "Payment received in full",
        status: "completed",
        receivedBy: "Online Payment System",
      },
      {
        invoiceId: 3,
        amount: 500.0,
        paymentDate: new Date("2023-08-15"),
        paymentMethod: "bank_transfer",
        transactionId: "WIRE-67890-FGHIJ",
        notes: "Partial payment received",
        status: "completed",
        receivedBy: "Finance Department",
      },
    ];

    // Process sample invoices
    for (const invoiceData of sampleInvoices) {
      const id = ++this.currentInvoiceId;
      const invoice: Invoice = { ...invoiceData, id } as Invoice;
      this.invoices.set(id, invoice);
    }

    // Process sample invoice items
    for (const itemData of sampleInvoiceItems) {
      const id = ++this.currentInvoiceItemId;
      const item: InvoiceItem = { ...itemData, id } as InvoiceItem;
      this.invoiceItems.set(id, item);
    }

    // Process sample payments
    for (const paymentData of samplePayments) {
      const id = ++this.currentPaymentId;
      const payment: Payment = { ...paymentData, id } as Payment;
      this.payments.set(id, payment);
    }

    // Additional rate files
    const additionalRateFiles: Partial<RateFile>[] = [
      {
        filename: "rates_update_aug2023.csv",
        uploadDate: new Date("2023-08-15"),
        status: "processed",
      },
      {
        filename: "special_rates_q3.csv",
        uploadDate: new Date("2023-07-28"),
        status: "processed",
      },
      {
        filename: "express_rates_update.csv",
        uploadDate: new Date("2023-07-15"),
        status: "processed",
      },
    ];

    // Add additional rate files
    additionalRateFiles.forEach((file) => {
      const id = this.currentRateFileId++;
      this.rateFiles.set(id, { ...file, id } as RateFile);
    });

    // Additional rate entries
    const additionalRateEntries: Partial<RateEntry>[] = [
      {
        fileId: 1,
        origin: "London",
        destination: "Dubai",
        weight: "5kg",
        serviceType: "Express",
        rate: 45.0,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31"),
      },
      {
        fileId: 1,
        origin: "London",
        destination: "Riyadh",
        weight: "5kg",
        serviceType: "Express",
        rate: 52.5,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31"),
      },
      {
        fileId: 1,
        origin: "London",
        destination: "Dubai",
        weight: "10kg",
        serviceType: "Express",
        rate: 85.0,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31"),
      },
      {
        fileId: 2,
        origin: "Dubai",
        destination: "Riyadh",
        weight: "5kg",
        serviceType: "Standard",
        rate: 25.0,
        currency: "USD",
        effectiveDate: new Date("2023-07-01"),
        expiryDate: new Date("2023-09-30"),
      },
      {
        fileId: 3,
        origin: "Dubai",
        destination: "Doha",
        weight: "5kg",
        serviceType: "Express",
        rate: 30.0,
        currency: "USD",
        effectiveDate: new Date("2023-07-15"),
        expiryDate: new Date("2023-10-31"),
      },
    ];

    // Add additional rate entries
    additionalRateEntries.forEach((entry) => {
      const id = this.currentRateEntryId++;
      this.rateEntries.set(id, { ...entry, id } as RateEntry);
    });

    // Additional Aramex API logs
    const additionalApiLogs: Partial<AramexApiLog>[] = [
      {
        endpoint: "track",
        requestPayload: JSON.stringify({ trackingNumber: "ARX-78294-2" }),
        responsePayload: JSON.stringify({
          status: "Delivered",
          details: "Package delivered on Aug 12, 2023",
        }),
        success: true,
        responseTime: 245,
        timestamp: new Date("2023-08-16T14:32:21"),
      },
      {
        endpoint: "calculate-rates",
        requestPayload: JSON.stringify({
          origin: "London",
          destination: "Dubai",
          weight: 5,
        }),
        responsePayload: JSON.stringify({ rate: 45.0, currency: "USD" }),
        success: true,
        responseTime: 312,
        timestamp: new Date("2023-08-16T13:45:17"),
      },
      {
        endpoint: "locations",
        requestPayload: JSON.stringify({ country: "UAE", city: "Dubai" }),
        responsePayload: JSON.stringify({
          locations: [
            {
              name: "Aramex Dubai Main Office",
              address: "Sheikh Zayed Road, Dubai",
            },
          ],
        }),
        success: true,
        responseTime: 278,
        timestamp: new Date("2023-08-15T10:22:43"),
      },
    ];

    // Add additional API logs
    additionalApiLogs.forEach((log) => {
      const id = this.currentLogId++;
      this.aramexApiLogs.set(id, { ...log, id } as AramexApiLog);
    });

    // Additional analytics data
    const additionalAnalytics: Partial<AnalyticsData>[] = [
      {
        date: new Date(new Date().setDate(new Date().getDate() - 30)),
        totalShipments: 245,
        deliveredOnTime: 230,
        delayed: 12,
        lost: 3,
        revenue: 52750.0,
        topDestinations: JSON.stringify([
          { city: "Dubai", count: 85 },
          { city: "Riyadh", count: 65 },
          { city: "Kuwait", count: 45 },
        ]),
        serviceTypeBreakdown: JSON.stringify({
          Express: 120,
          Standard: 85,
          Economy: 40,
        }),
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 60)),
        totalShipments: 228,
        deliveredOnTime: 215,
        delayed: 10,
        lost: 3,
        revenue: 48920.0,
        topDestinations: JSON.stringify([
          { city: "Dubai", count: 80 },
          { city: "Riyadh", count: 60 },
          { city: "Kuwait", count: 40 },
        ]),
        serviceTypeBreakdown: JSON.stringify({
          Express: 110,
          Standard: 80,
          Economy: 38,
        }),
      },
    ];

    // Add analytics data
    additionalAnalytics.forEach((data) => {
      const id = this.currentAnalyticsDataId++;
      this.analyticsData.set(id, { ...data, id } as AnalyticsData);
    });
  }
}

// Helper functions for analytics calculations

/**
 * Count shipments per time period
 */
function countShipmentsPerPeriod(
  shipments: Shipment[],
  labels: string[],
  periodType: string
): number[] {
  // Initialize data array with zeros
  const data = new Array(labels.length).fill(0);

  // For testing, assign random counts
  for (let i = 0; i < data.length; i++) {
    // Basic pattern: increasing trend with some variation
    data[i] = Math.floor(120 + i * 15 + (Math.random() * 30 - 15));
  }

  return data;
}

/**
 * Calculate revenue per time period
 */
function calculateRevenuePerPeriod(
  shipments: Shipment[],
  labels: string[],
  periodType: string
): number[] {
  // Initialize data array with zeros
  const data = new Array(labels.length).fill(0);

  // For testing, assign random revenue figures
  for (let i = 0; i < data.length; i++) {
    // Basic pattern: slightly increasing trend with variation
    data[i] = Math.floor(2500 + i * 200 + (Math.random() * 500 - 250));
  }

  return data;
}

/**
 * Calculate weight per time period
 */
function calculateWeightPerPeriod(
  shipments: Shipment[],
  labels: string[],
  periodType: string
): number[] {
  // Initialize data array with zeros
  const data = new Array(labels.length).fill(0);

  // For testing, assign random weight totals
  for (let i = 0; i < data.length; i++) {
    // Basic pattern: stable with some variation
    data[i] = Math.floor(1000 + i * 50 + (Math.random() * 200 - 100));
  }

  return data;
}

/**
 * Calculate average delivery time in days
 */
function calculateAverageDeliveryTime(shipments: Shipment[]): number {
  // For testing purposes
  return 3.2 + (Math.random() * 0.4 - 0.2);
}

/**
 * Calculate on-time delivery percentage
 */
function calculateOnTimePercentage(shipments: Shipment[]): number {
  // For testing purposes
  return 89.5 + (Math.random() * 3 - 1.5);
}

import { db } from "./db";
import { eq, and, desc, gte, lte, sql, like, isNull } from "drizzle-orm";

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Shipment methods
  async searchShipments(params: {
    status?: string;
    dateRange?: string;
    origin?: string;
    destination?: string;
    customerName?: string;
    weight?: { min?: number; max?: number };
    serviceType?: string;
  }): Promise<Shipment[]> {
    let query = db.select().from(shipments);

    if (params.status) {
      query = query.where(eq(shipments.status, params.status));
    }
    if (params.origin) {
      query = query.where(like(shipments.origin, `%${params.origin}%`));
    }
    if (params.destination) {
      query = query.where(like(shipments.destination, `%${params.destination}%`));
    }
    if (params.customerName) {
      query = query.where(like(shipments.customerName, `%${params.customerName}%`));
    }
    if (params.serviceType) {
      query = query.where(eq(shipments.serviceType, params.serviceType));
    }
    if (params.weight?.min) {
      query = query.where(gte(shipments.weight, params.weight.min));
    }
    if (params.weight?.max) {
      query = query.where(lte(shipments.weight, params.weight.max));
    }

    const results = await query.orderBy(desc(shipments.date));
    return this.addNotesToShipments(results);
  }

  async getShipments(status?: string, dateRange?: string): Promise<Shipment[]> {
    let query = db.select().from(shipments);

    if (status) {
      query = query.where(eq(shipments.status, status));
    }

    if (dateRange) {
      let startDate: Date;
      const now = new Date();

      switch (dateRange) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }

      query = query.where(gte(shipments.date, startDate));
    }

    const results = await query.orderBy(desc(shipments.date));
    return this.addNotesToShipments(results);
  }

  async getShipmentById(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, id));

    if (!shipment) return undefined;

    const notes = await db
      .select()
      .from(shipmentNotes)
      .where(eq(shipmentNotes.shipmentId, id))
      .orderBy(desc(shipmentNotes.timestamp));

    return {
      ...shipment,
      notes,
    };
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values(insertShipment)
      .returning();

    return {
      ...shipment,
      notes: [],
    };
  }

  async updateShipmentStatus(
    id: number,
    status: string
  ): Promise<Shipment | undefined> {
    const [updatedShipment] = await db
      .update(shipments)
      .set({ status, updatedAt: new Date() })
      .where(eq(shipments.id, id))
      .returning();

    if (!updatedShipment) return undefined;

    return this.getShipmentById(id);
  }

  async addShipmentNote(insertNote: InsertShipmentNote): Promise<ShipmentNote> {
    const [note] = await db
      .insert(shipmentNotes)
      .values(insertNote)
      .returning();

    return note;
  }

  // Rate management methods
  async getRateFiles(): Promise<RateFile[]> {
    const files = await db
      .select()
      .from(rateFiles)
      .orderBy(desc(rateFiles.uploadDate));

    return files.map((file) => {
      const errors = file.errorDetails
        ? JSON.parse(file.errorDetails)
        : undefined;
      return {
        ...file,
        errors,
      };
    });
  }

  async getRateEntriesByFileId(fileId: number): Promise<RateEntry[]> {
    return db.select().from(rateEntries).where(eq(rateEntries.fileId, fileId));
  }

  async processRateFile(filename: string, content: string): Promise<RateFile> {
    // First insert the file record
    const [file] = await db
      .insert(rateFiles)
      .values({
        filename,
        status: "pending",
      })
      .returning();

    try {
      // Parse CSV content
      const lines = content.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      // Process each line
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(",").map((v) => v.trim());
        const entry: Record<string, any> = {};

        headers.forEach((header, index) => {
          entry[header] = values[index];
        });

        if (entry.origin && entry.destination && entry.rate) {
          // Insert rate entry
          await db.insert(rateEntries).values({
            fileId: file.id,
            origin: entry.origin,
            destination: entry.destination,
            weight: entry.weight || "0",
            serviceType: entry.serviceType || "standard",
            rate: parseFloat(entry.rate),
            currency: entry.currency || "USD",
            effectiveDate: new Date(entry.effectiveDate || Date.now()),
            expiryDate: new Date(
              entry.expiryDate ||
                new Date().setFullYear(new Date().getFullYear() + 1)
            ),
          });
        }
      }

      // Update file status to processed
      const [updatedFile] = await db
        .update(rateFiles)
        .set({ status: "processed" })
        .where(eq(rateFiles.id, file.id))
        .returning();

      return updatedFile;
    } catch (error) {
      // Update file status to error
      const errorDetails = JSON.stringify([(error as Error).message]);
      const [updatedFile] = await db
        .update(rateFiles)
        .set({
          status: "error",
          errorDetails,
        })
        .where(eq(rateFiles.id, file.id))
        .returning();

      return {
        ...updatedFile,
        errors: [(error as Error).message],
      };
    }
  }

  async updateRateEntries(rates: Partial<RateEntry>[]): Promise<RateEntry[]> {
    const updatedRates: RateEntry[] = [];

    for (const rate of rates) {
      if (rate.id) {
        const [updatedRate] = await db
          .update(rateEntries)
          .set(rate)
          .where(eq(rateEntries.id, rate.id))
          .returning();

        if (updatedRate) {
          updatedRates.push(updatedRate);
        }
      }
    }

    return updatedRates;
  }

  // Aramex API methods
  async getAramexApiStatus(): Promise<{
    connected: boolean;
    lastCall: string | null;
    responseTime: number | null;
  }> {
    // Get the most recent log entry
    const [lastLog] = await db
      .select()
      .from(aramexApiLogs)
      .orderBy(desc(aramexApiLogs.timestamp))
      .limit(1);

    if (!lastLog) {
      return {
        connected: false,
        lastCall: null,
        responseTime: null,
      };
    }

    return {
      connected: lastLog.success,
      lastCall: lastLog.timestamp ? lastLog.timestamp.toISOString() : null,
      responseTime: lastLog.responseTime || null,
    };
  }

  async logAramexApiCall(insertLog: InsertAramexApiLog): Promise<AramexApiLog> {
    const [log] = await db.insert(aramexApiLogs).values(insertLog).returning();

    return log;
  }

  // Invoice and financial management methods
  async getInvoices(status?: string, dateRange?: string): Promise<Invoice[]> {
    let query = db.select().from(invoices);

    if (status) {
      query = query.where(eq(invoices.status, status));
    }

    if (dateRange) {
      let startDate: Date;
      const now = new Date();

      switch (dateRange) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }

      query = query.where(gte(invoices.issueDate, startDate));
    }

    return query.orderBy(desc(invoices.issueDate));
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));

    return invoice || undefined;
  }

  async getInvoiceByNumber(
    invoiceNumber: string
  ): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber));

    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();

    return invoice;
  }

  async updateInvoiceStatus(
    id: number,
    status: string
  ): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    return updatedInvoice || undefined;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async addInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db.insert(invoiceItems).values(insertItem).returning();

    return item;
  }

  async updateInvoiceItem(
    id: number,
    itemUpdate: Partial<InvoiceItem>
  ): Promise<InvoiceItem | undefined> {
    const [updatedItem] = await db
      .update(invoiceItems)
      .set(itemUpdate)
      .where(eq(invoiceItems.id, id))
      .returning();

    return updatedItem || undefined;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));

    return true; // In PostgreSQL, we'd get a count of rows affected
  }

  async getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paymentDate));
  }

  async addPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();

    // If payment completes the invoice amount, update invoice status to 'paid'
    if (payment.invoiceId) {
      const invoice = await this.getInvoiceById(payment.invoiceId);
      if (invoice) {
        const allPayments = await this.getPaymentsByInvoiceId(
          payment.invoiceId
        );
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= invoice.totalAmount && invoice.status !== "paid") {
          await this.updateInvoiceStatus(invoice.id, "paid");
        }
      }
    }

    return payment;
  }

  async generateInvoicePdf(invoiceId: number): Promise<string> {
    // In a real implementation, this would generate a PDF
    // Here we'll just update the invoice with a dummy PDF URL
    const pdfUrl = `/invoices/${invoiceId}.pdf`;

    const [updatedInvoice] = await db
      .update(invoices)
      .set({ pdfUrl })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return pdfUrl;
  }

  async getFinancialMetrics(timeRange: string): Promise<{
    totalRevenue: { value: number; change: number; period: string };
    outstandingBalance: { value: number; change: number; period: string };
    paidInvoices: { value: number; change: number; period: string };
    overdueInvoices: { value: number; change: number; period: string };
  }> {
    // Calculate date ranges for current and previous periods
    let currentStartDate: Date;
    let previousStartDate: Date;
    const now = new Date();

    switch (timeRange) {
      case "7days":
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Get current period invoices
    const currentInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          gte(invoices.issueDate, currentStartDate),
          lte(invoices.issueDate, now)
        )
      );

    // Get previous period invoices
    const previousInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          gte(invoices.issueDate, previousStartDate),
          lte(invoices.issueDate, currentStartDate)
        )
      );

    // Get all payments
    const allPayments = await db.select().from(payments);

    // Calculate metrics for current period
    const currentTotalRevenue = currentInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const currentPaidInvoices = currentInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;
    const currentOverdueInvoices = currentInvoices.filter(
      (inv) => inv.status === "overdue"
    ).length;

    // Calculate outstanding balance
    const invoicePaymentMap = new Map<number, number>();
    allPayments.forEach((payment) => {
      const current = invoicePaymentMap.get(payment.invoiceId) || 0;
      invoicePaymentMap.set(payment.invoiceId, current + payment.amount);
    });

    const currentOutstandingBalance = currentInvoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => {
        const paid = invoicePaymentMap.get(inv.id) || 0;
        return sum + (inv.totalAmount - paid);
      }, 0);

    // Calculate metrics for previous period
    const previousTotalRevenue = previousInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const previousPaidInvoices = previousInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;
    const previousOverdueInvoices = previousInvoices.filter(
      (inv) => inv.status === "overdue"
    ).length;

    const previousOutstandingBalance = previousInvoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => {
        const paid = invoicePaymentMap.get(inv.id) || 0;
        return sum + (inv.totalAmount - paid);
      }, 0);

    // Calculate percentage changes
    const revenueChange =
      previousTotalRevenue === 0
        ? 100
        : ((currentTotalRevenue - previousTotalRevenue) /
            previousTotalRevenue) *
          100;

    const outstandingChange =
      previousOutstandingBalance === 0
        ? currentOutstandingBalance > 0
          ? 100
          : 0
        : ((currentOutstandingBalance - previousOutstandingBalance) /
            previousOutstandingBalance) *
          100;

    const paidInvoicesChange =
      previousPaidInvoices === 0
        ? currentPaidInvoices > 0
          ? 100
          : 0
        : ((currentPaidInvoices - previousPaidInvoices) /
            previousPaidInvoices) *
          100;

    const overdueInvoicesChange =
      previousOverdueInvoices === 0
        ? currentOverdueInvoices > 0
          ? 100
          : 0
        : ((currentOverdueInvoices - previousOverdueInvoices) /
            previousOverdueInvoices) *
          100;

    return {
      totalRevenue: {
        value: currentTotalRevenue,
        change: revenueChange,
        period: timeRange,
      },
      outstandingBalance: {
        value: currentOutstandingBalance,
        change: outstandingChange,
        period: timeRange,
      },
      paidInvoices: {
        value: currentPaidInvoices,
        change: paidInvoicesChange,
        period: timeRange,
      },
      overdueInvoices: {
        value: currentOverdueInvoices,
        change: overdueInvoicesChange,
        period: timeRange,
      },
    };
  }

  async getRevenueByPeriod(timeRange: string): Promise<{
    labels: string[];
    data: number[];
  }> {
    // Determine date range and grouping
    let startDate: Date;
    let groupBy: string;
    const now = new Date();

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = "week";
        break;
      case "12months":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
    }

    // Get invoices in the date range
    const periodInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(gte(invoices.issueDate, startDate), lte(invoices.issueDate, now))
      );

    // Group data based on the selected time range
    const groupedData: { [key: string]: number } = {};
    const format = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: groupBy === "month" ? "numeric" : undefined,
      week: groupBy === "week" ? "numeric" : undefined,
    });

    periodInvoices.forEach((invoice) => {
      const date = new Date(invoice.issueDate);
      const key = format.format(date);
      groupedData[key] = (groupedData[key] || 0) + invoice.totalAmount;
    });

    // Sort labels chronologically
    const labels = Object.keys(groupedData);
    const data = labels.map((label) => groupedData[label]);

    return { labels, data };
  }

  // Analytics methods
  async getDashboardMetrics(): Promise<{
    totalShipments: { value: number; change: number; period: string };
    activeDeliveries: { value: number; change: number; period: string };
    pendingApproval: { value: number; change: number; period: string };
    deliveryIssues: { value: number; change: number; period: string };
  }> {
    // For simplicity, return some sample metrics
    return {
      totalShipments: { value: 248, change: 12.5, period: "30days" },
      activeDeliveries: { value: 35, change: 8.2, period: "30days" },
      pendingApproval: { value: 12, change: -5.0, period: "30days" },
      deliveryIssues: { value: 5, change: -15.3, period: "30days" },
    };
  }

  async getShipmentTrends(
    timeRange: string,
    chartType: string
  ): Promise<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  }> {
    // For sample data
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Express Deliveries",
          data: [12, 19, 15, 22, 30, 25],
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgba(53, 162, 235, 1)",
        },
        {
          label: "Standard Deliveries",
          data: [35, 29, 40, 38, 32, 42],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    };
  }

  async getShipmentsByDestination(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }> {
    // For sample data
    return {
      labels: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain"],
      data: [45, 25, 10, 8, 7, 5],
      backgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
      ],
    };
  }

  async getShipmentsByService(timeRange: string): Promise<{
    labels: string[];
    data: number[];
    backgroundColor: string[];
  }> {
    // For sample data
    return {
      labels: ["Express", "Standard", "Economy", "Priority", "Same-Day"],
      data: [35, 40, 15, 8, 2],
      backgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
      ],
    };
  }

  async getShipmentStatistics(timeRange: string): Promise<{
    totalShipments: number;
    percentChange: number;
    avgDeliveryTime: number;
    deliveryTimeChange: number;
    onTimePercentage: number;
    onTimeChange: number;
  }> {
    // For sample data
    return {
      totalShipments: 248,
      percentChange: 12.5,
      avgDeliveryTime: 2.3,
      deliveryTimeChange: -0.5,
      onTimePercentage: 94.8,
      onTimeChange: 2.3,
    };
  }

  // Helper methods
  private async addNotesToShipments(
    shipmentsList: Shipment[]
  ): Promise<Shipment[]> {
    if (shipmentsList.length === 0) return shipmentsList;

    const shipmentIds = shipmentsList.map((s) => s.id);

    const notes = await db
      .select()
      .from(shipmentNotes)
      .where(sql`${shipmentNotes.shipmentId} IN ${shipmentIds}`);

    const notesByShipmentId = notes.reduce((acc, note) => {
      acc[note.shipmentId] = acc[note.shipmentId] || [];
      acc[note.shipmentId].push(note);
      return acc;
    }, {} as Record<number, ShipmentNote[]>);

    return shipmentsList.map((shipment) => ({
      ...shipment,
      notes: notesByShipmentId[shipment.id] || [],
    }));
  }
}

// Replace MemStorage with DatabaseStorage
export const storage = new DatabaseStorage();