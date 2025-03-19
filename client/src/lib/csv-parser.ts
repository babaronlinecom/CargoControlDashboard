/**
 * CSV Parser Utility for Rate Management
 * 
 * This module provides utilities for parsing, validating, and processing
 * CSV files for shipping rate management in the admin dashboard.
 */

/**
 * Represents a shipping rate entry parsed from CSV
 */
export interface RateEntry {
  origin: string;
  destination: string;
  weight: string;
  serviceType: string;
  rate: number;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
}

/**
 * CSV Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: RateEntry[];
}

/**
 * CSV header required fields
 */
const REQUIRED_HEADERS = [
  'Origin',
  'Destination',
  'Weight',
  'ServiceType',
  'Rate',
  'Currency',
  'EffectiveDate',
  'ExpiryDate'
];

/**
 * Parse a CSV string into an array of objects
 * @param csv The CSV string to parse
 * @returns An array of objects, with headers as keys
 */
export function parseCSV(csv: string): any[] {
  // Split the CSV into lines
  const lines = csv.split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse headers (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = line.split(',').map(value => value.trim());
    
    // Create an object with headers as keys
    const entry: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j] || '';
    }
    
    data.push(entry);
  }
  
  return data;
}

/**
 * Validate a CSV file for rate data
 * @param file The CSV file to validate
 * @returns A promise resolving to the validation result
 */
export function validateRateCSV(file: File): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const parsedData = parseCSV(csv);
        
        // Validate the data
        const validation = validateRateData(parsedData);
        resolve(validation);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate parsed CSV data for rate entries
 * @param data The parsed CSV data
 * @returns The validation result
 */
export function validateRateData(data: any[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    data: []
  };
  
  if (data.length === 0) {
    result.valid = false;
    result.errors.push('CSV file has no data rows');
    return result;
  }
  
  // Check for required headers
  const headers = Object.keys(data[0]);
  for (const requiredHeader of REQUIRED_HEADERS) {
    if (!headers.includes(requiredHeader)) {
      result.valid = false;
      result.errors.push(`Missing required header: ${requiredHeader}`);
    }
  }
  
  // If headers are invalid, return early
  if (!result.valid) {
    return result;
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index is 0-based and we skip the header row
    const errors: string[] = [];
    
    // Check required fields
    if (!row.Origin) errors.push(`Row ${rowNumber}: Missing Origin`);
    if (!row.Destination) errors.push(`Row ${rowNumber}: Missing Destination`);
    if (!row.Weight) errors.push(`Row ${rowNumber}: Missing Weight`);
    if (!row.ServiceType) errors.push(`Row ${rowNumber}: Missing ServiceType`);
    
    // Validate rate (must be a number)
    if (!row.Rate) {
      errors.push(`Row ${rowNumber}: Missing Rate`);
    } else if (isNaN(parseFloat(row.Rate))) {
      errors.push(`Row ${rowNumber}: Rate must be a number`);
    }
    
    // Validate currency (must be a 3-letter code)
    if (!row.Currency) {
      errors.push(`Row ${rowNumber}: Missing Currency`);
    } else if (!/^[A-Z]{3}$/.test(row.Currency)) {
      errors.push(`Row ${rowNumber}: Currency must be a 3-letter code (e.g., USD)`);
    }
    
    // Validate dates
    if (!row.EffectiveDate) {
      errors.push(`Row ${rowNumber}: Missing EffectiveDate`);
    } else if (!isValidDate(row.EffectiveDate)) {
      errors.push(`Row ${rowNumber}: EffectiveDate must be in YYYY-MM-DD format`);
    }
    
    if (!row.ExpiryDate) {
      errors.push(`Row ${rowNumber}: Missing ExpiryDate`);
    } else if (!isValidDate(row.ExpiryDate)) {
      errors.push(`Row ${rowNumber}: ExpiryDate must be in YYYY-MM-DD format`);
    }
    
    // Add any row errors to the result
    if (errors.length > 0) {
      result.valid = false;
      result.errors.push(...errors);
    } else {
      // If valid, add to the data
      result.data.push({
        origin: row.Origin,
        destination: row.Destination,
        weight: row.Weight,
        serviceType: row.ServiceType,
        rate: parseFloat(row.Rate),
        currency: row.Currency,
        effectiveDate: row.EffectiveDate,
        expiryDate: row.ExpiryDate
      });
    }
  });
  
  return result;
}

/**
 * Checks if a string is a valid date in YYYY-MM-DD format
 * @param dateString The date string to validate
 * @returns True if the date is valid
 */
function isValidDate(dateString: string): boolean {
  // Check format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Format a date object to YYYY-MM-DD string
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a CSV string from rate entries
 * @param rates The rate entries to convert to CSV
 * @returns The CSV string
 */
export function generateRatesCSV(rates: RateEntry[]): string {
  // Create header row
  const headers = REQUIRED_HEADERS.join(',');
  
  // Create data rows
  const rows = rates.map(rate => {
    return [
      rate.origin,
      rate.destination,
      rate.weight,
      rate.serviceType,
      rate.rate.toString(),
      rate.currency,
      rate.effectiveDate,
      rate.expiryDate
    ].join(',');
  });
  
  // Combine headers and rows
  return [headers, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 * @param filename The name of the file to download
 * @param csvContent The CSV content
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append to document, trigger download, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
