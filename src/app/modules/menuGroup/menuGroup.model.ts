import { model, Schema } from "mongoose";
import { TMenuGroup } from "./menuGroup.interface";

const menuGroupSchema = new Schema<TMenuGroup>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  {
    timestamps: true,
  }
);

export const MenuGroup = model("MenuGroup", menuGroupSchema);
