/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { generateItemCategoryId } from "../../../utils/generateUniqueId";
import { TItemCategory } from "./itemCategory.interface";
import { ItemCategroy } from "./itemCategory.model";
import { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";

const createItemCategoryIntoDB = async (
  payload: TItemCategory,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to table object
  }
  payload.uid = await generateItemCategoryId();

  //? now save payload into db with ItemCategory id

  const result = await ItemCategroy.create(payload);
  return result;
};

//  get all

const getAllItemCategoryIdFromDB = async (
  payload: any,
  loggedInUserInfo: JwtPayload
) => {
  const filterOption: Record<string, Types.ObjectId> = {};
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    filterOption.branch = loggedInUserInfo?.branch;
  }
  const isCondition = payload?.menuGroup
    ? { menuGroup: payload?.menuGroup }
    : {};
  console.log(filterOption);
  const result = await ItemCategroy.find({ $and: [filterOption, isCondition] })
    .populate("menuGroup", "name")
    .sort({ createdAt: -1 });
  return result;
};

//  update

const updateItemCategoryIntoDB = async (
  id: string,
  payload: Partial<TItemCategory>
) => {
  const result = await ItemCategroy.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

//  delete

const deleteItemCategoryIntoDB = async (id: string) => {
  const result = await ItemCategroy.findByIdAndDelete(id);
  return result;
};

export const ItemCategoryServices = {
  createItemCategoryIntoDB,
  getAllItemCategoryIdFromDB,
  updateItemCategoryIntoDB,
  deleteItemCategoryIntoDB,
};
