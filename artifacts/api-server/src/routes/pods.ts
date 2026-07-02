import { Router, type IRouter } from "express";
import { getPods, getPodById } from "../lib/simulation";
import {
  ListPodsResponse,
  GetPodResponse,
  GetPodParams,
  ListPodsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pods", async (req, res): Promise<void> => {
  const parsed = ListPodsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const pods = getPods(parsed.data);
  res.json(ListPodsResponse.parse(pods));
});

router.get("/pods/:podId", async (req, res): Promise<void> => {
  const params = GetPodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const pod = getPodById(params.data.podId);
  if (!pod) {
    res.status(404).json({ error: "Pod not found" });
    return;
  }

  res.json(GetPodResponse.parse(pod));
});

export default router;
