import { Router } from "express";
import { getMe, updateMe, getAllUsers } from "../controllers/userController";
import { adminAuth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get user preferences by deviceId
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 */
router.get("/", getMe);

/**
 * @swagger
 * /api/me:
 *   patch:
 *     summary: Update user preferences
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 */
router.patch("/", updateMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/all", adminAuth, getAllUsers);

export default router;
