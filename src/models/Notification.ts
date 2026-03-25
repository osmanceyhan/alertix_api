import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  dealId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  sentTo: number;
  sentAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    dealId: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    sentTo: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
