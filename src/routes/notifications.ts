import { Router } from "express";
import {
  getNotifications,
  sendDealNotification,
  sendUserNotification,
} from "../controllers/notificationController";
import { adminAuth } from "../middleware/auth";

const router = Router();

router.get("/", adminAuth, getNotifications);
router.post("/deal", adminAuth, sendDealNotification);
router.post("/user", adminAuth, sendUserNotification);

export default router;
