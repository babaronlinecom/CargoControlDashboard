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
  type InsertPayment
} from "@shared/schema";

// Mock data for tracking colors
const CHART_COLORS = [
  'rgba(30, 64, 175, 0.7)', // primary
  'rgba(59, 130, 246, 0.7)', // secondary
  'rgba(16, 185, 129, 0.7)', // green
  'rgba(245, 158, 11, 0.7)', // yellow
  'rgba(239, 68, 68, 0.7)'   // red
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
  updateShipmentStatus(id: number, status: string): Promise<Shipment | undefined>;
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
  updateInvoiceItem(id: number, item: Partial<InvoiceItem>): Promise<InvoiceItem | undefined>;
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
  getShipmentTrends(timeRange: string, chartType: string): Promise<{
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
      (user) => user.username === username,
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
    if (status && status !== 'all') {
      shipments = shipments.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Filter by date range if provided
    if (dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'thismonth':
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
  
  async updateShipmentStatus(id: number, status: string): Promise<Shipment | undefined> {
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
      timestamp: new Date() 
    };
    
    this.shipmentNotes.set(id, note);
    return note;
  }
  
  // Rate management methods
  async getRateFiles(): Promise<RateFile[]> {
    return Array.from(this.rateFiles.values()).map(file => {
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
      status: 'pending',
      errorDetails: null
    };
    
    try {
      // Simple parsing of CSV content
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = [
        'Origin', 'Destination', 'Weight', 'ServiceType', 
        'Rate', 'Currency', 'EffectiveDate', 'ExpiryDate'
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
        
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        // Create object from headers and values
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || '';
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
        if (!errors.some(err => err.startsWith(`Row ${i}:`))) {
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
            expiryDate: new Date(row.ExpiryDate)
          };
          
          this.rateEntries.set(entryId, entry);
        }
      }
      
      // Update file status based on errors
      if (errors.length > 0) {
        file.status = 'error';
        file.errorDetails = JSON.stringify(errors);
      } else {
        file.status = 'processed';
      }
    } catch (error) {
      file.status = 'error';
      file.errorDetails = JSON.stringify([error.message]);
    }
    
    // Save the file
    this.rateFiles.set(fileId, file);
    
    // Add errors to the returned file if needed
    if (file.errorDetails) {
      return {
        ...file,
        errors: JSON.parse(file.errorDetails)
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
    const logs = Array.from(this.aramexApiLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (logs.length === 0) {
      return {
        connected: false,
        lastCall: null,
        responseTime: null
      };
    }
    
    const lastLog = logs[0];
    
    return {
      connected: lastLog.success,
      lastCall: lastLog.timestamp.toISOString(),
      responseTime: lastLog.responseTime || 0
    };
  }
  
  async logAramexApiCall(insertLog: InsertAramexApiLog): Promise<AramexApiLog> {
    const id = this.currentLogId++;
    const log: AramexApiLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    
    this.aramexApiLogs.set(id, log);
    return log;
  }
  
  // Invoice and financial management methods
  async getInvoices(status?: string, dateRange?: string): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    
    // Filter by status if provided
    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    
    // Filter by date range if provided
    if (dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'thismonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
      }
      
      invoices = invoices.filter(i => new Date(i.issueDate) >= startDate);
    }
    
    return invoices;
  }
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      invoice => invoice.invoiceNumber === invoiceNumber
    );
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = {
      ...invoice,
      status,
      updatedAt: new Date()
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      item => item.invoiceId === invoiceId
    );
  }
  
  async addInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.currentInvoiceItemId++;
    const item: InvoiceItem = {
      ...insertItem,
      id
    };
    
    this.invoiceItems.set(id, item);
    
    // Update invoice total
    const invoice = this.invoices.get(insertItem.invoiceId);
    if (invoice) {
      const updatedInvoice = {
        ...invoice,
        totalAmount: invoice.totalAmount + insertItem.lineTotal,
        updatedAt: new Date()
      };
      this.invoices.set(invoice.id, updatedInvoice);
    }
    
    return item;
  }
  
  async updateInvoiceItem(id: number, itemUpdate: Partial<InvoiceItem>): Promise<InvoiceItem | undefined> {
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
          totalAmount: invoice.totalAmount - originalTotal + updatedItem.lineTotal,
          updatedAt: new Date()
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
        updatedAt: new Date()
      };
      this.invoices.set(invoice.id, updatedInvoice);
    }
    
    this.invoiceItems.delete(id);
    return true;
  }
  
  async getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.invoiceId === invoiceId
    );
  }
  
  async addPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date()
    };
    
    this.payments.set(id, newPayment);
    
    // Update invoice status if the payment completes the amount
    const invoice = this.invoices.get(payment.invoiceId);
    if (invoice) {
      const allPayments = await this.getPaymentsByInvoiceId(invoice.id);
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0) + payment.amount;
      
      if (totalPaid >= invoice.totalAmount) {
        const updatedInvoice = {
          ...invoice,
          status: 'paid',
          updatedAt: new Date()
        };
        this.invoices.set(invoice.id, updatedInvoice);
      } else if (invoice.status === 'unpaid' && totalPaid > 0) {
        const updatedInvoice = {
          ...invoice,
          status: 'partial',
          updatedAt: new Date()
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
      updatedAt: new Date()
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
      case '7days':
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        currentStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }
    
    // Current period invoices
    const currentInvoices = allInvoices.filter(
      i => new Date(i.issueDate) >= currentStartDate
    );
    
    // Previous period invoices
    const previousInvoices = allInvoices.filter(
      i => new Date(i.issueDate) >= previousStartDate && new Date(i.issueDate) < currentStartDate
    );
    
    // Calculate total revenue
    const currentRevenue = currentInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
    
    // Calculate outstanding balance
    const currentOutstanding = currentInvoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const previousOutstanding = previousInvoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const outstandingChange = previousOutstanding > 0
      ? ((currentOutstanding - previousOutstanding) / previousOutstanding) * 100
      : 0;
    
    // Count paid invoices
    const currentPaidCount = currentInvoices.filter(i => i.status === 'paid').length;
    const previousPaidCount = previousInvoices.filter(i => i.status === 'paid').length;
    const paidChange = previousPaidCount > 0
      ? ((currentPaidCount - previousPaidCount) / previousPaidCount) * 100
      : 0;
    
    // Count overdue invoices
    const currentOverdueCount = currentInvoices.filter(
      i => i.status !== 'paid' && new Date(i.dueDate) < now
    ).length;
    const previousOverdueCount = previousInvoices.filter(
      i => i.status !== 'paid' && new Date(i.dueDate) < currentStartDate
    ).length;
    const overdueChange = previousOverdueCount > 0
      ? ((currentOverdueCount - previousOverdueCount) / previousOverdueCount) * 100
      : 0;
    
    return {
      totalRevenue: {
        value: currentRevenue,
        change: revenueChange,
        period: timeRange === '7days' ? 'last week' : 'last month'
      },
      outstandingBalance: {
        value: currentOutstanding,
        change: outstandingChange,
        period: timeRange === '7days' ? 'last week' : 'last month'
      },
      paidInvoices: {
        value: currentPaidCount,
        change: paidChange,
        period: timeRange === '7days' ? 'last week' : 'last month'
      },
      overdueInvoices: {
        value: currentOverdueCount,
        change: overdueChange,
        period: timeRange === '7days' ? 'last week' : 'last month'
      }
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
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        format = 'day';
        // Generate last 7 days as labels
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        format = 'week';
        // Generate last 13 weeks (90 days) as labels
        for (let i = 12; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          labels.push(`${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
        }
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        format = 'month';
        // Generate last 12 months as labels
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        format = 'day';
        // Generate last 6 periods (5 days each) as labels
        for (let i = 5; i >= 0; i--) {
          const endDay = now.getTime() - i * 5 * 24 * 60 * 60 * 1000;
          const startDay = endDay - 5 * 24 * 60 * 60 * 1000;
          labels.push(`${new Date(startDay).getDate()}-${new Date(endDay).getDate()} ${new Date(endDay).toLocaleDateString('en-US', { month: 'short' })}`);
        }
    }
    
    // Filter invoices within the time range
    const filteredInvoices = allInvoices.filter(
      i => new Date(i.issueDate) >= startDate
    );
    
    // Calculate revenue per period
    const data = new Array(labels.length).fill(0);
    
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      let index = 0;
      
      if (format === 'day' && timeRange === '7days') {
        // For 7 days, each label is a single day
        const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysSinceStart >= 0 && daysSinceStart < 7) {
          index = daysSinceStart;
        }
      } else if (format === 'day' && timeRange === '30days') {
        // For 30 days, each label is a 5-day period
        const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysSinceStart >= 0 && daysSinceStart < 30) {
          index = Math.floor(daysSinceStart / 5);
        }
      } else if (format === 'week') {
        // For 90 days, each label is a week
        const weeksSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeksSinceStart >= 0 && weeksSinceStart < 13) {
          index = weeksSinceStart;
        }
      } else if (format === 'month') {
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
      s => new Date(s.date) >= thirtyDaysAgo
    );
    
    // Shipments in the previous 30 days (30-60 days ago)
    const previousShipments = allShipments.filter(
      s => new Date(s.date) >= sixtyDaysAgo && new Date(s.date) < thirtyDaysAgo
    );
    
    // Total shipments
    const totalShipments = recentShipments.length;
    const previousTotalShipments = previousShipments.length;
    const totalShipmentsChange = previousTotalShipments > 0
      ? ((totalShipments - previousTotalShipments) / previousTotalShipments) * 100
      : 0;
    
    // Active deliveries (in transit)
    const activeDeliveries = recentShipments.filter(
      s => s.status.toLowerCase() === 'in transit'
    ).length;
    const previousActiveDeliveries = previousShipments.filter(
      s => s.status.toLowerCase() === 'in transit'
    ).length;
    const activeDeliveriesChange = previousActiveDeliveries > 0
      ? ((activeDeliveries - previousActiveDeliveries) / previousActiveDeliveries) * 100
      : 0;
    
    // Pending approval
    const pendingApproval = recentShipments.filter(
      s => s.status.toLowerCase() === 'pending'
    ).length;
    const previousPendingApproval = previousShipments.filter(
      s => s.status.toLowerCase() === 'pending'
    ).length;
    const pendingApprovalChange = previousPendingApproval > 0
      ? ((pendingApproval - previousPendingApproval) / previousPendingApproval) * 100
      : 0;
    
    // Delivery issues (cancelled)
    const deliveryIssues = recentShipments.filter(
      s => s.status.toLowerCase() === 'cancelled'
    ).length;
    const previousDeliveryIssues = previousShipments.filter(
      s => s.status.toLowerCase() === 'cancelled'
    ).length;
    const deliveryIssuesChange = previousDeliveryIssues > 0
      ? ((deliveryIssues - previousDeliveryIssues) / previousDeliveryIssues) * 100
      : 0;
    
    return {
      totalShipments: {
        value: totalShipments,
        change: totalShipmentsChange,
        period: "last month"
      },
      activeDeliveries: {
        value: activeDeliveries,
        change: activeDeliveriesChange,
        period: "last week"
      },
      pendingApproval: {
        value: pendingApproval,
        change: pendingApprovalChange,
        period: "last week"
      },
      deliveryIssues: {
        value: deliveryIssues,
        change: deliveryIssuesChange,
        period: "last week"
      }
    };
  }
  
  async getShipmentTrends(timeRange: string, chartType: string): Promise<{
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
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        format = 'day';
        // Generate last 7 days as labels
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        format = 'week';
        // Generate last 13 weeks (90 days) as labels
        for (let i = 12; i >= 0; i--) {
          labels.push(`Week ${i + 1}`);
        }
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        format = 'month';
        // Generate last 12 months as labels
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        format = 'day';
        // Generate last 6 periods (5 days each) as labels
        for (let i = 5; i >= 0; i--) {
          const endDay = now.getTime() - i * 5 * 24 * 60 * 60 * 1000;
          const startDay = endDay - 5 * 24 * 60 * 60 * 1000;
          labels.push(`${new Date(startDay).getDate()}-${new Date(endDay).getDate()} ${new Date(endDay).toLocaleDateString('en-US', { month: 'short' })}`);
        }
    }
    
    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      s => new Date(s.date) >= startDate
    );
    
    // Prepare datasets based on chart type
    if (chartType === 'volume') {
      // Group shipments by service type (Express vs Standard)
      const expressShipments = filteredShipments.filter(
        s => s.serviceType?.toLowerCase().includes('express')
      );
      const standardShipments = filteredShipments.filter(
        s => !s.serviceType?.toLowerCase().includes('express')
      );
      
      // Count shipments per period based on the format
      const expressData = countShipmentsPerPeriod(expressShipments, labels, format);
      const standardData = countShipmentsPerPeriod(standardShipments, labels, format);
      
      return {
        labels,
        datasets: [
          {
            label: 'Express Deliveries',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            borderColor: 'rgba(30, 64, 175, 1)',
            data: expressData
          },
          {
            label: 'Standard Deliveries',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            data: standardData
          }
        ]
      };
    } else if (chartType === 'revenue') {
      // Calculate revenue (rate * weight) per period
      const expressRevenue = calculateRevenuePerPeriod(
        filteredShipments.filter(s => s.serviceType?.toLowerCase().includes('express')),
        labels,
        format
      );
      const standardRevenue = calculateRevenuePerPeriod(
        filteredShipments.filter(s => !s.serviceType?.toLowerCase().includes('express')),
        labels,
        format
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Express Revenue',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 1)',
            data: expressRevenue
          },
          {
            label: 'Standard Revenue',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 1)',
            data: standardRevenue
          }
        ]
      };
    } else {
      // Weight per period
      const expressWeight = calculateWeightPerPeriod(
        filteredShipments.filter(s => s.serviceType?.toLowerCase().includes('express')),
        labels,
        format
      );
      const standardWeight = calculateWeightPerPeriod(
        filteredShipments.filter(s => !s.serviceType?.toLowerCase().includes('express')),
        labels,
        format
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Express Weight (kg)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            data: expressWeight
          },
          {
            label: 'Standard Weight (kg)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 1)',
            data: standardWeight
          }
        ]
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
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      s => new Date(s.date) >= startDate
    );
    
    // Group shipments by destination
    const destinationCounts = new Map<string, number>();
    
    filteredShipments.forEach(shipment => {
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
    const otherCount = filteredShipments.length - topDestinations.reduce((sum, [_, count]) => sum + count, 0);
    
    // Prepare chart data
    const labels = [...topDestinations.map(([dest]) => dest)];
    const data = [...topDestinations.map(([_, count]) => count)];
    
    // Add "Other" category if there are more destinations
    if (otherCount > 0) {
      labels.push('Other');
      data.push(otherCount);
    }
    
    // Assign colors
    const backgroundColor = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    
    return {
      labels,
      data,
      backgroundColor
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
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Filter shipments within the time range
    const filteredShipments = allShipments.filter(
      s => new Date(s.date) >= startDate
    );
    
    // Define service types
    const serviceTypes = ['Express', 'Standard', 'Economy', 'Same Day', 'International'];
    
    // Count shipments by service type
    const serviceCounts = serviceTypes.map(type => {
      return {
        type,
        count: filteredShipments.filter(s => 
          s.serviceType?.toLowerCase().includes(type.toLowerCase())
        ).length
      };
    });
    
    // Calculate "Other" category (shipments without a recognized service type)
    const otherCount = filteredShipments.length - serviceCounts.reduce((sum, { count }) => sum + count, 0);
    
    // Prepare chart data
    const labels = serviceCounts.map(s => s.type);
    const data = serviceCounts.map(s => s.count);
    
    // Add "Other" category if there are shipments with unrecognized service types
    if (otherCount > 0) {
      labels.push('Other');
      data.push(otherCount);
    }
    
    // Assign colors
    const backgroundColor = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    
    return {
      labels,
      data,
      backgroundColor
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
      case '7days':
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        currentStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }
    
    // Filter shipments within the current period
    const currentShipments = allShipments.filter(
      s => new Date(s.date) >= currentStartDate
    );
    
    // Filter shipments within the previous period
    const previousShipments = allShipments.filter(
      s => new Date(s.date) >= previousStartDate && new Date(s.date) < currentStartDate
    );
    
    // Calculate total shipments
    const totalShipments = currentShipments.length;
    const previousTotalShipments = previousShipments.length;
    
    // Calculate percent change in total shipments
    const percentChange = previousTotalShipments > 0
      ? ((totalShipments - previousTotalShipments) / previousTotalShipments) * 100
      : 0;
    
    // Calculate average delivery time (in days)
    const avgDeliveryTime = calculateAverageDeliveryTime(currentShipments);
    const previousAvgDeliveryTime = calculateAverageDeliveryTime(previousShipments);
    
    // Calculate percent change in delivery time
    const deliveryTimeChange = previousAvgDeliveryTime > 0
      ? ((avgDeliveryTime - previousAvgDeliveryTime) / previousAvgDeliveryTime) * 100
      : 0;
    
    // Calculate on-time delivery percentage
    const onTimePercentage = calculateOnTimePercentage(currentShipments);
    const previousOnTimePercentage = calculateOnTimePercentage(previousShipments);
    
    // Calculate change in on-time delivery percentage
    const onTimeChange = previousOnTimePercentage > 0
      ? onTimePercentage - previousOnTimePercentage
      : 0;
    
    return {
      totalShipments,
      percentChange,
      avgDeliveryTime,
      deliveryTimeChange,
      onTimePercentage,
      onTimeChange
    };
  }
  
  // Helper methods
  private async addNotesToShipments(shipments: Shipment[]): Promise<Shipment[]> {
    const shipmentIds = shipments.map(s => s.id);
    
    // Get all notes for these shipments
    const notes = Array.from(this.shipmentNotes.values()).filter(
      note => shipmentIds.includes(note.shipmentId)
    );
    
    // Group notes by shipment id
    const notesByShipmentId = new Map<number, ShipmentNote[]>();
    
    notes.forEach(note => {
      const shipmentId = note.shipmentId;
      const shipmentNotes = notesByShipmentId.get(shipmentId) || [];
      shipmentNotes.push(note);
      notesByShipmentId.set(shipmentId, shipmentNotes);
    });
    
    // Add notes to each shipment
    return shipments.map(shipment => {
      const shipmentNotes = notesByShipmentId.get(shipment.id) || [];
      return {
        ...shipment,
        notes: shipmentNotes
      };
    });
  }
  
  // Initialize sample data for demo purposes
  private initializeSampleData() {
    // Sample shipments
    const sampleShipments: Partial<Shipment>[] = [
      {
        trackingNumber: "ARX-78294-1",
        destination: "Dubai, UAE",
        status: "Delivered",
        date: new Date("2023-08-12"),
        customerName: "Ahmed Al Mansoor",
        origin: "London, UK",
        weight: 5.2,
        serviceType: "Express",
        dimensions: JSON.stringify({ length: 30, width: 20, height: 10 })
      },
      {
        trackingNumber: "ARX-65432-8",
        destination: "Riyadh, KSA",
        status: "In Transit",
        date: new Date("2023-08-14"),
        customerName: "Fatima Al Saud",
        origin: "Cairo, Egypt",
        weight: 3.8,
        serviceType: "Standard",
        dimensions: JSON.stringify({ length: 25, width: 15, height: 8 })
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
        dimensions: JSON.stringify({ length: 40, width: 30, height: 20 })
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
        dimensions: JSON.stringify({ length: 20, width: 15, height: 10 })
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
        dimensions: JSON.stringify({ length: 35, width: 25, height: 15 })
      }
    ];
    
    // Add sample shipments
    sampleShipments.forEach(shipment => {
      const id = this.currentShipmentId++;
      this.shipments.set(id, { ...shipment, id } as Shipment);
    });
    
    // Add sample shipment notes
    const sampleNotes: Partial<ShipmentNote>[] = [
      {
        shipmentId: 1,
        text: "Package handed to courier for delivery",
        timestamp: new Date("2023-08-12T10:30:00"),
        createdBy: "System"
      },
      {
        shipmentId: 1,
        text: "Delivery completed, signed by recipient",
        timestamp: new Date("2023-08-12T14:45:00"),
        createdBy: "Delivery Agent"
      },
      {
        shipmentId: 2,
        text: "Package in transit to destination",
        timestamp: new Date("2023-08-14T08:15:00"),
        createdBy: "System"
      },
      {
        shipmentId: 3,
        text: "Awaiting pickup by courier",
        timestamp: new Date("2023-08-15T09:20:00"),
        createdBy: "System"
      }
    ];
    
    // Add sample notes
    sampleNotes.forEach(note => {
      const id = this.currentNoteId++;
      this.shipmentNotes.set(id, { ...note, id } as ShipmentNote);
    });
    
    // Sample invoices
    const sampleInvoices: Partial<Invoice>[] = [
      {
        invoiceNumber: "INV-2023-001",
        awbNumber: "33449959723",
        status: "paid",
        issueDate: new Date("2023-08-10"),
        dueDate: new Date("2023-09-10"),
        totalAmount: 750.50,
        currency: "USD",
        notes: "Priority shipment service",
        billingAddress: "123 Financial District, Dubai, UAE",
        shippingAddress: "456 Business Bay, Dubai, UAE",
        customerName: "Ahmed Al Mansoor",
        customerEmail: "ahmed@example.com",
        customerPhone: "+971-50-1234567",
        pdfUrl: "/invoices/INV-2023-001.pdf"
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
        customerPhone: "+971-55-9876543"
      },
      {
        invoiceNumber: "INV-2023-003",
        awbNumber: "33449959725",
        status: "overdue",
        issueDate: new Date("2023-07-20"),
        dueDate: new Date("2023-08-20"),
        totalAmount: 1250.00,
        currency: "USD",
        notes: "Express international delivery with insurance",
        billingAddress: "567 Downtown Area, Dubai, UAE",
        shippingAddress: "890 Dubai Mall, Dubai, UAE",
        customerName: "Sara Khan",
        customerEmail: "sara@example.com",
        customerPhone: "+971-52-5557777"
      }
    ];

    // Sample invoice items
    const sampleInvoiceItems: Partial<InvoiceItem>[] = [
      {
        invoiceId: 1,
        description: "Express International Shipping (ARX-78294-1)",
        quantity: 1,
        unitPrice: 650.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 682.50
      },
      {
        invoiceId: 1,
        description: "Packaging and Handling Fee",
        quantity: 1,
        unitPrice: 50.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 52.50
      },
      {
        invoiceId: 1,
        description: "Insurance Premium",
        quantity: 1,
        unitPrice: 15.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 15.75
      },
      {
        invoiceId: 2,
        description: "Standard International Shipping (ARX-78294-2)",
        quantity: 1,
        unitPrice: 385.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 404.25
      },
      {
        invoiceId: 2,
        description: "Customs Documentation Fee",
        quantity: 1,
        unitPrice: 45.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 47.25
      },
      {
        invoiceId: 2,
        description: "Tracking Service",
        quantity: 1,
        unitPrice: 7.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 7.35
      },
      {
        invoiceId: 3,
        description: "Premium Express Shipping (ARX-78294-3)",
        quantity: 1,
        unitPrice: 950.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 997.50
      },
      {
        invoiceId: 3,
        description: "Premium Insurance Coverage",
        quantity: 1,
        unitPrice: 200.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 210.00
      },
      {
        invoiceId: 3,
        description: "Priority Handling",
        quantity: 1,
        unitPrice: 40.00,
        taxRate: 5,
        discount: 0,
        lineTotal: 42.50
      }
    ];

    // Sample payments
    const samplePayments: Partial<Payment>[] = [
      {
        invoiceId: 1,
        amount: 750.50,
        paymentDate: new Date("2023-08-25"),
        paymentMethod: "credit_card",
        transactionId: "TXN-12345-ABCDE",
        notes: "Payment received in full",
        status: "completed",
        receivedBy: "Online Payment System"
      },
      {
        invoiceId: 3,
        amount: 500.00,
        paymentDate: new Date("2023-08-15"),
        paymentMethod: "bank_transfer",
        transactionId: "WIRE-67890-FGHIJ",
        notes: "Partial payment received",
        status: "completed",
        receivedBy: "Finance Department"
      }
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

    // Sample rate files
    const sampleRateFiles: Partial<RateFile>[] = [
      {
        filename: "rates_update_aug2023.csv",
        uploadDate: new Date("2023-08-15"),
        status: "processed"
      },
      {
        filename: "special_rates_q3.csv",
        uploadDate: new Date("2023-07-28"),
        status: "processed"
      },
      {
        filename: "express_rates_update.csv",
        uploadDate: new Date("2023-07-15"),
        status: "processed"
      }
    ];
    
    // Add sample rate files
    sampleRateFiles.forEach(file => {
      const id = this.currentRateFileId++;
      this.rateFiles.set(id, { ...file, id } as RateFile);
    });
    
    // Sample rate entries
    const sampleRateEntries: Partial<RateEntry>[] = [
      {
        fileId: 1,
        origin: "London",
        destination: "Dubai",
        weight: "5kg",
        serviceType: "Express",
        rate: 45.00,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31")
      },
      {
        fileId: 1,
        origin: "London",
        destination: "Riyadh",
        weight: "5kg",
        serviceType: "Express",
        rate: 52.50,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31")
      },
      {
        fileId: 1,
        origin: "London",
        destination: "Dubai",
        weight: "10kg",
        serviceType: "Express",
        rate: 85.00,
        currency: "USD",
        effectiveDate: new Date("2023-08-01"),
        expiryDate: new Date("2023-12-31")
      },
      {
        fileId: 2,
        origin: "Dubai",
        destination: "Riyadh",
        weight: "5kg",
        serviceType: "Standard",
        rate: 25.00,
        currency: "USD",
        effectiveDate: new Date("2023-07-01"),
        expiryDate: new Date("2023-09-30")
      },
      {
        fileId: 3,
        origin: "Dubai",
        destination: "Doha",
        weight: "5kg",
        serviceType: "Express",
        rate: 30.00,
        currency: "USD",
        effectiveDate: new Date("2023-07-15"),
        expiryDate: new Date("2023-10-31")
      }
    ];
    
    // Add sample rate entries
    sampleRateEntries.forEach(entry => {
      const id = this.currentRateEntryId++;
      this.rateEntries.set(id, { ...entry, id } as RateEntry);
    });
    
    // Sample Aramex API logs
    const sampleApiLogs: Partial<AramexApiLog>[] = [
      {
        endpoint: "track",
        requestPayload: JSON.stringify({ trackingNumber: "ARX-78294-1" }),
        responsePayload: JSON.stringify({ status: "Delivered", details: "Package delivered on Aug 12, 2023" }),
        success: true,
        responseTime: 245,
        timestamp: new Date("2023-08-16T14:32:21")
      },
      {
        endpoint: "calculate-rates",
        requestPayload: JSON.stringify({ origin: "London", destination: "Dubai", weight: 5 }),
        responsePayload: JSON.stringify({ rate: 45.00, currency: "USD" }),
        success: true,
        responseTime: 312,
        timestamp: new Date("2023-08-16T13:45:17")
      },
      {
        endpoint: "locations",
        requestPayload: JSON.stringify({ country: "UAE", city: "Dubai" }),
        responsePayload: JSON.stringify({ locations: [{
          name: "Aramex Dubai Main Office",
          address: "Sheikh Zayed Road, Dubai"
        }] }),
        success: true,
        responseTime: 278,
        timestamp: new Date("2023-08-15T10:22:43")
      }
    ];
    
    // Add sample API logs
    sampleApiLogs.forEach(log => {
      const id = this.currentLogId++;
      this.aramexApiLogs.set(id, { ...log, id } as AramexApiLog);
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
    data[i] = Math.floor(120 + (i * 15) + (Math.random() * 30 - 15));
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
    data[i] = Math.floor(2500 + (i * 200) + (Math.random() * 500 - 250));
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
    data[i] = Math.floor(1000 + (i * 50) + (Math.random() * 200 - 100));
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

export const storage = new MemStorage();
