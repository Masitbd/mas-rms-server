import { Types } from "mongoose";

export type IDueCollection = {
  orderId: Types.ObjectId;
  amount: number;
  postedBy: string;
  remark?: string;
  method: string;
  _id?: string;
  createdAt?: Date;
};
