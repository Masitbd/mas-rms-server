import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Order } from "./order.model";
import { cacheServer } from "../../../app";
import { IItems, TOrder, TOrderForCacheServer } from "./order.interface";
import { IMenuItemConsumption } from "../rawMaterialConsumption/rawMaterialConsumption.interface";
import { TTable } from "../table/table.interface";
import { TWaiter } from "../waiter/waiter.interface";
import mongoose from "mongoose";
import { ENUM_ORDER_STATUS } from "../../enums/EnumOrderStatus";

export const fetchOrderIfExists = async (id: string) => {
  const order = await Order.findById(id);
  if (order) {
    return order;
  }
  throw new AppError(StatusCodes.BAD_REQUEST, "Invalid order Id");
};

export const handleKitchenOrders = (
  id: string,
  existingOrder: TOrder,
  diffItems: IItems[]
) => {
  let kitchenOrders: string[] = [];
  let kitchenOrderId: string | null = null;
  const orderCacheData = cacheServer.get(id) as TOrderForCacheServer;
  const kitchenOrderList =
    (cacheServer.get("kitchenOrderList") as string[]) ?? [];

  if (diffItems.length > 0) {
    const lastOrderId =
      orderCacheData?.kitchenOrders?.[orderCacheData.kitchenOrders.length - 1];
    kitchenOrderId = generateKitchenOrderId(existingOrder.billNo, lastOrderId);

    kitchenOrders = [...(orderCacheData?.kitchenOrders ?? []), kitchenOrderId];
    kitchenOrderList.push(kitchenOrderId);

    cacheServer.set("kitchenOrderList", kitchenOrderList, 0);
  } else {
    kitchenOrders = orderCacheData?.kitchenOrders;
  }

  return { kitchenOrders, kitchenOrderId };
};

export const generateKitchenOrderId = (
  billNo: string,
  lastOrderId?: string
) => {
  const nextOrderNumber = lastOrderId ? Number(lastOrderId.slice(-3)) + 1 : 1;
  return billNo + nextOrderNumber.toString().padStart(3, "0");
};

export const updateOrderInDB = async (id: string, postableData: TOrder) => {
  return await Order.findOneAndUpdate(
    { _id: id },
    { ...postableData },
    { new: true, populate: ["tableName", "waiter", "items.item"] }
  );
};

export const updateCache = (
  id: string,
  updatedOrder: TOrder,
  kitchenOrders: string[]
) => {
  const orderForCache: TOrderForCacheServer = {
    ...updatedOrder,
    kitchenOrders,
  };

  cacheServer.set(id, orderForCache, 0);
};

export const updateKitchenCache = async (
  kitchenOrderId: string,
  updatedOrder: TOrder & {
    tableName: TTable;
    waiter: TWaiter;
    items: (IItems & { item: IMenuItemConsumption })[];
  },
  diffItems: IItems[]
) => {
  if (!diffItems.length) {
    return;
  }
  const newKitchenOrderData = {
    items: diffItems.map((rawItem: IItems) => {
      const populatedItem = updatedOrder.items.find(
        (item: IItems & { item: IMenuItemConsumption }) =>
          item.item._id?.toString() == rawItem.item?.toString()
      );

      return {
        itemCode: populatedItem?.item?.itemCode,
        itemName: populatedItem?.item?.itemName,
        qty: rawItem?.qty,
        rate: populatedItem?.rate,
      };
    }),
    billNo: updatedOrder.billNo,
    kitchenOrderNo: kitchenOrderId,
    status: "active",
    remark: updatedOrder?.remark,
    tableName: updatedOrder?.tableName?.name,
    waiterName: updatedOrder?.waiter?.name,
  };
  cacheServer.set(kitchenOrderId, newKitchenOrderData);
};

// const updateDecrementKitchenItem = (
//   id: string,
//   decrementItem: IItems[],
//   updatedOrder: IPopulatedOrderData
// ) => {
//   const order = cacheServer.get(id);
//   if (order && decrementItem.length) {
//   }
// };

export const isTableOccupied = async (tableId: string, branch: string) => {
  const order = await Order.findOne({
    tableName: new mongoose.Types.ObjectId(tableId),
    branch: new mongoose.Types.ObjectId(branch),
    status: ENUM_ORDER_STATUS.NOT_POSTED,
  });
  return !!order;
};
