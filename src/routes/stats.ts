import { Router } from "express";
import { getStats } from "../controllers/statsController";
import { adminAuth } from "../middleware/auth";

const router = Router();

router.get("/", adminAuth, getStats);

export default router;
