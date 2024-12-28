import { Types } from "mongoose";

export type TMenuGroup = {
  uid: string;
  name: string;
  description: string;
  branch: Types.ObjectId;
};
