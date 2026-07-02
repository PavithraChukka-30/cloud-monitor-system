import { Router, type IRouter } from "express";
import { getNodes, getNodeById } from "../lib/simulation";
import {
  ListNodesResponse,
  GetNodeResponse,
  GetNodeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/nodes", async (_req, res): Promise<void> => {
  res.json(ListNodesResponse.parse(getNodes()));
});

router.get("/nodes/:nodeId", async (req, res): Promise<void> => {
  const params = GetNodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const node = getNodeById(params.data.nodeId);
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  res.json(GetNodeResponse.parse(node));
});

export default router;
