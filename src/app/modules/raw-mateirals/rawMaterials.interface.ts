import { Types } from "mongoose";

export type IRawMaterials = {
  _id?: string;
  id: string;
  baseUnit: string;
  materialName: string;
  superUnit: string;
  rate?: number;
  conversion: number;
  description?: string;
  branch: Types.ObjectId;
};
