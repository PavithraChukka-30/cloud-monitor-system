import { Router, type IRouter } from "express";
import { getLogs } from "../lib/simulation";
import { GetLogsResponse, GetLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/logs", async (req, res): Promise<void> => {
  const parsed = GetLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const logs = getLogs(parsed.data);
  res.json(GetLogsResponse.parse(logs));
});

export default router;
