/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { cacheServer } from "../../../app";
import { generateOrderId } from "../../../utils/generateUniqueId";
import QueryBuilder from "../../builder/QueryBuilder";
import { orderDataValidator } from "./order.classes";
import {
  IActiveTable,
  IItems,
  TOrder,
  TOrderForCacheServer,
} from "./order.interface";
import {
  Order,
  OrderForRegisteredCustomer,
  OrderForUnregistered,
} from "./order.model";
import {
  IItemConsumption,
  IMenuItemConsumption,
} from "../rawMaterialConsumption/rawMaterialConsumption.interface";

const createOrderIntoDB = async (payload: TOrder) => {
  const orderValidatorInstance = new orderDataValidator(payload);
  const orderData = await orderValidatorInstance.getPostableData();
  let result;
  if (orderData?.guestType == "registered") {
    result = await OrderForRegisteredCustomer.create(orderData);
  } else {
    result = await OrderForUnregistered.create(orderData);
  }
  result = result = await result.populate([
    { path: "customer" },
    { path: "items.item" },
    { path: "tableName" },
    { path: "waiter" },
  ]);

  if (result?._id) {
    // 1. post active table
    const tableName = await result.get("tableName");
    const billNo = await result.get("billNo");
    const waiter = await result.get("waiter");

    if (tableName) {
      let activeTableList: string[] = [];
      if (cacheServer.has("activeTableList")) {
        activeTableList = cacheServer.get("activeTableList") as string[];

        if (Array.isArray(activeTableList) && tableName) {
          activeTableList.push(tableName?._id?.toString());
        }
      } else if (tableName) {
        activeTableList = [tableName?._id?.toString()];
      }
      cacheServer.set("activeTableList", activeTableList);

      const tableData: IActiveTable = {
        billNo: billNo,
        table: tableName.toObject(),
        waiter: waiter.toObject(),
      };

      cacheServer.set(tableName?._id?.toString(), tableData, 0);

      // 2. for kitchen order
      const kitchenOrderNo = billNo + "001";
      const items = await result?.get("items");
      const currentKitchenOrder = cacheServer.get(
        "kitchenOrderList"
      ) as string[];
      const kitchenOrderList: string[] = [];
      if (currentKitchenOrder) {
        kitchenOrderList.push(...currentKitchenOrder, kitchenOrderNo);
      } else {
        kitchenOrderList.push(kitchenOrderNo);
      }
      cacheServer.set("kitchenOrderList", kitchenOrderList);
      const kitchenOrderData = {
        items: items
          ?.toObject()
          .map((item: IItems & { item: IMenuItemConsumption }) => ({
            itemCode: item?.item?.itemCode,
            itemName: item?.item?.itemName,
            qty: item?.qty,
            rate: item?.rate,
          })),
        billNo: billNo,
        kitchenOrderNo: kitchenOrderNo,
        status: "active",
        remark: orderData?.remark,
        tableName: tableName?.toObject()?.name,
        waiterName: waiter?.toObject()?.name,
      };
      cacheServer.set(kitchenOrderNo, kitchenOrderData, 0);

      // 3. for cache order
      const cacheOrderData = {
        ...result.toObject(),
        kitchenOrders: [kitchenOrderNo],
      };
      cacheServer.set(result._id.toString(), cacheOrderData, 0);
    }
  }
  return result;
};

//

const getAllOderFromDB = async (query: Record<string, any>) => {
  const oderQuery = new QueryBuilder(
    Order.find()
      .populate("RawMaterial")
      .populate("customer")
      .populate("Table")
      .populate("Waiter"),
    query
  )
    .sort()
    .paginate();

  const result = await oderQuery.modelQuery;
  const meta = await oderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleOrderForPatch = async (id: string) => {
  const result = await Order.findById(id)
    .populate("items.item")
    .populate("customer");
  return result;
};
const getActiveTableList = async () => {
  const result = cacheServer.get("activeTableList");
  return result;
};

const getKitchenOrderListForSingleBill = async (id: string) => {
  let result;
  if (cacheServer.has(id)) {
    const orderData: TOrderForCacheServer = cacheServer.get(
      id
    ) as TOrderForCacheServer;

    result = cacheServer.mget(orderData.kitchenOrders);
    console.log(result);
  }

  return result;
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOderFromDB,
  getSingleOrderForPatch,
  getActiveTableList,
  getKitchenOrderListForSingleBill,
};
