import { model, Schema } from "mongoose";
import { TItemCategory } from "./itemCategory.interface";

const itemCategoySchema = new Schema<TItemCategory>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, index: true },
    menuGroup: {
      type: Schema.Types.ObjectId,
      ref: "MenuGroup",
      required: true,
    },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
    image: { type: Schema.Types.ObjectId, ref: "Images" },
    isPopular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ItemCategroy = model("ItemCategroy", itemCategoySchema);
