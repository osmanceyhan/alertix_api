import { Router } from "express";
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { adminAuth } from "../middleware/auth";

const router = Router();

router.get("/", getCategories);
router.get("/all", adminAuth, getAllCategories);
router.post("/", adminAuth, createCategory);
router.put("/:id", adminAuth, updateCategory);
router.delete("/:id", adminAuth, deleteCategory);

export default router;
