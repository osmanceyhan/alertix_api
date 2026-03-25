import { Request, Response } from "express";
import Category from "../models/Category";

export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const getAllCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) {
      res.status(404).json({ error: "Kategori bulunamadı" });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ error: "Kategori bulunamadı" });
      return;
    }
    res.json({ success: true, message: "Kategori silindi" });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
