import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.route("/analytics").post(getAnalytics);

export default router;
