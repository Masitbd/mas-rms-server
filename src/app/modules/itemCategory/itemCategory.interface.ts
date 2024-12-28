import { Types } from "mongoose";

export type TItemCategory = {
  uid: string;
  name: string;
  menuGroup: Types.ObjectId;
  branch: Types.ObjectId;
};
