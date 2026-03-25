import { Request, Response } from "express";
import Deal from "../models/Deal";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { sendDealNotifications } from "../utils/pushNotification";

export const getDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      discountMin,
      discountMax,
      priceMin,
      priceMax,
      limit = "10",
      page = "1",
      search,
      sort = "newest",
    } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }

    if (discountMin || discountMax) {
      filter.discountPercent = {};
      if (discountMin)
        (filter.discountPercent as Record<string, number>).$gte = Number(discountMin);
      if (discountMax)
        (filter.discountPercent as Record<string, number>).$lte = Number(discountMax);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { store: { $regex: search, $options: "i" } },
      ];
    }

    if (priceMin || priceMax) {
      filter.discountedPrice = {};
      if (priceMin) (filter.discountedPrice as Record<string, number>).$gte = Number(priceMin);
      if (priceMax) (filter.discountedPrice as Record<string, number>).$lte = Number(priceMax);
    }

    filter.expiresAt = { $gt: new Date() };

    // Sıralama
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "cheapest": sortOption = { discountedPrice: 1 }; break;
      case "expensive": sortOption = { discountedPrice: -1 }; break;
      case "discount": sortOption = { discountPercent: -1 }; break;
      case "newest": default: sortOption = { createdAt: -1 }; break;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [deals, total] = await Promise.all([
      Deal.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Deal.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: deals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("Deal listesi hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const getDealById = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      res.status(404).json({ error: "Fırsat bulunamadı" });
      return;
    }

    // Fiyat analizi hesapla
    const history = deal.priceHistory || [];
    const prices = history.map((h) => h.price);

    const priceAnalysis = {
      periodLow: deal.periodLowPrice ?? (prices.length ? Math.min(...prices) : deal.discountedPrice),
      periodHigh: deal.periodHighPrice ?? (prices.length ? Math.max(...prices) : deal.originalPrice),
      currentPrice: deal.currentPriceOverride ?? deal.discountedPrice,
      hasEnoughData: history.length >= 5,
      history: history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };

    res.json({ success: true, data: deal, priceAnalysis });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const createDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, description, brand, store, category,
      originalPrice, discountedPrice, externalUrl, expiresAt,
      periodLowPrice, periodHighPrice, currentPriceOverride,
    } = req.body;

    const op = Number(originalPrice);
    const dp = Number(discountedPrice);
    const discountPercent = Math.round(((op - dp) / op) * 100);

    let imageUrl = req.body.imageUrl || "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "assetix/deals");
    }

    // İlk fiyat kaydı
    const priceHistory = [{ price: dp, date: new Date() }];

    const deal = await Deal.create({
      title, description, brand, store, category,
      originalPrice: op,
      discountedPrice: dp,
      discountPercent,
      imageUrl,
      externalUrl,
      expiresAt: new Date(expiresAt),
      priceHistory,
      periodLowPrice: periodLowPrice ? Number(periodLowPrice) : null,
      periodHighPrice: periodHighPrice ? Number(periodHighPrice) : null,
      currentPriceOverride: currentPriceOverride ? Number(currentPriceOverride) : null,
    });

    const sentCount = await sendDealNotifications(deal);
    console.log(`${sentCount} kullanıcıya bildirim gönderildi`);

    res.status(201).json({ success: true, data: deal, notificationsSent: sentCount });
  } catch (error) {
    console.error("Deal oluşturma hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingDeal = await Deal.findById(req.params.id);
    if (!existingDeal) {
      res.status(404).json({ error: "Fırsat bulunamadı" });
      return;
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = await uploadToCloudinary(req.file.buffer, "assetix/deals");
    }

    if (updates.originalPrice && updates.discountedPrice) {
      updates.discountPercent = Math.round(
        ((Number(updates.originalPrice) - Number(updates.discountedPrice)) /
          Number(updates.originalPrice)) * 100
      );
    }

    // Fiyat değişikliği varsa priceHistory'ye logla
    const newPrice = updates.discountedPrice ? Number(updates.discountedPrice) : null;
    if (newPrice && newPrice !== existingDeal.discountedPrice) {
      await Deal.findByIdAndUpdate(req.params.id, {
        $push: { priceHistory: { price: newPrice, date: new Date() } },
      });
    }

    // Override alanları
    if (updates.periodLowPrice !== undefined) {
      updates.periodLowPrice = updates.periodLowPrice ? Number(updates.periodLowPrice) : null;
    }
    if (updates.periodHighPrice !== undefined) {
      updates.periodHighPrice = updates.periodHighPrice ? Number(updates.periodHighPrice) : null;
    }
    if (updates.currentPriceOverride !== undefined) {
      updates.currentPriceOverride = updates.currentPriceOverride ? Number(updates.currentPriceOverride) : null;
    }

    const deal = await Deal.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      res.status(404).json({ error: "Fırsat bulunamadı" });
      return;
    }
    res.json({ success: true, message: "Fırsat silindi" });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const getAllDealsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = "20", page = "1" } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [deals, total] = await Promise.all([
      Deal.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Deal.countDocuments(),
    ]);

    res.json({
      success: true,
      data: deals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
