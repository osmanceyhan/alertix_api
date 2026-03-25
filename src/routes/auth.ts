import { Router } from "express";
import { deviceAuth, adminLogin } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * /api/auth/device:
 *   post:
 *     summary: Device-based auth (register/update)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId]
 *             properties:
 *               deviceId: { type: string }
 *               pushToken: { type: string }
 *               gender: { type: string, enum: [male, female, unspecified] }
 *               ageRange: { type: string, enum: ["16-20", "21-30", "31-45", "45+"] }
 *               categories: { type: array, items: { type: string } }
 */
router.post("/device", deviceAuth);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 */
router.post("/admin/login", adminLogin);

export default router;
