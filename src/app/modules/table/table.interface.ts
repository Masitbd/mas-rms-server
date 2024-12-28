import { Types } from "mongoose";

export type TTable = {
  name: string;
  tid: string;
  details: string;
  branch: Types.ObjectId;
};
