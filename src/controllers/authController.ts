import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";

// Device-based auth
export const deviceAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deviceId, pushToken, gender, ageRange, categories } = req.body;

    if (!deviceId) {
      res.status(400).json({ error: "deviceId gerekli" });
      return;
    }

    let user = await User.findOne({ deviceId });

    if (user) {
      if (pushToken !== undefined) user.pushToken = pushToken;
      if (gender) user.gender = gender;
      if (ageRange) user.ageRange = ageRange;
      if (categories) user.categories = categories;
      await user.save();
    } else {
      if (!gender || !ageRange || !categories?.length) {
        res
          .status(400)
          .json({ error: "İlk kayıt için gender, ageRange ve categories gerekli" });
        return;
      }
      user = await User.create({
        deviceId,
        pushToken,
        gender,
        ageRange,
        categories,
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Device auth hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Admin login
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ error: "Geçersiz kimlik bilgileri" });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Geçersiz kimlik bilgileri" });
      return;
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d" as any,
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Admin login hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
