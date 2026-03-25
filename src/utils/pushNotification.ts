import { Expo, ExpoPushMessage } from "expo-server-sdk";
import User from "../models/User";
import Notification from "../models/Notification";
import { IDeal } from "../models/Deal";

const expo = new Expo();

export const sendDealNotifications = async (deal: IDeal): Promise<number> => {
  const users = await User.find({
    categories: deal.category,
    notificationsEnabled: true,
    pushToken: { $ne: null },
  });

  const messages: ExpoPushMessage[] = [];

  for (const user of users) {
    if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) continue;

    messages.push({
      to: user.pushToken,
      sound: "default",
      title: `🔥 %${deal.discountPercent} İndirim!`,
      body: `${deal.brand} - ${deal.title} sadece ${deal.discountedPrice}₺`,
      data: { dealId: deal._id },
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  let sentCount = 0;

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
      sentCount += chunk.length;
    } catch (error) {
      console.error("Push notification gönderme hatası:", error);
    }
  }

  await Notification.create({
    dealId: deal._id,
    title: `%${deal.discountPercent} İndirim - ${deal.brand}`,
    body: `${deal.title} sadece ${deal.discountedPrice}₺`,
    sentTo: sentCount,
  });

  return sentCount;
};
