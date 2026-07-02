import { Router, type IRouter } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListAlertsResponse,
  AcknowledgeAlertResponse,
  ResolveAlertResponse,
  ListAlertsQueryParams,
  AcknowledgeAlertParams,
  ResolveAlertParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const parsed = ListAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, severity } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(alertsTable.status, status));
  if (severity) conditions.push(eq(alertsTable.severity, severity));

  const alerts = conditions.length > 0
    ? await db.select().from(alertsTable).where(and(...conditions)).orderBy(alertsTable.firedAt)
    : await db.select().from(alertsTable).orderBy(alertsTable.firedAt);

  // Return most recent first
  res.json(ListAlertsResponse.parse(alerts.reverse()));
});

router.post("/alerts/:alertId/acknowledge", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.alertId) ? req.params.alertId[0] : req.params.alertId;
  // Reject non-integer IDs (e.g. "123abc" → NaN after strict check)
  if (!/^\d+$/.test(raw)) {
    res.status(400).json({ error: "alertId must be a positive integer" });
    return;
  }
  const params = AcknowledgeAlertParams.safeParse({ alertId: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db
    .update(alertsTable)
    .set({ acknowledged: true })
    .where(eq(alertsTable.id, params.data.alertId))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(AcknowledgeAlertResponse.parse(alert));
});

router.post("/alerts/:alertId/resolve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.alertId) ? req.params.alertId[0] : req.params.alertId;
  // Reject non-integer IDs (e.g. "123abc" → NaN after strict check)
  if (!/^\d+$/.test(raw)) {
    res.status(400).json({ error: "alertId must be a positive integer" });
    return;
  }
  const params = ResolveAlertParams.safeParse({ alertId: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db
    .update(alertsTable)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(eq(alertsTable.id, params.data.alertId))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(ResolveAlertResponse.parse(alert));
});

export default router;
