import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storiesRouter from "./stories";
import subscriptionRouter from "./subscription";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(subscriptionRouter);

export default router;
