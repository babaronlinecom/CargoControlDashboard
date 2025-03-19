import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Advanced shipment filtering schema
const shipmentFilterSchema = z.object({
  status: z.string().optional(),
  dateRange: z.string().optional(),
  destination: z.string().optional(),
  serviceType: z.string().optional(),
  customerName: z.string().optional(),
  origin: z.string().optional(),
  minWeight: z.number().optional(),
  maxWeight: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Historical rate analysis schema
const rateAnalysisSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  serviceType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

// Advanced shipment filtering
router.get("/shipments/filter", async (req, res) => {
  try {
    const validationResult = shipmentFilterSchema.safeParse(req.query);

    if (!validationResult.success) {
      const error = fromZodError(validationResult.error);
      return res.status(400).json({ message: error.message });
    }

    const filters = validationResult.data;
    const shipments = await storage.getFilteredShipments(filters);
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Failed to filter shipments" });
  }
});

// Historical rate analysis
router.get("/rates/analysis", async (req, res) => {
  try {
    const validationResult = rateAnalysisSchema.safeParse(req.query);

    if (!validationResult.success) {
      const error = fromZodError(validationResult.error);
      return res.status(400).json({ message: error.message });
    }

    const params = validationResult.data;
    const analysis = await storage.getRateAnalysis(params);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: "Failed to analyze rates" });
  }
});

// Export rate data
router.get("/rates/export", async (req, res) => {
  try {
    const format = req.query.format as "csv" | "excel" | "pdf";
    const dateRange = req.query.dateRange as string;

    const exportData = await storage.exportRateData(format, dateRange);

    // Set appropriate headers based on format
    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=rates.csv");
        break;
      case "excel":
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=rates.xlsx");
        break;
      case "pdf":
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=rates.pdf");
        break;
    }

    res.send(exportData);
  } catch (error) {
    res.status(500).json({ message: "Failed to export rate data" });
  }
});

export default router;
