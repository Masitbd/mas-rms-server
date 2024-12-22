import { generateBranchId } from "../../../utils/generateUniqueId";
import { TBranch } from "./branch.interface";
import { Branch } from "./branch.model";

const createBranchIntoDB = async (payload: TBranch) => {
  payload.bid = await generateBranchId();
  const result = await Branch.create(payload);
  return result;
};

// get all brach

const getAllBranchFromDB = async () => {
  const result = await Branch.find();
  return result;
};

//  get single

const getSingleBranchFromDB = async (id: string) => {
  const result = await Branch.findById(id);
  return result;
};

//  update

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// delete

const deleteBranchFromDB = async (id: string) => {
  const result = await Branch.findByIdAndDelete(id);
  return result;
};

export const BranchSerives = {
  createBranchIntoDB,
  getAllBranchFromDB,
  getSingleBranchFromDB,
  updateBranchIntoDB,
  deleteBranchFromDB,
};
