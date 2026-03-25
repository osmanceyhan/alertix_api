import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Admin from "../models/Admin";
import Category from "../models/Category";
import Deal from "../models/Deal";
import User from "../models/User";

const categories = [
  { slug: "moda-giyim", name: "Moda & Giyim", icon: "shirt", color: "#E11D48" },
  { slug: "elektronik-teknoloji", name: "Elektronik & Teknoloji", icon: "phone", color: "#0891B2" },
  { slug: "ev-yasam", name: "Ev & Yaşam", icon: "home", color: "#0D9488" },
  { slug: "guzellik-kozmetik", name: "Güzellik & Kozmetik", icon: "sparkles", color: "#D946EF" },
  { slug: "spor-outdoor", name: "Spor & Outdoor", icon: "fitness", color: "#059669" },
  { slug: "aksesuar-canta", name: "Aksesuar & Çanta", icon: "bag", color: "#7C3AED" },
];

const expiresIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const deals = [
  // Moda & Giyim
  {
    title: "Slim Fit Oxford Gömlek",
    description: "Premium pamuklu, rahat kesim erkek gömlek",
    brand: "Zara",
    store: "Zara Online",
    category: "moda-giyim",
    originalPrice: 1299,
    discountedPrice: 649,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    externalUrl: "https://www.zara.com",
    expiresAt: expiresIn(3),
  },
  {
    title: "Oversize Trençkot",
    description: "Su geçirmez kumaş, sonbahar koleksiyonu",
    brand: "Mango",
    store: "Mango",
    category: "moda-giyim",
    originalPrice: 2999,
    discountedPrice: 1199,
    discountPercent: 60,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    externalUrl: "https://www.mango.com",
    expiresAt: expiresIn(2),
  },
  {
    title: "Kadın Deri Ceket",
    description: "Gerçek deri, klasik biker model",
    brand: "Massimo Dutti",
    store: "Massimo Dutti",
    category: "moda-giyim",
    originalPrice: 5499,
    discountedPrice: 2749,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    externalUrl: "https://www.massimodutti.com",
    expiresAt: expiresIn(5),
  },

  // Elektronik & Teknoloji
  {
    title: "AirPods Pro 2. Nesil",
    description: "Aktif gürültü engelleme, MagSafe şarj kutusu",
    brand: "Apple",
    store: "Hepsiburada",
    category: "elektronik-teknoloji",
    originalPrice: 7999,
    discountedPrice: 5599,
    discountPercent: 30,
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
    externalUrl: "https://www.hepsiburada.com",
    expiresAt: expiresIn(1),
  },
  {
    title: "Galaxy Tab S9 FE 128GB",
    description: "10.9 inç ekran, S Pen dahil",
    brand: "Samsung",
    store: "Trendyol",
    category: "elektronik-teknoloji",
    originalPrice: 14999,
    discountedPrice: 8999,
    discountPercent: 40,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
    externalUrl: "https://www.trendyol.com",
    expiresAt: expiresIn(2),
  },
  {
    title: "Dyson V12 Detect Slim",
    description: "Lazer toz algılama, 60dk pil ömrü",
    brand: "Dyson",
    store: "MediaMarkt",
    category: "elektronik-teknoloji",
    originalPrice: 24999,
    discountedPrice: 14999,
    discountPercent: 40,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
    externalUrl: "https://www.mediamarkt.com.tr",
    expiresAt: expiresIn(4),
  },

  // Ev & Yaşam
  {
    title: "Pamuklu Nevresim Takımı",
    description: "Çift kişilik, 200 iplik sıklığı",
    brand: "English Home",
    store: "English Home",
    category: "ev-yasam",
    originalPrice: 1899,
    discountedPrice: 759,
    discountPercent: 60,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
    externalUrl: "https://www.englishhome.com",
    expiresAt: expiresIn(3),
  },
  {
    title: "Seramik Yemek Takımı 24 Parça",
    description: "El yapımı, 6 kişilik set",
    brand: "Karaca",
    store: "Karaca",
    category: "ev-yasam",
    originalPrice: 3499,
    discountedPrice: 1399,
    discountPercent: 60,
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
    externalUrl: "https://www.karaca.com",
    expiresAt: expiresIn(5),
  },

  // Güzellik & Kozmetik
  {
    title: "Advanced Night Repair Serum 50ml",
    description: "Anti-aging gece serumu",
    brand: "Estée Lauder",
    store: "Sephora",
    category: "guzellik-kozmetik",
    originalPrice: 4200,
    discountedPrice: 2520,
    discountPercent: 40,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
    externalUrl: "https://www.sephora.com.tr",
    expiresAt: expiresIn(2),
  },
  {
    title: "Rouge Dior Ruj Seti",
    description: "3'lü mat ruj koleksiyonu, özel kutu",
    brand: "Dior",
    store: "Boyner",
    category: "guzellik-kozmetik",
    originalPrice: 3600,
    discountedPrice: 1800,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600",
    externalUrl: "https://www.boyner.com.tr",
    expiresAt: expiresIn(1),
  },

  // Spor & Outdoor
  {
    title: "Air Max 270 React",
    description: "Erkek koşu ayakkabısı, tüm zeminler",
    brand: "Nike",
    store: "Nike.com",
    category: "spor-outdoor",
    originalPrice: 4299,
    discountedPrice: 2149,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    externalUrl: "https://www.nike.com",
    expiresAt: expiresIn(3),
  },
  {
    title: "Ultraboost Light Koşu Ayakkabısı",
    description: "Kadın, Boost teknolojisi",
    brand: "Adidas",
    store: "Adidas.com",
    category: "spor-outdoor",
    originalPrice: 5499,
    discountedPrice: 2749,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    externalUrl: "https://www.adidas.com.tr",
    expiresAt: expiresIn(4),
  },

  // Aksesuar & Çanta
  {
    title: "Tote Bag Deri Çanta",
    description: "Hakiki deri, günlük kullanım",
    brand: "Michael Kors",
    store: "Beymen",
    category: "aksesuar-canta",
    originalPrice: 8999,
    discountedPrice: 3599,
    discountPercent: 60,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
    externalUrl: "https://www.beymen.com",
    expiresAt: expiresIn(2),
  },
  {
    title: "Klasik Güneş Gözlüğü Aviator",
    description: "Polarize cam, metal çerçeve",
    brand: "Ray-Ban",
    store: "Trendyol",
    category: "aksesuar-canta",
    originalPrice: 3200,
    discountedPrice: 1600,
    discountPercent: 50,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    externalUrl: "https://www.trendyol.com",
    expiresAt: expiresIn(5),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB bağlantısı başarılı");

    // Admin oluştur
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || "admin@alertix.com",
        password: process.env.ADMIN_PASSWORD || "123456",
      });
      console.log("Admin kullanıcısı oluşturuldu");
    } else {
      console.log("Admin zaten mevcut");
    }

    // Kategorileri oluştur
    for (const cat of categories) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
    }
    console.log("Kategoriler oluşturuldu");

    // Örnek kullanıcı oluştur
    const existingUser = await User.findOne({ deviceId: "sample-device-001" });
    if (!existingUser) {
      await User.create({
        deviceId: "sample-device-001",
        gender: "male",
        ageRange: "21-30",
        categories: ["elektronik-teknoloji", "moda-giyim", "spor-outdoor"],
        notificationsEnabled: true,
      });
      console.log("Örnek kullanıcı oluşturuldu");
    }

    // Deal'leri fiyat geçmişiyle oluştur
    await Deal.deleteMany({});
    const dealsWithHistory = deals.map((deal) => {
      const base = deal.discountedPrice;
      const daysAgo = (d: number) => {
        const date = new Date();
        date.setDate(date.getDate() - d);
        return date;
      };
      return {
        ...deal,
        priceHistory: [
          { price: deal.originalPrice, date: daysAgo(60) },
          { price: Math.round(base * 1.15), date: daysAgo(45) },
          { price: Math.round(base * 1.08), date: daysAgo(30) },
          { price: Math.round(base * 0.95), date: daysAgo(20) },
          { price: Math.round(base * 1.02), date: daysAgo(10) },
          { price: Math.round(base * 0.98), date: daysAgo(5) },
          { price: base, date: new Date() },
        ],
      };
    });
    await Deal.insertMany(dealsWithHistory);
    console.log(`${deals.length} örnek fırsat (fiyat geçmişiyle) oluşturuldu`);

    await mongoose.disconnect();
    console.log("Seed tamamlandı");
    process.exit(0);
  } catch (error) {
    console.error("Seed hatası:", error);
    process.exit(1);
  }
};

seed();
