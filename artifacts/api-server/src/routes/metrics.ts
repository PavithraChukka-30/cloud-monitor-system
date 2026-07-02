import { Router, type IRouter } from "express";
import { getCurrentMetrics, getMetricsHistory } from "../lib/simulation";
import {
  GetCurrentMetricsResponse,
  GetMetricsHistoryResponse,
  GetMetricsHistoryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/metrics/current", async (_req, res): Promise<void> => {
  res.json(GetCurrentMetricsResponse.parse(getCurrentMetrics()));
});

router.get("/metrics/history", async (req, res): Promise<void> => {
  const parsed = GetMetricsHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rawMinutes = parsed.data.minutes ?? 60;
  // Enforce integer and cap to prevent CPU/memory amplification
  const minutes = Math.min(1440, Math.max(1, Math.floor(rawMinutes)));
  const { metric } = parsed.data;
  const history = getMetricsHistory(minutes, metric);
  res.json(GetMetricsHistoryResponse.parse(history));
});

export default router;
