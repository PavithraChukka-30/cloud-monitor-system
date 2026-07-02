import { Router, type IRouter } from "express";
import healthRouter from "./health";
import overviewRouter from "./overview";
import metricsRouter from "./metrics";
import nodesRouter from "./nodes";
import podsRouter from "./pods";
import alertsRouter from "./alerts";
import scalingRouter from "./scaling";
import deploymentsRouter from "./deployments";
import logsRouter from "./logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(overviewRouter);
router.use(metricsRouter);
router.use(nodesRouter);
router.use(podsRouter);
router.use(alertsRouter);
router.use(scalingRouter);
router.use(deploymentsRouter);
router.use(logsRouter);

export default router;
