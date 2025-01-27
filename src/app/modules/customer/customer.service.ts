import { StatusCodes } from "http-status-codes";
import { generateCustomerId } from "../../../utils/generateUniqueId";
import AppError from "../../errors/AppError";
import { TCustomer } from "./customer.interface";
import { Customer } from "./customer.model";
import { JwtPayload } from "jsonwebtoken";
import { branchFilterOptionProvider } from "../../helpers/BranchFilterOpeionProvider";

// ? create
const createCustomerIntoDB = async (payload: TCustomer) => {
  payload.cid = await generateCustomerId();
  // now save in db with tid
  const result = await Customer.create(payload);
  return result;
};

// ? get all
const getAllCustomerIntoDB = async (loggedInUserInfo: JwtPayload) => {
  const result = await Customer.find();
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
