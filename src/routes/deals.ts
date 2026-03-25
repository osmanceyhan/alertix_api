import { Router } from "express";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDealsAdmin,
} from "../controllers/dealController";
import { adminAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: Get active deals (with filters)
 *     tags: [Deals]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: discountMin
 *         schema: { type: number }
 *       - in: query
 *         name: discountMax
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 */
router.get("/", getDeals);

/**
 * @swagger
 * /api/deals/admin:
 *   get:
 *     summary: Get all deals (admin)
 *     tags: [Deals]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/admin", adminAuth, getAllDealsAdmin);

/**
 * @swagger
 * /api/deals/{id}:
 *   get:
 *     summary: Get deal by ID
 *     tags: [Deals]
 */
router.get("/:id", getDealById);

/**
 * @swagger
 * /api/deals:
 *   post:
 *     summary: Create deal (admin)
 *     tags: [Deals]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/", adminAuth, upload.single("image"), createDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   put:
 *     summary: Update deal (admin)
 *     tags: [Deals]
 *     security: [{ bearerAuth: [] }]
 */
router.put("/:id", adminAuth, upload.single("image"), updateDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   delete:
 *     summary: Delete deal (admin)
 *     tags: [Deals]
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/:id", adminAuth, deleteDeal);

export default router;
