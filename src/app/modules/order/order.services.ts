/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Query, Types, UpdateOneModel } from "mongoose";
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
  isTableOccupied,
  updateCache,
  updateKitchenCache,
  updateOrderInDB,
} from "./order.helper";
import { IKitchenOrderData } from "../kitchenOrders/kitchenOrder.interface";
import { KitchenOrder } from "../kitchenOrders/kitchenOrder.model";
import { JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../../enums/EnumUser";
import { ENUM_ORDER_STATUS } from "../../enums/EnumOrderStatus";

const createOrderIntoDB = async (payload: TOrder, loggedInuser: JwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!loggedInuser?.branch) {
      // add branch id to order
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "You are not permitted to create order"
      );
    }
    payload.branch = loggedInuser?.branch;

    // Checking if table is occupied
    if (payload?.tableName) {
      const isOccupied = await isTableOccupied(
        payload?.tableName as unknown as string,
        loggedInuser?.branch
      );
      if (isOccupied) {
        throw new AppError(StatusCodes.CONFLICT, "Table is already occupied");
      }
    }
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
      {
        path: "branch",
      },
    ]);

    if (result?._id) {
      const billNo = await result.get("billNo");
      const tableName = await result.get("tableName");
      const waiter = await result.get("waiter");

      // 2. for kitchen order
      const kitchenOrderNo = billNo + "001";
      const items = await result?.get("items");

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
        orderId: result._id,
      };

      (await KitchenOrder.create(kitchenOrderData)).$session(session);
    }
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error as string);
  }
};

//

const getAllOderFromDB = async (
  query: Record<string, any>,
  loggedInUser: JwtPayload
) => {
  if (
    loggedInUser.role !== ENUM_USER.ADMIN &&
    loggedInUser.role !== ENUM_USER.SUPER_ADMIN
  ) {
    query.branch = loggedInUser?.branch;
  }

  const oderQuery = new QueryBuilder(
    Order.find()
      .populate("RawMaterial")
      .populate("customer")
      .populate("Table")
      .populate("Waiter")
      .populate("branch"),
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
    .populate("customer")
    .populate("branch");
  return result;
};
const getActiveTableList = async (loggedInUser: JwtPayload) => {
  const orders = await Order.find({
    branch: loggedInUser?.branch,
    status: ENUM_ORDER_STATUS.NOT_POSTED,
    tableName: { $exists: true },
  }).select(["tableName"]);

  return orders?.length ? orders?.map((O) => O?.tableName.toString()) : [];
};

const getActiveTableListDetails = async (loggedInUser: JwtPayload) => {
  if (!loggedInUser?.branch) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You are not permitted to access the table list"
    );
  }
  const tables = await Order.find({
    branch: loggedInUser?.branch,
    status: ENUM_ORDER_STATUS.NOT_POSTED,
    tableName: { $exists: true },
  })
    .select(["billNo", "tableName", "waiter", "_id"])
    .populate(["tableName", "waiter"]);

  return tables;
};

const getKitchenOrderListForSingleBill = async (id: string) => {
  const result = await KitchenOrder.find({ orderId: new Types.ObjectId(id) });
  return result;
};

const updateOrder = async (id: string, order: TOrder) => {
  // 1. Data Source and data validator
  const doesOrderExist = await fetchOrderIfExists(id);
  order.billNo = doesOrderExist?.billNo;
  const orderValidator = new orderDataValidator(order);
  const postableData = await orderValidator.getPostableData();
  const { diffValues: diffItems, decrementDiffValues } =
    await orderValidator.foodArrayDiff(
      doesOrderExist.items as (IItems & { item: Types.ObjectId })[]
    );

  // 2. handling kitchen OrderServices
  const { kitchenOrderId } = await handleKitchenOrders(
    id,
    doesOrderExist,
    diffItems
  );

  // 3. Updating to db and cache server

  const result = await updateOrderInDB(id, postableData as unknown as TOrder);
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
  }

  return await updatedData?.populate([
    { path: "customer" },
    { path: "items.item" },
    { path: "tableName" },
    { path: "waiter" },
  ]);
};

const getSIngleOrderWithPopulate = async (id: string) => {
  const result = await Order.findById(id).populate([
    { path: "customer" },
    { path: "items.item" },
    { path: "tableName" },
    { path: "waiter" },
    {
      path: "branch",
    },
  ]);
  return result;
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
  getSIngleOrderWithPopulate,
};
