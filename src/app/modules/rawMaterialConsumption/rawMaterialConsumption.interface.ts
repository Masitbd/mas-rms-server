import { Types } from "mongoose";

export type IItemConsumption = { item: Types.ObjectId; qty: number };

export interface IMenuItemConsumption {
  _id?: string;
  id: string;
  rate: number;
  itemGroup: Types.ObjectId;
  cookingTime: number;
  itemCategory: Types.ObjectId;
  isDiscount: boolean;
  isVat: boolean;
  isWaiterTips: boolean;
  itemName: string;
  itemCode: string;
  description: string;
  consumptions: IItemConsumption[];
  discount?: number;
  waiterTip?: number;
  branch: Types.ObjectId;
}
