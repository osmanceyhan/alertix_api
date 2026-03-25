import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  deviceId: string;
  pushToken?: string;
  gender: "male" | "female" | "unspecified";
  ageRange: "16-20" | "21-30" | "31-45" | "45+";
  categories: string[];
  notificationsEnabled: boolean;
  email?: string;
  phone?: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    pushToken: { type: String, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "unspecified"],
      required: true,
    },
    ageRange: {
      type: String,
      enum: ["16-20", "21-30", "31-45", "45+"],
      required: true,
    },
    categories: [{ type: String }],
    notificationsEnabled: { type: Boolean, default: true },
    email: { type: String, default: null, sparse: true },
    phone: { type: String, default: null },
    fullName: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
