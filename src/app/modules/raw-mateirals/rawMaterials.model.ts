import { model, Schema } from "mongoose";
import { IRawMaterials } from "./rawMaterials.interface";

const RawMaterialSchema = new Schema<IRawMaterials>(
  {
    id: { type: String, required: true, unique: true }, // Unique and required field
    baseUnit: { type: String, required: true },
    materialName: { type: String, required: true, unique: true },
    superUnit: { type: String, required: true },
    rate: { type: Number, default: true }, // Optional field with a default value
    conversion: { type: Number, required: true },
    description: { type: String }, // Optional field
    branch: { type: Schema.Types.ObjectId, ref: "Branch" }, // Reference to the Branch model
  },
  { timestamps: true }
);

// Create and export the model
const RawMaterial = model<IRawMaterials>("RawMaterial", RawMaterialSchema);
export default RawMaterial;
