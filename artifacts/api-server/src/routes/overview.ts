import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { getOverviewSummary, getRecentActivity } from "../lib/simulation";
import {
  GetOverviewSummaryResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/overview/summary", async (_req, res): Promise<void> => {
  const summary = getOverviewSummary();

  const [firingRow] = await db
    .select({ count: count() })
    .from(alertsTable)
    .where(eq(alertsTable.status, "firing"));
  const [criticalRow] = await db
    .select({ count: count() })
    .from(alertsTable)
    .where(eq(alertsTable.severity, "critical"));

  summary.firingAlerts = Number(firingRow?.count ?? 0);
  summary.criticalAlerts = Number(criticalRow?.count ?? 0);

  // Determine cluster health based on alerts + node state
  if (summary.criticalAlerts > 0 || summary.healthyNodes < summary.totalNodes - 1) {
    summary.clusterHealth = "critical";
  } else if (summary.firingAlerts > 0 || summary.healthyNodes < summary.totalNodes) {
    summary.clusterHealth = "degraded";
  } else {
    summary.clusterHealth = "healthy";
  }

  res.json(GetOverviewSummaryResponse.parse(summary));
});

router.get("/overview/activity", async (_req, res): Promise<void> => {
  const activity = getRecentActivity();
  res.json(GetRecentActivityResponse.parse(activity));
});

export default router;
