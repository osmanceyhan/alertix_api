import { Router } from "express";
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";
import { adminAuth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get published blogs (public)
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 */
router.get("/", getPublishedBlogs);

/**
 * @swagger
 * /api/blog/admin/all:
 *   get:
 *     summary: Get all blogs including drafts (admin)
 *     tags: [Blog]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/admin/all", adminAuth, getAllBlogsAdmin);

/**
 * @swagger
 * /api/blog/{slug}:
 *   get:
 *     summary: Get blog by slug (public)
 *     tags: [Blog]
 */
router.get("/:slug", getBlogBySlug);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create blog (admin)
 *     tags: [Blog]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/", adminAuth, createBlog);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update blog (admin)
 *     tags: [Blog]
 *     security: [{ bearerAuth: [] }]
 */
router.put("/:id", adminAuth, updateBlog);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete blog (admin)
 *     tags: [Blog]
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/:id", adminAuth, deleteBlog);

export default router;
