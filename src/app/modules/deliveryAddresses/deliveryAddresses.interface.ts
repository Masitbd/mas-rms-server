import { Types } from "mongoose";

export interface TDeliveryAddress {
  _id: string;
  name: string;
  phone: string;
  landMark: string;
  division: string;
  city: string;
  zone: string;
  address: string;
  userId: Types.ObjectId;
  isDefault: boolean;
}
