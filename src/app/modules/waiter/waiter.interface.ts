import { Types } from "mongoose";

export type TWaiter = {
  uid: string;
  name: string;
  remarks: string;
  branch: Types.ObjectId;
};
