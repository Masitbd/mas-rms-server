import { model, Schema } from "mongoose";
import { IDueCollection } from "./dewCollection.interface";

const dueCollectionSchema = new Schema<IDueCollection>(
  {
    amount: { type: Number, required: true },
    postedBy: { type: String, required: true, ref: "Profile" },
    remark: { type: String },
    orderId: { type: Schema.Types.ObjectId, required: true, ref: "Order" },
    method: { type: String, required: true },
  },
  { timestamps: true }
);

export const DueCollection = model("DueCollection", dueCollectionSchema);
