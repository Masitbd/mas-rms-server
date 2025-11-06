import { ICashMemoType } from "./cashMemoType.interface";
import { CashMemoType } from "./cashMemoType.model";

const createCashMemoType = async (
  payload: ICashMemoType
): Promise<ICashMemoType> => {
  const result = await CashMemoType.create(payload);
  return result;
};

const getAllCashMemoTypes = async (): Promise<ICashMemoType[]> => {
  return await CashMemoType.find({});
};

const getSingleCashMemoType = async (
  id: string
): Promise<ICashMemoType | null> => {
  return await CashMemoType.findById(id);
};

const updateCashMemoType = async (
  id: string,
  payload: Partial<ICashMemoType>
): Promise<ICashMemoType | null> => {
  await CashMemoType.deleteMany();
  return await CashMemoType.create(payload);
};

const deleteCashMemoType = async (
  id: string
): Promise<ICashMemoType | null> => {
  return await CashMemoType.findByIdAndDelete(id);
};

export const CashMemoTypeService = {
  createCashMemoType,
  getAllCashMemoTypes,
  getSingleCashMemoType,
  updateCashMemoType,
  deleteCashMemoType,
};
