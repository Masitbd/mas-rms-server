import { model, Schema } from "mongoose";
import { TTable } from "./table.interface";

const tableSchema = new Schema<TTable>(
  {
    tid: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    details: { type: String },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  {
    timestamps: true,
  }
);

export const Table = model("Table", tableSchema);
