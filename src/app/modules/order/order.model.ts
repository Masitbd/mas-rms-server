import { model, Schema } from "mongoose";
import { TOrder } from "./order.interface";

const orderShcema = new Schema<TOrder>({
  oid: { type: String, required: true, unique: true },
  table: {
    type: Schema.Types.ObjectId,
    ref: "Table",
  },
  waiter: {
    type: Schema.Types.ObjectId,
    ref: "Waiter",
  },
  sChargse: { type: Number, default: 0 },
  tSChargse: { type: Number, default: 0 },
  vat: { type: Number },
  parchentDiscount: { type: Number },
  cashDiscount: { type: Number },
  discountCard: { type: String },
  netPayable: { type: Number },
  cReceive: { type: Number },
  cBack: { type: Number },
  totalBill: { type: Number, required: true },
  totalVat: { type: Number },
  totalDiscount: { type: Number },
  pMode: {
    type: String,
    required: true,
    enum: ["bkash", "cash", "bank", "nagad", "rocket", "card"],
  },
  due: { type: Number },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  paid: { type: Number },
  pPayment: { type: Number },
  pPaymentMode: {
    type: String,
    enum: ["bkash", "cash", "bank", "nagad", "rocket", "card"],
  },
  remarks: { type: String },
  //?
  items: [{ item: { type: Schema.Types.ObjectId, ref: "ItemCategroy" } }],
});

export const Order = model("Order", orderShcema);
