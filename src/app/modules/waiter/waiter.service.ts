import { JwtPayload } from "jsonwebtoken";
import { generateWaiterId } from "../../../utils/generateUniqueId";
import { TWaiter } from "./waiter.interface";
import { Waiter } from "./waiter.model";
import { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";

const createWaiterIntoDB = async (
  payload: TWaiter,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to waiter object
  }
  payload.uid = await generateWaiterId();

  //? now save payload into db with Waiter id

  const result = await Waiter.create(payload);
  return result;
};

//  get all

const getAllWaiterIdFromDB = async (loggedInUserInfo: JwtPayload) => {
  const filterOption: Record<string, Types.ObjectId> = {};
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    filterOption.branch = loggedInUserInfo?.branch;
  }
  const result = await Waiter.find(filterOption).sort({ createdAt: -1 });
  return result;
};

//  update

const updateWaiterIntoDB = async (id: string, payload: Partial<TWaiter>) => {
  const result = await Waiter.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

//  delete

const deleteWaiterIntoDB = async (id: string) => {
  const result = await Waiter.findByIdAndDelete(id);
  return result;
};

export const WaiterServices = {
  createWaiterIntoDB,
  getAllWaiterIdFromDB,
  updateWaiterIntoDB,
  deleteWaiterIntoDB,
};
