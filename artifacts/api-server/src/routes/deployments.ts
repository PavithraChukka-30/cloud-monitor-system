import { Router, type IRouter } from "express";
import { db, deploymentsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListDeploymentsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/deployments", async (_req, res): Promise<void> => {
  const deployments = await db
    .select()
    .from(deploymentsTable)
    .orderBy(desc(deploymentsTable.deployedAt));

  res.json(ListDeploymentsResponse.parse(deployments));
});

export default router;
