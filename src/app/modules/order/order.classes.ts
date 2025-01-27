import { ObjectId, Types } from "mongoose";
import { TTable } from "../table/table.interface";
import {
  IItems,
  IUnregisteredCustomerInfo,
  ORDER_PLATFORM,
  TOrder,
} from "./order.interface";
import { TCustomer } from "../customer/customer.interface";
import { IMenuItemConsumption } from "../rawMaterialConsumption/rawMaterialConsumption.interface";
import { TWaiter } from "../waiter/waiter.interface";
import { generateOrderId } from "../../../utils/generateUniqueId";
import { Customer } from "../customer/customer.model";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import MenuItemConsumption from "../rawMaterialConsumption/rawMaterialConsumption.model";
import { TDeliveryAddress } from "../deliveryAddresses/deliveryAddresses.interface";

export class orderDataValidator {
  billNo: string;
  date: Date;
  tableName?: TTable | Types.ObjectId;
  waiter?: TWaiter | Types.ObjectId;
  items: IItems[];
  guest: number;
  sCharge: number;
  vat: number;
  percentDiscount: number;
  discountAmount: number;
  totalBill: number;
  totalVat: number;
  serviceCharge: number;
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
  branch?: Types.ObjectId;
  deliveryMethod?: string;
  deliveryCharge?: number;
  deliveryAddress?: TDeliveryAddress;
  platform?: string;
  postedBy: Types.ObjectId;
  constructor(parameters: TOrder) {
    this.billNo = parameters?.billNo ?? "";
    this.date = new Date();
    if (parameters?.waiter) {
      this.waiter = parameters.waiter;
    }
    if (parameters?.tableName) {
      this.tableName = parameters.tableName;
    }
    this.items = parameters.items;
    this.guest = parameters?.guest ?? 0;
    this.sCharge = parameters?.sCharge ?? 0;
    this.vat = parameters?.vat ?? 0;
    this.percentDiscount = parameters?.percentDiscount ?? 0;
    this.discountAmount = parameters?.discountAmount ?? 0;
    this.totalBill = 0;
    this.totalVat = 0;
    this.serviceCharge = 0;
    this.totalDiscount = 0;
    this.netPayable = 0;
    this.pPaymentMode = parameters?.pPaymentMode;
    this.paid = parameters?.paid ?? 0;
    this.pPayment = parameters?.pPayment ?? 0;
    this.due = parameters?.due ?? 0;
    this.cashBack = 0;
    this.cashReceived = parameters?.cashReceived ?? 0;
    this.paymentMode = parameters?.paymentMode ?? "cash";
    this.remark = parameters?.remark;
    this.serviceChargeRate = parameters?.serviceChargeRate ?? 0;
    this.discountCard = parameters?.discountCard ?? "";
    this.customer = parameters?.customer;
    this.guestType = parameters?.guestType;
    this.platform = parameters?.platform;
    this.branch = parameters?.branch;
    if (parameters?.platform == ORDER_PLATFORM.ONLINE) {
      this.deliveryCharge = parameters?.deliveryCharge ?? 0;
      this.deliveryAddress = parameters?.deliveryAddress
        ?._id as unknown as TDeliveryAddress;
      this.deliveryMethod = parameters?.deliveryMethod;
    }
    this.postedBy = parameters?.postedBy;
  }

