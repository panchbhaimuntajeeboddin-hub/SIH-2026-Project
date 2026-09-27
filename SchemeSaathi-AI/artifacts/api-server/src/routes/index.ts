import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schemeSaathiRouter from "./scheme-saathi";
import udyamRouter from "./udyam";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(schemeSaathiRouter);
router.use(udyamRouter);

export default router;

