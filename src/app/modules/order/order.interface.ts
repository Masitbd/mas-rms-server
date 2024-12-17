import { Types } from "mongoose";

export type TOrder = {
  oid: string;
  table: Types.ObjectId;

  waiter: Types.ObjectId;

  vat?: number;
  parchentDiscount: number;
  cashDiscount: number;
  discountCard?: string;
  guest?: Types.ObjectId;
  items: {
    item: Types.ObjectId;
  }[];

  totalBill: number;
  totalVat: number;
  sChargse: number;
  tSChargse: number;
  totalDiscount: number;
  netPayable: number;
  pMode: string;
  remarks?: string;
  pPaymentMode?: string;
  paid: number;
  pPayment: number;
  due: number;
  cReceive?: number;
  cBack?: number;
};
