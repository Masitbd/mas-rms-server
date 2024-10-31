import { generateTableId } from "../../../utils/generateUniqueId";
import { TTable } from "./table.interface";
import { Table } from "./table.model";

// ? create
const createTableIntoDB = async (payload: TTable) => {
  payload.tid = await generateTableId();
  // now save in db with tid
  const result = await Table.create(payload);
  return result;
};

//  getAll

const getAllTableListFromDB = async () => {
  const result = await Table.find();
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

// exports

export const TableServices = {
  createTableIntoDB,
  getAllTableListFromDB,
  getSingleTableFromDB,
  updateTableIntoDB,
};
