import { model, Schema } from "mongoose";
import { TCustomer } from "./customer.interface";

const customerSchema = new Schema<TCustomer>(
  {
    cid: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String },
    dob: { type: String },
    reward: { type: Number },
    discountCard: { type: String, unique: true },
    discount: { type: Number },
    isActive: { type: Boolean, default: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  {
    timestamps: true,
  }
);

export const Customer = model("Customer", customerSchema);
