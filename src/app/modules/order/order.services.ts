/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Mongoose, Query, Types, UpdateOneModel } from "mongoose";
import { cacheServer } from "../../../app";
import { generateOrderId } from "../../../utils/generateUniqueId";
import QueryBuilder from "../../builder/QueryBuilder";
import { orderDataValidator } from "./order.classes";
import {
  IActiveTable,
  IItems,
  IPopulatedOrderData,
  ORDER_PLATFORM,
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
import { Jwt, JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../../enums/EnumUser";
import { ENUM_ORDER_STATUS } from "../../enums/EnumOrderStatus";
import { DueCollection } from "../dewCollection/dueCollection.model";
import { Branch } from "../branch/branch.model";
import { Customer } from "../customer/customer.model";
import { ICancellationRequest } from "../orderCancellationRequest/orderCancellation.interface";
import { OrderCancellation } from "../orderCancellationRequest/orderCancellation.model";
import { ENUM_CANCELLATION_STATUS } from "../../enums/EnumCalcellationStatus";

const createOrderIntoDB = async (payload: TOrder, loggedInuser: JwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Checking if the order is online or offine
    if (!loggedInuser?.branch && payload?.platform !== ORDER_PLATFORM.ONLINE) {
      // add branch id to order
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "You are not permitted to create order"
      );
    }

    // 2. IF offline setting the branch infor
    if (payload.platform == ORDER_PLATFORM.OFFLINE) {
      payload.branch = loggedInuser?.branch;
      const doesBranchExists = await Branch.findById(loggedInuser?.branch);
      if (!doesBranchExists) {
        throw new AppError(StatusCodes.FORBIDDEN, "Branch not found");
      }
    }

    // Checking if table is occupied
    if (payload?.tableName && payload.platform == ORDER_PLATFORM.OFFLINE) {
      const isOccupied = await isTableOccupied(
        payload?.tableName as unknown as string,
        loggedInuser?.branch
      );
      if (isOccupied) {
        throw new AppError(StatusCodes.CONFLICT, "Table is already occupied");
      }
    }

    // setting the posted by field
    if (loggedInuser?.id) {
      payload.postedBy = loggedInuser?.id;
    } else {
      throw new AppError(400, "No user info found");
    }

    // 4. If order is online than setting the customer data
    if (payload?.platform == ORDER_PLATFORM.ONLINE) {
      const customerInfo = await Customer.findOne({
        email: loggedInuser?.email,
      }).select("_id");
      if (!customerInfo) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid customer data");
      }
      payload.customer = customerInfo._id;
      payload.guestType = "registered";

      // 5. finding the branch and setting it

      const branch = await Branch.find({
        division: payload?.deliveryAddress?.division,
        city: payload?.deliveryAddress?.city,
        deliveryLocations: payload?.deliveryAddress?.zone,
      });

      if (!branch?.length) {
        throw new AppError(StatusCodes.FORBIDDEN, "No Nearby  Branch  found");
      }
      payload.branch = branch[0]._id;
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

    if (orderData?.paid > 0) {
      await DueCollection.create({
        amount: orderData.paid,
        method: orderData?.paymentMode,
        orderId: result?._id,
        postedBy: loggedInuser?.uuid,
      });
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
    {
      path: "deliveryAddress",
    },
  ]);
  return result;
};

const dueCollection = async (
  id: string,
  data: { amount: number; method: string; remark?: string },
  loggedInUser: JwtPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const doesOrderExist = await Order.findById(id).session(session);

    if (data?.amount < 0 || data?.amount > (doesOrderExist?.due as number)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid Amount");
    }

    const updatedData = await Order.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        due: Number(doesOrderExist?.due) - Number(data.amount),
        paid: Number(doesOrderExist?.paid) + Number(data.amount),
      },
      { new: true, session }
    );

    await DueCollection.create(
      [{ ...data, postedBy: loggedInUser.uuid, orderId: doesOrderExist?._id }],
      {
        session,
      }
    );

    await session.commitTransaction();
    return Order.findById(id)
      .populate("items.item")
      .populate("customer")
      .populate("branch");
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error as string);
  }
};

const getDueCollectionHistory = async (id: string) => {
  const result = await DueCollection.aggregate([
    {
      $match: {
        orderId: new Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "profiles",
        localField: "postedBy",
        foreignField: "uuid",
        as: "postedBy",
      },
    },
    {
      $unwind: "$postedBy",
    },
    {
      $project: {
        _id: 1,
        billNo: 1,
        amount: 1,
        method: 1,
        remark: 1,
        postedBy: {
          name: "$postedBy.name",
          uuid: "$postedBy.uuid",
        },
        createdAt: 1,
      },
    },
  ]);
  return result;
};

