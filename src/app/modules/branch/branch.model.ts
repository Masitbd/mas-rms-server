import { model, Schema } from "mongoose";
import { TBranch } from "./branch.interface";

const branchSchema = new Schema<TBranch>(
  {
    bid: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    vatNo: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
    address1: { type: String, required: true },
    address2: { type: String },
    availability: { type: String, required: true },
    deliveryLocations: [{ type: String }],
    division: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
  },
  { timestamps: true }
);

export const Branch = model("Branch", branchSchema);
