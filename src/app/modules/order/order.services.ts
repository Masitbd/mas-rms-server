/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query, Types, UpdateOneModel } from "mongoose";
import { cacheServer } from "../../../app";
import { generateOrderId } from "../../../utils/generateUniqueId";
import QueryBuilder from "../../builder/QueryBuilder";
import { orderDataValidator } from "./order.classes";
import {
  IActiveTable,
  IItems,
  IPopulatedOrderData,
  ORDER_STATUS,
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
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import {
  fetchOrderIfExists,
  handleKitchenOrders,
  updateCache,
  updateKitchenCache,
  updateOrderInDB,
} from "./order.helper";
import { IKitchenOrderData } from "../kitchenOrders/kitchenOrder.interface";
import { KitchenOrder } from "../kitchenOrders/kitchenOrder.model";

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
        waiter: waiter ? waiter.toObject() : "",
        orderId: result?._id.toString(),
      };

      cacheServer.set(tableName?._id?.toString(), tableData, 0);
    }
    // 2. for kitchen order
    const kitchenOrderNo = billNo + "001";
    const items = await result?.get("items");
    const currentKitchenOrder = cacheServer.get("kitchenOrderList") as string[];
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
    .paginate()
    .search(["billNo"])
    .filter();

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

const getActiveTableListDetails = async () => {
  const tables: string[] = cacheServer.get("activeTableList") as string[];
  if (tables && tables?.length > 0) {
    const result = cacheServer.mget(tables);
    return result;
  }
  return [];
};

const getKitchenOrderListForSingleBill = async (id: string) => {
  let result: any;
  if (cacheServer.has(id)) {
    const orderData: TOrderForCacheServer = cacheServer.get(
      id
    ) as TOrderForCacheServer;

    result = cacheServer.mget(orderData.kitchenOrders);
  }

  return result;
};

const updateOrder = async (id: string, order: TOrder) => {
  // 1. Data Source and data validator
  const doesOrderExist = await fetchOrderIfExists(id);
  const orderValidator = new orderDataValidator(order);
  const postableData = await orderValidator.getPostableData();
  const { diffValues: diffItems, decrementDiffValues } =
    await orderValidator.foodArrayDiff(
      doesOrderExist.items as (IItems & { item: Types.ObjectId })[]
    );

  // 2. handling kitchen OrderServices
  const { kitchenOrderId, kitchenOrders } = handleKitchenOrders(
    id,
    doesOrderExist,
    diffItems
  );

  // 3. Updating to db and cache server

  const result = await updateOrderInDB(id, postableData as unknown as TOrder);
  const updateCacheData = updateCache(
    id,
    result?.toObject() as TOrder,
    kitchenOrders
  );

  await updateKitchenCache(
    kitchenOrderId as string,
    result?.toObject() as IPopulatedOrderData,
    diffItems
  );

  return result;
};

const changeStatus = async (id: string, data: { status: ORDER_STATUS }) => {
  let updatedData;
  if (data.status == ORDER_STATUS.POSTED) {
    updatedData = await Order.findByIdAndUpdate(
      id,
      { status: data.status },
      { new: true }
    );
    if (updatedData?.status == data.status && cacheServer.has(id)) {
      const cachedData: TOrder & { kitchenOrders: string[] } = cacheServer.take(
        id
      ) as TOrder & { kitchenOrders: string[] };
      const kitchenOrderList: { [key: string]: IKitchenOrderData } =
        cacheServer.mget(cachedData?.kitchenOrders);
      if (kitchenOrderList) {
        const formatedData = Object.keys(kitchenOrderList).map((key) => {
          cacheServer.del(key);
          const data = {
            ...kitchenOrderList[key],
            status: "inactive",
          };
          return data;
        });
        await KitchenOrder.insertMany(formatedData);
      }

      // handling table data
      if (
        updatedData?.tableName &&
        cacheServer.has(updatedData?.tableName.toString())
      ) {
        cacheServer.del(updatedData.tableName.toString());
        const activeTableList: string[] = cacheServer.get(
          "activeTableList"
        ) as string[];
        const index = activeTableList.indexOf(updatedData.tableName.toString());
        if (index > -1) {
          activeTableList.splice(index, 1);
          cacheServer.set("activeTableList", activeTableList);
        }
      }

      // handling kitchenOrderList

      const listFormCache: string[] = cacheServer.get(
        "kitchenOrderList"
      ) as string[];
      if (listFormCache?.length) {
        cachedData.kitchenOrders.map((item: string) => {
          const index = listFormCache.indexOf(item);
          if (index > -1) {
            listFormCache.splice(index, 1);
          }
        });
      }
      cacheServer.set("kitchenOrderList", listFormCache);
    }
  }

  return await updatedData?.populate([
    { path: "customer" },
    { path: "items.item" },
    { path: "tableName" },
    { path: "waiter" },
  ]);
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOderFromDB,
  getSingleOrderForPatch,
  getActiveTableList,
  getKitchenOrderListForSingleBill,
  getActiveTableListDetails,
  updateOrder,
  changeStatus,
};
