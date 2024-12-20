import { Schema, model } from "mongoose";

// Define the Item sub-document schema
const ItemSchema = new Schema({
  itemCode: { type: String, required: false }, // Optional field
  itemName: { type: String, required: false }, // Optional field
  qty: { type: Number, required: true }, // Quantity is required
  rate: { type: Number, required: false }, // Optional field
});

// Define the Kitchen Order schema
const KitchenOrderSchema = new Schema(
  {
    items: {
      type: [ItemSchema],
      required: true,
    },
    billNo: { type: Schema.Types.Mixed, required: true }, // Can accept string or number
    kitchenOrderNo: { type: Schema.Types.Mixed, required: true }, // Can accept string or number
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    remark: { type: String, required: false }, // Optional
    tableName: { type: String, required: false }, // Optional
    waiterName: { type: String, required: false }, // Optional
  },
  {
    timestamps: true,
  }
);

export const KitchenOrder = model("kitchenOrders", KitchenOrderSchema);