const getUserOrder = async (userId: string) => {
  const result = await Order.find({
    postedBy: new Types.ObjectId(userId),
  }).populate([
    { path: "customer" },
    { path: "items.item" },
    { path: "deliveryAddress" },
  ]);

  return result;
};

const postCancellationRequest = async (
  loggedInUser: JwtPayload,
  payload: ICancellationRequest
) => {
  const doesCancellationRequestExists = await OrderCancellation.find({
    orderId: new Types.ObjectId(payload.orderId),
  });
  if (doesCancellationRequestExists.length) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Cancellation request already exists"
    );
  }
  const doesExists = await Order.findById(payload.orderId);

  if (!doesExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "NO order found");
  }

  if (doesExists.status === ORDER_STATUS.VOID) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Order is already cancelled");
  }

  if (doesExists.status === ORDER_STATUS.POSTED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Order is already posted");
  }
  const data: ICancellationRequest = {
    orderId: payload.orderId,
    status: ENUM_CANCELLATION_STATUS.PENDING,
    reason: payload.reason,
    postedBy: loggedInUser.id,
    ...(payload?.reason && payload?.description && payload?.reason == "other"
      ? { description: payload?.description }
      : {}),
    ...(payload?.refundOption ? { refundOption: payload?.refundOption } : {}),
    branch: doesExists.branch,
  };

  return await OrderCancellation.create(data);
};

const getAllCancellationRequest = async (
  loggedInUser: JwtPayload,
  query: Record<string, any>
) => {
  let oderQuery;
  if (
    loggedInUser?.role !== ENUM_USER.SUPER_ADMIN ||
    loggedInUser.role !== ENUM_USER.ADMIN
  ) {
    oderQuery = new QueryBuilder(
      OrderCancellation.find({})
        .populate("orderId")
        .populate("orderId.customer"),
      query
    )
      .sort()
      .paginate()
      .filter();
  }

  if (loggedInUser?.role == ENUM_USER.USER) {
    console.log("user");
    oderQuery = new QueryBuilder(
      OrderCancellation.find({
        postedBy: new Types.ObjectId(loggedInUser?.id),
      }).populate("orderId"),
      query
    )
      .sort()
      .paginate()
      .search(["billNo"])
      .filter();
  }
  if (
    loggedInUser?.role !== ENUM_USER.SUPER_ADMIN &&
    loggedInUser.role !== ENUM_USER.ADMIN &&
    loggedInUser.role !== ENUM_USER.USER
  ) {
    oderQuery = new QueryBuilder(
      OrderCancellation.find({
        branch: new Types.ObjectId(loggedInUser?.branch),
      }).populate("orderId"),
      query
    )
      .sort()
      .paginate()
      .search(["billNo"])
      .filter();
  }

  const result = await oderQuery?.modelQuery;
  const meta = await oderQuery?.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleCancellation = async (orderId: string) => {
  return await OrderCancellation.find({
    orderId: new Types.ObjectId(orderId),
  })
    .populate("orderId")
    .populate("approvedBy")
    .populate("postedBy");
};

const approveCancellationRequest = async (
  id: string,
  loggedInUser: JwtPayload,
  payload: { adminNote: string }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cancellationRequest = await OrderCancellation.findByIdAndUpdate(
      id,
      {
        status: ENUM_CANCELLATION_STATUS.APPROVED,
        approvedBy: loggedInUser?.id,
        ...payload,
      },
      { new: true, session }
    );

    console.log(cancellationRequest);

    if (
      cancellationRequest &&
      cancellationRequest.status === ENUM_CANCELLATION_STATUS.APPROVED
    ) {
      const order = await Order.findByIdAndUpdate(
        cancellationRequest.orderId,
        { status: ORDER_STATUS.VOID, approvedBy: loggedInUser.id },
        { new: true, session }
      );
      if (!order) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to update order status"
        );
      }
    }
    await session.commitTransaction();
    return cancellationRequest;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error as string);
  } finally {
    session.endSession();
  }
};

const rejectCancellationRequest = async (
  id: string,
  loggedInUser: JwtPayload,
  payload: { adminNote: string }
) => {
  return await OrderCancellation.findByIdAndUpdate(
    id,
    {
      status: ENUM_CANCELLATION_STATUS.REJECTED,
      approvedBy: loggedInUser.id,
      ...payload,
    },
    { new: true }
  );
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
  dueCollection,
  getDueCollectionHistory,
  getUserOrder,
  postCancellationRequest,
  getAllCancellationRequest,
  getSingleCancellation,
  approveCancellationRequest,
  rejectCancellationRequest,
};
