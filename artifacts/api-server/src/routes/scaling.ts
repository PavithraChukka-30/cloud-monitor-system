import { Router, type IRouter } from "express";
import { db, scalingEventsTable, scalingPoliciesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  ListScalingEventsResponse,
  ListScalingPoliciesResponse,
  ListScalingEventsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/scaling/events", async (req, res): Promise<void> => {
  const parsed = ListScalingEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = Math.min(500, Math.max(1, Math.floor(parsed.data.limit ?? 50)));
  const events = await db
    .select()
    .from(scalingEventsTable)
    .orderBy(desc(scalingEventsTable.timestamp))
    .limit(limit);

  res.json(ListScalingEventsResponse.parse(events));
});

router.get("/scaling/policies", async (_req, res): Promise<void> => {
  const policies = await db.select().from(scalingPoliciesTable);
  res.json(ListScalingPoliciesResponse.parse(policies));
});

export default router;
