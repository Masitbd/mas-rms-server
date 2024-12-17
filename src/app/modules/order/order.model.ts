import { model, Schema } from "mongoose";
import { TOrder } from "./order.interface";

const orderShcema = new Schema<TOrder>({
  billNo: { type: String, required: true, unique: true },
  tableName: {
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
  percentDiscount: { type: Number },
  discountAmount: { type: Number },
  discountCard: { type: String },
  netPayable: { type: Number },
  cashReceived: { type: Number },
  cashBack: { type: Number },
  totalBill: { type: Number, required: true },
  totalVat: { type: Number },
  totalDiscount: { type: Number },
  paymentMode: {
    type: String,
    required: true,
    enum: ["bkash", "cash", "bank", "nagad", "rocket", "card"],
  },
  due: { type: Number },
  guest: {
    type: Number,
  },
  paid: { type: Number },
  pPayment: { type: Number },
  pPaymentMode: {
    type: String,
    enum: ["bkash", "cash", "bank", "nagad", "rocket", "card"],
  },
  remark: { type: String },
  //?
  items: [{ item: { type: Schema.Types.ObjectId, ref: "ItemCategroy" } }],
});

export const Order = model("Order", orderShcema);
