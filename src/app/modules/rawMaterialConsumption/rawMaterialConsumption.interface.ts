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
<<<<<<< HEAD
=======
  discount?: number;
>>>>>>> 6e58458be48ccf4a2b8d28db10100d1c6e694887
}
