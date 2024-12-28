import { StatusCodes } from "http-status-codes";
import { generateCustomerId } from "../../../utils/generateUniqueId";
import AppError from "../../errors/AppError";
import { TCustomer } from "./customer.interface";
import { Customer } from "./customer.model";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";

// ? create
const createCustomerIntoDB = async (
  payload: TCustomer,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to table object
  }
  payload.cid = await generateCustomerId();
  // now save in db with tid
  const result = await Customer.create(payload);
  return result;
};

// ? get all
const getAllCustomerIntoDB = async (loggedInUserInfo: JwtPayload) => {
  const filterOption: Record<string, Types.ObjectId> = {};
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    filterOption.branch = loggedInUserInfo?.branch;
  }
  const result = await Customer.find(filterOption);
  return result;
};

//  get single
const getSingleCustomerIntoDB = async (id: string) => {
  const result = await Customer.findById(id);
  return result;
};

// ? update

const updateCustomerIntoDB = async (
  id: string,
  payload: Partial<TCustomer>
) => {
  const result = await Customer.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// ! delete

const deleteCustomerFromDB = async (id: string) => {
  const result = await Customer.findByIdAndDelete(id);
  return result;
};

const getCustomerByDiscountCode = async (discountCode: string) => {
  const result = await Customer.findOne({ discountCard: discountCode });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Customer not found");
  }
  return result;
};
export const CustomerSevices = {
  createCustomerIntoDB,
  getAllCustomerIntoDB,
  getSingleCustomerIntoDB,
  updateCustomerIntoDB,
  deleteCustomerFromDB,
  getCustomerByDiscountCode,
};
