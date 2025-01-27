import { Types } from "mongoose";
import { IMenuItemConsumption } from "../rawMaterialConsumption/rawMaterialConsumption.interface";
import { TCustomer } from "../customer/customer.interface";
import { TTable } from "../table/table.interface";
import { TWaiter } from "../waiter/waiter.interface";
import { TDeliveryAddress } from "../deliveryAddresses/deliveryAddresses.interface";

export type IItems = {
  item: IMenuItemConsumption | Types.ObjectId;
  qty: number;
  rate: number;
  discount: number;
  isDiscount: boolean;
  isVat: boolean;
};

export type IUnregisteredCustomerInfo = {
  name: string;
  address: string;
};

export type TOrder = {
  _id: string;
  billNo: string;
  date: Date;
  tableName: TTable | Types.ObjectId;
  waiter: TWaiter | Types.ObjectId; //!change
  items: IItems[];
  guest: number;
  sCharge: number;
  vat: number;
  percentDiscount: number;
  discountAmount: number;
  totalBill: number;
  totalVat: number;
  serviceCharge: number;
  tSChargse: number;
  totalDiscount: number;
  netPayable: number;
  pPaymentMode: string;
  paid: number;
  pPayment: number;
  due: number;
  cashBack: number;
  cashReceived: number;
  paymentMode: string;
  remark: string;
  serviceChargeRate: number;
  discountCard?: string;
  customer: TCustomer | IUnregisteredCustomerInfo | Types.ObjectId;
  guestType: string;
  status?: ORDER_STATUS;
  branch: Types.ObjectId;
  platform: string;

  deliveryMethod?: string;
  deliveryCharge?: number;
  deliveryAddress?: TDeliveryAddress;

  postedBy: Types.ObjectId;
};

export type TOrderForCacheServer = TOrder & {
  kitchenOrders: string[];
};
export type IActiveTable = {
  billNo: string;
  table: TTable;
  waiter: TWaiter;
  orderId: string;
};

export type IPopulatedOrderData = TOrder & {
  items: (IItems & { item: IMenuItemConsumption })[];
  customer: TCustomer;
  tableName: TTable;
  waiter: TWaiter;
};

export enum ORDER_STATUS {
  POSTED = "posted",
  NOT_POSTED = "notPosted",
  VOID = "void",
}

export enum ORDER_PLATFORM {
  ONLINE = "online",
  OFFLINE = "offline",
}
