/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateOrderId } from "../../../utils/generateUniqueId";
import QueryBuilder from "../../builder/QueryBuilder";
import { TOrder } from "./order.interface";
import { Order } from "./order.model";

const createOrderIntoDB = async (payload: TOrder) => {
  payload.oid = await generateOrderId();
  const result = await Order.create(payload);
  return result;
};

//

const getAllOderFromDB = async (query: Record<string, any>) => {
  const oderQuery = new QueryBuilder(
    Order.find()
      .populate("RawMaterial")
      .populate("Customer")
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

export const OrderServices = {
  createOrderIntoDB,
  getAllOderFromDB,
};
