import { generateWaiterId } from "../../../utils/generateUniqueId";
import { TWaiter } from "./waiter.interface";
import { Waiter } from "./waiter.model";

const createWaiterIntoDB = async (payload: TWaiter) => {
  payload.uid = await generateWaiterId();

  //? now save payload into db with Waiter id

  const result = await Waiter.create(payload);
  return result;
};

//  get all

const getAllWaiterIdFromDB = async () => {
  const result = await Waiter.find().sort({ createdAt: -1 });
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
