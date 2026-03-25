import { Request, Response } from "express";
import admin from "firebase-admin";
import Notification from "../models/Notification";
import User from "../models/User";
import Deal from "../models/Deal";
import { isFirebaseReady } from "../config/firebase";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = "20", page = "1" } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .populate("dealId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments(),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Ürün bazlı bildirim gönder (o kategorideki tüm kullanıcılara)
export const sendDealNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dealId, title, body } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      res.status(404).json({ error: "Fırsat bulunamadı" });
      return;
    }

    const users = await User.find({
      categories: deal.category,
      notificationsEnabled: true,
      pushToken: { $ne: null },
    });

    const sentCount = await sendPushToUsers(
      users.map((u) => u.pushToken!),
      title || `%${deal.discountPercent} İndirim - ${deal.brand}`,
      body || `${deal.title} sadece ${deal.discountedPrice} TL`,
      { dealId: deal._id?.toString() }
    );

    await Notification.create({
      dealId: deal._id,
      title: title || `%${deal.discountPercent} İndirim - ${deal.brand}`,
      body: body || `${deal.title} sadece ${deal.discountedPrice} TL`,
      sentTo: sentCount,
    });

    res.json({ success: true, sentTo: sentCount });
  } catch (error) {
    console.error("Deal bildirim hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Kullanıcı bazlı bildirim gönder
export const sendUserNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, title, body, dealId } = req.body;

    if (!title || !body) {
      res.status(400).json({ error: "title ve body gerekli" });
      return;
    }

    let users;
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds }, pushToken: { $ne: null } });
    } else {
      // Tüm kullanıcılara gönder
      users = await User.find({ notificationsEnabled: true, pushToken: { $ne: null } });
    }

    const sentCount = await sendPushToUsers(
      users.map((u) => u.pushToken!),
      title,
      body,
      dealId ? { dealId } : {}
    );

    await Notification.create({
      dealId: dealId || null,
      title,
      body,
      sentTo: sentCount,
    });

    res.json({ success: true, sentTo: sentCount });
  } catch (error) {
    console.error("Kullanıcı bildirim hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Push gönderme helper - Firebase veya Expo kullanır
async function sendPushToUsers(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<number> {
  if (tokens.length === 0) return 0;

  let sentCount = 0;

  // Firebase tokens (FCM)
  const fcmTokens = tokens.filter((t) => !t.startsWith("ExponentPushToken"));
  // Expo tokens
  const expoTokens = tokens.filter((t) => t.startsWith("ExponentPushToken"));

  // Firebase ile gönder
  if (fcmTokens.length > 0 && isFirebaseReady()) {
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: { title, body },
        data,
      });
      sentCount += response.successCount;
    } catch (error) {
      console.error("Firebase gönderme hatası:", error);
    }
  }

  // Expo ile gönder
  if (expoTokens.length > 0) {
    const messages: ExpoPushMessage[] = expoTokens
      .filter((t) => Expo.isExpoPushToken(t))
      .map((token) => ({
        to: token,
        sound: "default" as const,
        title,
        body,
        data,
      }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
        sentCount += chunk.length;
      } catch (error) {
        console.error("Expo gönderme hatası:", error);
      }
    }
  }

  return sentCount;
}
