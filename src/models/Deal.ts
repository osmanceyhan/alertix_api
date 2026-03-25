import mongoose, { Schema, Document } from "mongoose";

export interface IPriceEntry {
  price: number;
  date: Date;
}

export interface IDeal extends Document {
  title: string;
  description: string;
  brand: string;
  store: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  imageUrl: string;
  images: string[];
  externalUrl: string;
  expiresAt: Date;
  isActive: boolean;
  priceHistory: IPriceEntry[];
  // Admin tarafından override edilebilir alanlar
  periodLowPrice: number | null;
  periodHighPrice: number | null;
  currentPriceOverride: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const priceEntrySchema = new Schema<IPriceEntry>(
  {
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const dealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    brand: { type: String, required: true },
    store: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "moda-giyim",
        "elektronik-teknoloji",
        "ev-yasam",
        "guzellik-kozmetik",
        "spor-outdoor",
        "aksesuar-canta",
      ],
    },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    externalUrl: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    priceHistory: [priceEntrySchema],
    periodLowPrice: { type: Number, default: null },
    periodHighPrice: { type: Number, default: null },
    currentPriceOverride: { type: Number, default: null },
  },
  { timestamps: true }
);

dealSchema.index({ category: 1, isActive: 1, createdAt: -1 });
dealSchema.index({ discountPercent: 1 });
dealSchema.index({ expiresAt: 1 });

export default mongoose.model<IDeal>("Deal", dealSchema);
