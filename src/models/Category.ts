import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, default: "" },
    color: { type: String, default: "#FF6B35" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", categorySchema);
