import { queryClient, apiRequest } from "./queryClient";

/**
 * Aramex API integration functions
 */

export interface AramexCredentials {
  clientInfo: {
    accountNumber: string;
    accountPin: string;
    accountEntity: string;
    accountCountryCode: string;
    userName: string;
    password: string;
    version: string;
  };
}

export interface ShipmentDestination {
  line1: string;
  line2?: string;
  city: string;
  stateOrProvinceCode?: string;
  postCode?: string;
  countryCode: string;
}

export interface ShipmentParty {
  reference1?: string;
  reference2?: string;
  accountNumber?: string;
  partyAddress: ShipmentDestination;
  contact: {
    personName: string;
    companyName?: string;
    phoneNumber1: string;
    phoneNumber2?: string;
    emailAddress?: string;
  };
}

export interface ShipmentDetails {
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  weight: {
    value: number;
    unit: "kg" | "lb";
  };
  numberOfPieces: number;
  productGroup: "EXP" | "DOM";
  productType: string;
  paymentType: "P" | "C" | "3";
  paymentOptions?: string;
  customsValueAmount?: {
    amount: number;
    currencyCode: string;
  };
  cashOnDeliveryAmount?: {
    amount: number;
    currencyCode: string;
  };
  descriptionOfGoods?: string;
  goodsOriginCountry?: string;
}

export interface CreateShipmentRequest {
  shipper: ShipmentParty;
  consignee: ShipmentParty;
  shipmentDetails: ShipmentDetails;
  pickupDetails?: {
    pickupDate: string; // ISO date
    readyTime: string; // HH:MM
    lastPickupTime: string; // HH:MM
    closingTime: string; // HH:MM
    location: string;
  };
}

export interface CalculateRateRequest {
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  weight: number;
  packageType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface TrackingRequest {
  trackingNumber: string;
}

export interface LocationRequest {
  country: string;
  city?: string;
}

/**
 * Calculate shipping rates through the Aramex API
 */
export async function calculateShippingRates(request: CalculateRateRequest) {
  try {
    const response = await apiRequest("POST", "/api/aramex/calculate-rates", request);
    return response.json();
  } catch (error) {
    console.error("Failed to calculate shipping rates:", error);
    throw error;
  }
}

/**
 * Create a new shipment through the Aramex API
 */
export async function createShipment(shipmentData: CreateShipmentRequest) {
  try {
    const response = await apiRequest("POST", "/api/aramex/shipments/create", shipmentData);
    return response.json();
  } catch (error) {
    console.error("Failed to create shipment:", error);
    throw error;
  }
}

/**
 * Track a shipment through the Aramex API
 */
export async function trackShipment(request: TrackingRequest) {
  try {
    const response = await apiRequest("POST", "/api/aramex/track", request);
    return response.json();
  } catch (error) {
    console.error("Failed to track shipment:", error);
    throw error;
  }
}

/**
 * Find Aramex service locations
 */
export async function findServiceLocations(request: LocationRequest) {
  try {
    const response = await apiRequest("POST", "/api/aramex/locations", request);
    return response.json();
  } catch (error) {
    console.error("Failed to find service locations:", error);
    throw error;
  }
}

/**
 * Schedule a pickup through the Aramex API
 */
export async function schedulePickup(pickupData: any) {
  try {
    const response = await apiRequest("POST", "/api/aramex/pickups/create", pickupData);
    return response.json();
  } catch (error) {
    console.error("Failed to schedule pickup:", error);
    throw error;
  }
}

/**
 * Cancel a shipment through the Aramex API
 */
export async function cancelShipment(cancelData: { shipmentNumber: string; reason: string }) {
  try {
    const response = await apiRequest("POST", "/api/aramex/shipments/cancel", cancelData);
    return response.json();
  } catch (error) {
    console.error("Failed to cancel shipment:", error);
    throw error;
  }
}

/**
 * Get Aramex API connection status
 */
export async function getAramexStatus() {
  try {
    const response = await apiRequest("GET", "/api/aramex/status", undefined);
    return response.json();
  } catch (error) {
    console.error("Failed to get Aramex API status:", error);
    throw error;
  }
}

/**
 * Shipment and Rate Management functions
 */

/**
 * Upload a CSV rate file for processing
 */
export async function uploadRateFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/rates/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
    
    return response.json();
  } catch (error) {
    console.error("Failed to upload rate file:", error);
    throw error;
  }
}

/**
 * Get all rate files
 */
export async function getRateFiles() {
  try {
    const response = await apiRequest("GET", "/api/rates/files", undefined);
    return response.json();
  } catch (error) {
    console.error("Failed to get rate files:", error);
    throw error;
  }
}

/**
 * Get rate entries from a specific file
 */
export async function getRateEntries(fileId: number) {
  try {
    const response = await apiRequest("GET", `/api/rates/entries/${fileId}`, undefined);
    return response.json();
  } catch (error) {
    console.error("Failed to get rate entries:", error);
    throw error;
  }
}

/**
 * Update rate entries
 */
export async function updateRateEntries(rates: any[]) {
  try {
    const response = await apiRequest("PATCH", "/api/rates/entries", { rates });
    return response.json();
  } catch (error) {
    console.error("Failed to update rate entries:", error);
    throw error;
  }
}

/**
 * Get shipment analytics data
 */
export async function getShipmentAnalytics(timeRange: string, chartType: string) {
  try {
    const response = await apiRequest("GET", `/api/analytics/shipments/trends?timeRange=${timeRange}&chartType=${chartType}`, undefined);
    return response.json();
  } catch (error) {
    console.error("Failed to get shipment analytics:", error);
    throw error;
  }
}

/**
 * Get shipment statistics
 */
export async function getShipmentStatistics(timeRange: string) {
  try {
    const response = await apiRequest("GET", `/api/analytics/statistics?timeRange=${timeRange}`, undefined);
    return response.json();
  } catch (error) {
    console.error("Failed to get shipment statistics:", error);
    throw error;
  }
}
