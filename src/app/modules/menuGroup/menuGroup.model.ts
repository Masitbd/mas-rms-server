import { model, Schema } from "mongoose";
import { TMenuGroup } from "./menuGroup.interface";

const menuGroupSchema = new Schema<TMenuGroup>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export const MenuGroup = model("MenuGroup", menuGroupSchema);
