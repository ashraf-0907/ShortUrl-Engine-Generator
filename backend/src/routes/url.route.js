import { Router } from "express";
import { createUrl } from "../controllers/createUrl.controler.js";

const router = Router();

router.route("/createUrl").post(createUrl);

export default router;