  async customerData() {
    //  1. Check customer type and set the customer Value
    if (this?.guestType == "registered" && this?.discountCard) {
      const doesExists = await Customer.findOne({
        discountCard: this?.discountCard,
      }).lean();

      if (doesExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid Customer data");
      }

      return this?.customer;
    }
  }
  async getItemsMapWithPrice() {
    if (!this.items.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No items found in order");
    }
    const itemMap = new Map();
    const itemIds: Types.ObjectId[] = [];
    this?.items?.forEach((item: IItems) => {
      itemMap.set(item.item.toString(), item);
      itemIds.push(new Types.ObjectId(item.item as unknown as string));
    });

    const aggregatedItems = await MenuItemConsumption.aggregate([
      {
        $match: {
          _id: {
            $in: itemIds,
          },
        },
      },
      {
        $project: {
          rate: 1,
          isDiscount: 1,
          isVat: 1,
          isWaiterTips: 1,
          discount: 1,
        },
      },
    ]);

    if (!aggregatedItems?.length) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to fetch item prices"
      );
    }

    aggregatedItems.forEach(
      (item: IMenuItemConsumption & { _id: Types.ObjectId }) => {
        const itemId = item?._id.toString();
        const itemFromMap = itemMap.get(item?._id);
        itemMap.get(itemId).rate = item.rate;
        itemMap.get(itemId).discount = item?.discount;
        this.totalBill += itemMap.get(itemId).qty * item?.rate;
      }
    );

    return itemMap;
  }

  async calculateDiscountAndVat() {
    const itemMap = await this.getItemsMapWithPrice();
    if (!itemMap.size) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to fetch items"
      );
    }

    let totalDiscount = 0;
    let totalVat = 0;

    itemMap.forEach((item: IItems) => {
      let discountFromPercent = 0;
      let discountFromCash = 0;
      const itemFromOrder = this.items.find(
        (Oitem) =>
          (Oitem.item.toString() as unknown as string) == item?.item?.toString()
      );

      if (
        itemFromOrder?.isDiscount &&
        (this.percentDiscount > 0 || item?.discount > 0)
      ) {
        if (item?.discount > 0) {
          discountFromPercent = (item?.rate * item.qty * item?.discount) / 100;
        } else {
          discountFromPercent =
            (item?.rate * item.qty * this.percentDiscount) / 100;
        }
      }

      if (this?.discountAmount > 0) {
        discountFromCash =
          (this.discountAmount / this.totalBill) * (item?.rate * item.qty);
      }

      if (this?.vat > 0 && itemFromOrder?.isVat) {
        const netPrice =
          item?.rate * item?.qty - discountFromCash - discountFromPercent;
        const vatAmount = (netPrice * this?.vat) / 100;
        totalVat += vatAmount;
      }
      totalDiscount += discountFromCash + discountFromPercent;
    });

    this.totalDiscount = Number(totalDiscount.toPrecision(2));
    this.totalVat = Number(totalVat.toPrecision(2));

    return {
      totalDiscount,
      totalVat,
    };
  }

  async calculateServiceCharge() {
    let serviceCharge = 0;
    if (this?.serviceChargeRate > 0) {
      serviceCharge = (this?.totalBill * this?.serviceChargeRate) / 100;
      this.serviceCharge = Number(serviceCharge.toPrecision(2));
    }

    return serviceCharge;
  }
  async getPostableData() {
    if (!this.billNo) {
      this.billNo = await generateOrderId(this.branch as unknown as string);
    }
    const vatAndDiscount = await this.calculateDiscountAndVat();
    const serviceCharge = await this.calculateServiceCharge();
    this.netPayable =
      this?.totalBill +
      this?.serviceCharge +
      this?.totalVat -
      this?.totalDiscount +
      (this?.deliveryCharge ?? 0);

    this.due = this.netPayable - this.paid - this.pPayment;
    const cashBack = this.cashReceived - this.paid - this.pPayment;
    this.cashBack = cashBack > 0 ? cashBack : 0;
    this.due = this.netPayable - this.paid - this.pPayment;

    return { ...this };
  }

  async foodArrayDiff(oldValue: (IItems & { item: Types.ObjectId })[]) {
    if (!oldValue.length) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Old order items cannot be empty"
      );
    }
    const oldValueMap = new Map(
      oldValue.map((item) => [item.item.toString(), item])
    );
    const newValueMap = new Map(
      this.items.map((item) => [item.item.toString(), item])
    );
    const diffValues: IItems[] = [];
    const decrementDiffValues: IItems[] = [];
    const deletedValues: IItems[] = [];
    newValueMap.forEach((value) => {
      if (!oldValueMap.has(value.item.toString())) {
        diffValues.push(value);
      } else {
        const oldValue = oldValueMap.get(value.item.toString());
        const newValue = newValueMap.get(value.item.toString());
        if (oldValue?.qty && newValue?.qty) {
          if (newValue?.qty > oldValue.qty) {
            const diffItem = {
              ...newValue,
              qty: newValue.qty - oldValue.qty,
            };

            diffValues.push(diffItem);
          }
          if (oldValue.qty < newValue.qty) {
            const decrementItem = {
              ...oldValue,
              qty: oldValue.qty - newValue.qty,
            };
            decrementDiffValues.push(decrementItem);
          }
        }
      }
    });

    return { diffValues, decrementDiffValues };
  }
}

export class orderCacheStorageHandler {
  billNo: string;
  date: Date;
  tableName?: TTable | Types.ObjectId;
  waiter?: TWaiter | Types.ObjectId;
  items: IItems[];
  guest: number;
  sCharge: number;
  vat: number;
  percentDiscount: number;
  discountAmount: number;
  totalBill: number;
  totalVat: number;
  serviceCharge: number;
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
  constructor(parameters: TOrder) {
    this.billNo = parameters?.billNo;
    this.date = parameters.date;
    if (parameters?.waiter) {
      this.waiter = parameters.waiter;
    }
    if (parameters?.tableName) {
      this.tableName = parameters.tableName;
    }
    this.items = parameters.items;
    this.guest = parameters?.guest ?? 0;
    this.sCharge = parameters?.sCharge ?? 0;
    this.vat = parameters?.vat ?? 0;
    this.percentDiscount = parameters?.percentDiscount ?? 0;
    this.discountAmount = parameters?.discountAmount ?? 0;
    this.totalBill = parameters?.totalBill ?? 0;
    this.totalVat = parameters?.totalVat ?? 0;
    this.serviceCharge = parameters?.serviceCharge ?? 0;
    this.totalDiscount = parameters?.totalDiscount ?? 0;
    this.netPayable = parameters?.netPayable ?? 0;
    this.pPaymentMode = parameters?.pPaymentMode;
    this.paid = parameters?.paid ?? 0;
    this.pPayment = parameters?.pPayment ?? 0;
    this.due = parameters?.due ?? 0;
    this.cashBack = parameters?.cashBack ?? 0;
    this.cashReceived = parameters?.cashReceived ?? 0;
    this.paymentMode = parameters?.paymentMode ?? "cash";
    this.remark = parameters?.remark;
    this.serviceChargeRate = parameters?.serviceChargeRate ?? 0;
    this.discountCard = parameters?.discountCard ?? "";
    this.customer = parameters?.customer;
    this.guestType = parameters?.guestType;
  }
}
