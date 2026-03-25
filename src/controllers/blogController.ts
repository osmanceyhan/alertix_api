import { Request, Response } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/Ş/g, "s")
    .replace(/Ç/g, "c")
    .replace(/Ü/g, "u")
    .replace(/Ö/g, "o")
    .replace(/Ğ/g, "g")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const getPublishedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10", tag, category } = req.query;

    const filter: Record<string, unknown> = { status: "published" };

    if (tag) {
      filter.tags = { $in: Array.isArray(tag) ? tag : [tag] };
    }
    if (category) {
      filter.category = category;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select("-content")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("Blog listesi hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: "published" },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({ error: "Blog yazısı bulunamadı" });
      return;
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Blog detay hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const getAllBlogsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Blog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("Admin blog listesi hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, slug, content, excerpt, featuredImage,
      metaTitle, metaDescription, metaKeywords,
      tags, category, author, status,
    } = req.body;

    const finalSlug = slug || generateSlug(title);

    // Check slug uniqueness
    const existing = await Blog.findOne({ slug: finalSlug });
    if (existing) {
      res.status(400).json({ error: "Bu slug zaten kullanılıyor" });
      return;
    }

    const blogData: Record<string, unknown> = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || "",
      featuredImage: featuredImage || "",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      metaKeywords: metaKeywords || [],
      tags: tags || [],
      category: category || "",
      author: author || "Alertix",
      status: status || "draft",
    };

    if (status === "published") {
      blogData.publishedAt = new Date();
    }

    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error("Blog oluşturma hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Blog yazısı bulunamadı" });
      return;
    }

    const updates = { ...req.body };

    // Auto-generate slug from title if title changed and no slug provided
    if (updates.title && !updates.slug) {
      updates.slug = generateSlug(updates.title);
    }

    // Check slug uniqueness if slug is being changed
    if (updates.slug && updates.slug !== existing.slug) {
      const slugExists = await Blog.findOne({ slug: updates.slug, _id: { $ne: new mongoose.Types.ObjectId(req.params.id as string) } });
      if (slugExists) {
        res.status(400).json({ error: "Bu slug zaten kullanılıyor" });
        return;
      }
    }

    // Set publishedAt when publishing for the first time
    if (updates.status === "published" && existing.status !== "published") {
      updates.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Blog güncelleme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      res.status(404).json({ error: "Blog yazısı bulunamadı" });
      return;
    }
    res.json({ success: true, message: "Blog yazısı silindi" });
  } catch (error) {
    console.error("Blog silme hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
