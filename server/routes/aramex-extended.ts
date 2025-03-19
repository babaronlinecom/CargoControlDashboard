import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Customs clearance request schema
const customsClearanceSchema = z.object({
  shipmentId: z.number(),
  declarationType: z.enum(["import", "export", "transit"]),
  goodsDescription: z.string(),
  goodsValue: z.number(),
  currency: z.string(),
  documents: z.array(z.string()).optional(),
  hsCode: z.string().optional(),
});

// Insurance request schema
const insuranceSchema = z.object({
  shipmentId: z.number(),
  cargoValue: z.number(),
  currency: z.string(),
  coverageType: z.enum(["basic", "extended", "comprehensive"]),
  specialRequirements: z.string().optional(),
});

// Pickup scheduling schema
const pickupScheduleSchema = z.object({
  shipmentId: z.number(),
  pickupDate: z.string(),
  timeWindow: z.object({
    start: z.string(),
    end: z.string(),
  }),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    contactName: z.string(),
    contactPhone: z.string(),
  }),
  specialInstructions: z.string().optional(),
});

// Customs clearance request
router.post("/customs-clearance", async (req, res) => {
  try {
    const validationResult = customsClearanceSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = fromZodError(validationResult.error);
      return res.status(400).json({ message: error.message });
    }

    const clearanceData = validationResult.data;
    const result = await storage.requestCustomsClearance(clearanceData);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process customs clearance request" });
  }
});

// Insurance request
router.post("/insurance", async (req, res) => {
  try {
    const validationResult = insuranceSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = fromZodError(validationResult.error);
      return res.status(400).json({ message: error.message });
    }

    const insuranceData = validationResult.data;
    const result = await storage.requestInsurance(insuranceData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to process insurance request" });
  }
});

// Schedule pickup
router.post("/schedule-pickup", async (req, res) => {
  try {
    const validationResult = pickupScheduleSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = fromZodError(validationResult.error);
      return res.status(400).json({ message: error.message });
    }

    const scheduleData = validationResult.data;
    const result = await storage.schedulePickup(scheduleData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule pickup" });
  }
});

// Get customs clearance status
router.get("/customs-clearance/:shipmentId", async (req, res) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    const status = await storage.getCustomsClearanceStatus(shipmentId);
    res.json(status);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch customs clearance status" });
  }
});

// Get insurance details
router.get("/insurance/:shipmentId", async (req, res) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    const details = await storage.getInsuranceDetails(shipmentId);
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch insurance details" });
  }
});

// Get pickup schedule
router.get("/pickup-schedule/:shipmentId", async (req, res) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    const schedule = await storage.getPickupSchedule(shipmentId);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pickup schedule" });
  }
});

export default router;
