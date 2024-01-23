import { Router } from "express";
import { redirector } from "../controllers/redirector.controller.js";

const router = Router();

router.route("/:urlId").get(redirector);

export default router;
