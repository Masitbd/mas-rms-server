import { model, Schema } from "mongoose";
import { TWaiter } from "./waiter.interface";

const waiterSchema = new Schema<TWaiter>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    remarks: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Waiter = model("Waiter", waiterSchema);
