
import { Router } from "express";
import { db } from "../db";
import { and, between, desc } from "drizzle-orm";
import { rateEntries } from "@shared/schema";

const router = Router();

router.get("/history", async (req, res) => {
  const { from, to } = req.query;
  
  const rates = await db.query.rateEntries.findMany({
    where: and(
      between(rateEntries.effectiveDate, new Date(from as string), new Date(to as string))
    ),
    orderBy: [desc(rateEntries.effectiveDate)]
  });

  const aggregatedRates = rates.reduce((acc, rate) => {
    const date = rate.effectiveDate.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, rate: rate.rate };
    }
    return acc;
  }, {});

  res.json(Object.values(aggregatedRates));
});

export default router;
