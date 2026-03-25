import { Request, Response } from "express";
import User from "../models/User";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      res.status(400).json({ error: "deviceId gerekli" });
      return;
    }

    const user = await User.findOne({ deviceId: deviceId as string });
    if (!user) {
      res.status(404).json({ error: "Kullanıcı bulunamadı" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      res.status(400).json({ error: "deviceId gerekli" });
      return;
    }

    const { gender, ageRange, categories, notificationsEnabled, pushToken, email, phone, fullName } =
      req.body;

    const updates: Record<string, unknown> = {};
    if (gender) updates.gender = gender;
    if (ageRange) updates.ageRange = ageRange;
    if (categories) updates.categories = categories;
    if (notificationsEnabled !== undefined)
      updates.notificationsEnabled = notificationsEnabled;
    if (pushToken !== undefined) updates.pushToken = pushToken;
    if (email !== undefined) updates.email = email || null;
    if (phone !== undefined) updates.phone = phone || null;
    if (fullName !== undefined) updates.fullName = fullName || null;

    const user = await User.findOneAndUpdate(
      { deviceId: deviceId as string },
      updates,
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: "Kullanıcı bulunamadı" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Admin: kullanıcı listesi
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { limit = "20", page = "1" } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
