import { model, Schema } from "mongoose";
import { ORDER_STATUS, TOrder } from "./order.interface";

const orderSchema = new Schema<TOrder>(
  {
    billNo: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    tableName: {
      type: Schema.Types.ObjectId,
      ref: "Table",
    },
    waiter: {
      type: Schema.Types.ObjectId,
      ref: "Waiter",
    },
    items: [
      {
        item: { type: Schema.Types.ObjectId, ref: "MenuItemConsumption" },
        qty: Number,
        rate: Number,
        discount: Number,
        isDiscount: Boolean,
        isVat: Boolean,
      },
    ],
    guest: Number,
    vat: { type: Number },
    percentDiscount: { type: Number },
    discountAmount: { type: Number },
    totalBill: { type: Number },
    totalVat: { type: Number },
    serviceCharge: { type: Number },
    totalDiscount: { type: Number },
    netPayable: { type: Number, required: true },
    pPaymentMode: { type: String },
    paid: { type: Number },
    pPayment: { type: Number },
    cashBack: { type: Number },
    cashReceived: { type: Number },
    paymentMode: { type: String },
    remark: { type: String },
    serviceChargeRate: { type: Number },
    discountCard: { type: String },
    guestType: { type: String },
    due: { type: Number },
    status: {
      type: String,
      enum: ["posted", "notPosted", "void"],
      default: ORDER_STATUS.NOT_POSTED,
    },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);
const schemaForRegistered = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
});

const schemaForUnregistered = new Schema({
  customer: {
    name: String,
    address: String,
  },
});
export const OrderForRegisteredCustomer = Order.discriminator(
  "forRegistered",
  schemaForRegistered
);
export const OrderForUnregistered = Order.discriminator(
  "forUnregistered",
  schemaForUnregistered
);
