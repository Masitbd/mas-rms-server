import { Schema, model } from "mongoose";
import { IMenuItemConsumption } from "./rawMaterialConsumption.interface";

// Create schema for the nested ItemConsumption
const ItemConsumptionSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "RawMaterial",
  },
  qty: {
    type: Number,
    required: true,
  },
});

// Create the main MenuItemConsumption schema
const MenuItemConsumptionSchema = new Schema<IMenuItemConsumption>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    itemGroup: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "MenuGroup", // Assuming you have an ItemGroup model
    },
    cookingTime: {
      type: Number,
      required: true,
    },
    itemCategory: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ItemCategroy", // Assuming you have an ItemCategory model
    },
    isDiscount: {
      type: Boolean,
      default: false,
    },
    isVat: {
      type: Boolean,
      default: false,
    },
    isWaiterTips: {
      type: Boolean,
      default: false,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    consumptions: {
      type: [ItemConsumptionSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Removes __v field
  }
);

// Create indexes for frequently queried fields
MenuItemConsumptionSchema.index({ itemName: 1 });
MenuItemConsumptionSchema.index({ itemCode: 1 }, { unique: true });

// Create and export the model
const MenuItemConsumption = model<IMenuItemConsumption>(
  "MenuItemConsumption",
  MenuItemConsumptionSchema
);

export default MenuItemConsumption;
