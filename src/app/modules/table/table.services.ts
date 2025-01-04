import { JwtPayload } from "jsonwebtoken";
import { TTable } from "./table.interface";
import { Table } from "./table.model";
import { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";
import { generateTableId } from "../../../utils/generateUniqueId";
import { branchFilterOptionProvider } from "../../helpers/BranchFilterOpeionProvider";

// ? create
const createTableIntoDB = async (
  payload: TTable,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to table object
  }
  payload.tid = await generateTableId(); // deprecated by murad vai it will manual input

  // now save in db with tid
  const result = await Table.create(payload);
  return result;
};

//  getAll

const getAllTableListFromDB = async (loggedInUserInfo: JwtPayload) => {
  const filterOption = branchFilterOptionProvider(loggedInUserInfo);
  const result = await Table.find(filterOption).populate("branch");
  return result;
};

// get single table

const getSingleTableFromDB = async (id: string) => {
  const result = await Table.findById(id);
  return result;
};

//  update

const updateTableIntoDB = async (id: string, payload: Partial<TTable>) => {
  const result = await Table.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// ! delete

const deleteTableFromDB = async (id: string) => {
  const result = await Table.findByIdAndDelete(id);
  return result;
};

// exports

export const TableServices = {
  createTableIntoDB,
  getAllTableListFromDB,
  getSingleTableFromDB,
  updateTableIntoDB,
  deleteTableFromDB,
};
