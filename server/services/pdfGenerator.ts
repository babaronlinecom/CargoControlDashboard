import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Invoice, InvoiceItem } from '@shared/schema';
import { format } from 'date-fns';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

// Type from schema.ts, but with snake_case database columns mapped to camelCase
// This ensures our PDF generator works correctly with the DB column names
type InvoiceWithSnakeCase = {
  id: number;
  invoice_number: string;
  awb_number: string;
  status: string;
  issue_date: Date;
  due_date: Date;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  billing_address: string;
  shipping_address: string;
  pdf_url: string | null;
};

type InvoiceItemWithSnakeCase = {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number | null;
  discount: number | null;
  line_total: number;
};

// Make sure the directory exists
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Format currency
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Generate barcode image in base64 format using JsBarcode
const generateBarcodeBase64 = (codeValue: string): string => {
  // Create a canvas for the barcode
  const canvas = createCanvas(400, 100);
  
  // Generate the barcode on the canvas
  JsBarcode(canvas, codeValue, {
    format: 'CODE128',
    width: 2,
    height: 80,
    displayValue: true,
    fontSize: 18,
    margin: 10,
    textMargin: 5
  });
  
  // Convert the canvas to a base64 string
  return canvas.toDataURL('image/png');
};

export const generateInvoicePdf = async (
  invoice: InvoiceWithSnakeCase,
  invoiceItems: InvoiceItemWithSnakeCase[],
): Promise<string> => {
  // Create PDF directory
  const pdfDir = path.join(process.cwd(), 'public', 'invoices');
  ensureDirectoryExists(pdfDir);

  // Create filename
  const filename = `invoice-${invoice.invoice_number.replace(/\//g, '-')}.pdf`;
  const filePath = path.join(pdfDir, filename);
  const publicUrl = `/invoices/${filename}`;

  // Create PDF document
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
  });

  // Pipe to file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Company info
  doc.fontSize(20).font('Helvetica-Bold').text('CargoAdmin', { align: 'right' });
  doc.fontSize(10).font('Helvetica').text('123 Logistics Road', { align: 'right' });
  doc.text('Dubai, UAE', { align: 'right' });
  doc.text('Email: invoicing@cargoadmin.com', { align: 'right' });
  doc.text('Phone: +971 4 123 4567', { align: 'right' });

  // Invoice title
  doc.moveDown();
  doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(12).font('Helvetica-Bold').text('Invoice Number:');
  doc.fontSize(12).font('Helvetica').text(invoice.invoice_number);
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').text('AWB Number:');
  doc.fontSize(12).font('Helvetica').text(invoice.awb_number);
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').text('Issue Date:');
  doc.fontSize(12)
    .font('Helvetica')
    .text(format(new Date(invoice.issue_date), 'MMMM dd, yyyy'));
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').text('Due Date:');
  doc.fontSize(12)
    .font('Helvetica')
    .text(format(new Date(invoice.due_date), 'MMMM dd, yyyy'));
  doc.moveDown(1);

  // Billing and shipping details
  doc.fontSize(14).font('Helvetica-Bold').text('Bill To:');
  doc.fontSize(12).font('Helvetica').text(invoice.customer_name);
  doc.text(invoice.billing_address);
  doc.text(`Email: ${invoice.customer_email || 'N/A'}`);
  doc.text(`Phone: ${invoice.customer_phone || 'N/A'}`);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('Ship To:');
  doc.fontSize(12).font('Helvetica').text(invoice.shipping_address);
  doc.moveDown(2);

  // Invoice items table
  const tableTop = doc.y;
  const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Tax', 'Discount', 'Total'];
  const tableWidths = [250, 40, 80, 50, 50, 80];
  const tableX = 50;

  let currentY = tableTop;

  // Draw table header
  doc.fontSize(10).font('Helvetica-Bold');
  tableHeaders.forEach((header, i) => {
    doc.text(header, tableX + tableWidths.slice(0, i).reduce((sum, w) => sum + w, 0), currentY, {
      width: tableWidths[i],
      align: i === 0 ? 'left' : 'right',
    });
  });

  currentY += 20;
  doc.moveTo(tableX, currentY).lineTo(tableX + tableWidths.reduce((a, b) => a + b, 0), currentY).stroke();
  currentY += 10;

  // Draw table rows
  doc.fontSize(10).font('Helvetica');
  invoiceItems.forEach((item) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 150) {
      doc.addPage();
      currentY = 50;
    }

    doc.text(item.description, tableX, currentY, {
      width: tableWidths[0],
      align: 'left',
    });
    doc.text(item.quantity.toString(), tableX + tableWidths[0], currentY, {
      width: tableWidths[1],
      align: 'right',
    });
    doc.text(formatCurrency(item.unit_price, invoice.currency), tableX + tableWidths[0] + tableWidths[1], currentY, {
      width: tableWidths[2],
      align: 'right',
    });
    doc.text(item.tax_rate ? `${item.tax_rate}%` : '0%', tableX + tableWidths[0] + tableWidths[1] + tableWidths[2], currentY, {
      width: tableWidths[3],
      align: 'right',
    });
    doc.text(item.discount ? `${item.discount}%` : '0%', tableX + tableWidths[0] + tableWidths[1] + tableWidths[2] + tableWidths[3], currentY, {
      width: tableWidths[4],
      align: 'right',
    });
    doc.text(
      formatCurrency(item.line_total, invoice.currency),
      tableX + tableWidths[0] + tableWidths[1] + tableWidths[2] + tableWidths[3] + tableWidths[4],
      currentY,
      {
        width: tableWidths[5],
        align: 'right',
      },
    );

    currentY += 20;
  });

  // Draw totals
  currentY += 10;
  doc.moveTo(tableX, currentY).lineTo(tableX + tableWidths.reduce((a, b) => a + b, 0), currentY).stroke();
  currentY += 10;

  const totalsX = tableX + tableWidths[0] + tableWidths[1] + tableWidths[2] + tableWidths[3];
  doc.fontSize(10).font('Helvetica-Bold').text('Subtotal:', totalsX, currentY, {
    width: tableWidths[4],
    align: 'left',
  });

  // Calculate subtotal (before tax)
  const subtotal = invoiceItems.reduce((sum, item) => {
    const priceAfterDiscount = item.discount
      ? item.unit_price * (1 - item.discount / 100)
      : item.unit_price;
    return sum + priceAfterDiscount * item.quantity;
  }, 0);

  doc.fontSize(10).font('Helvetica').text(
    formatCurrency(subtotal, invoice.currency),
    totalsX + tableWidths[4],
    currentY,
    {
      width: tableWidths[5],
      align: 'right',
    },
  );

  currentY += 20;

  // Calculate tax
  const tax = invoiceItems.reduce((sum, item) => {
    const priceAfterDiscount = item.discount
      ? item.unit_price * (1 - item.discount / 100)
      : item.unit_price;
    const itemTax = item.tax_rate ? (priceAfterDiscount * item.quantity * item.tax_rate) / 100 : 0;
    return sum + itemTax;
  }, 0);

  doc.fontSize(10).font('Helvetica-Bold').text('Tax:', totalsX, currentY, {
    width: tableWidths[4],
    align: 'left',
  });

  doc.fontSize(10).font('Helvetica').text(
    formatCurrency(tax, invoice.currency),
    totalsX + tableWidths[4],
    currentY,
    {
      width: tableWidths[5],
      align: 'right',
    },
  );

  currentY += 20;

  // Total amount
  doc.fontSize(12).font('Helvetica-Bold').text('Total:', totalsX, currentY, {
    width: tableWidths[4],
    align: 'left',
  });

  doc.fontSize(12).font('Helvetica-Bold').text(
    formatCurrency(invoice.total_amount, invoice.currency),
    totalsX + tableWidths[4],
    currentY,
    {
      width: tableWidths[5],
      align: 'right',
    },
  );

  currentY += 40;

  // Payment terms
  doc.fontSize(12).font('Helvetica-Bold').text('Payment Terms:', 50, currentY);
  currentY += 20;
  doc.fontSize(10).font('Helvetica').text(
    `Payment is due by ${format(new Date(invoice.due_date), 'MMMM dd, yyyy')}. Please include the invoice number with your payment.`,
    50,
    currentY,
    { width: 500 },
  );

  currentY += 40;

  // Notes
  if (invoice.notes) {
    doc.fontSize(12).font('Helvetica-Bold').text('Notes:', 50, currentY);
    currentY += 20;
    doc.fontSize(10).font('Helvetica').text(invoice.notes, 50, currentY, { width: 500 });
  }

  // Add AWB barcode at the bottom
  currentY += invoice.notes ? 40 : 20;
  
  doc.fontSize(12).font('Helvetica-Bold').text('AWB Tracking Number:', {
    align: 'center',
  });
  
  // Generate barcode for AWB number
  const barcodeData = generateBarcodeBase64(invoice.awb_number);
  
  // Add the barcode image
  if (currentY > doc.page.height - 150) {
    doc.addPage();
    currentY = 50;
  }
  
  // Extract the base64 data (remove the data:image/png;base64, prefix)
  const base64Data = barcodeData.split(',')[1];
  
  // Add the barcode image centered in the document
  // Calculate the center position horizontally
  const pageWidth = doc.page.width;
  const imageWidth = 300; // Estimated width of the barcode image
  const xPosition = (pageWidth - imageWidth) / 2;
  
  doc.image(Buffer.from(base64Data, 'base64'), xPosition, currentY, {
    width: imageWidth,
  });
  
  // Finalize PDF and end stream
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(publicUrl);
    });
    stream.on('error', reject);
  });
};