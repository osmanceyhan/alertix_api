import { Request, Response } from "express";
import User from "../models/User";
import Deal from "../models/Deal";
import Notification from "../models/Notification";

export const getStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeDeals, todayNotifications, totalNotifications] =
      await Promise.all([
        User.countDocuments(),
        Deal.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
        Notification.countDocuments({ createdAt: { $gte: today } }),
        Notification.countDocuments(),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeDeals,
        todayNotifications,
        totalNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
