import { Types } from "mongoose";
import { TDeliveryAddress } from "./deliveryAddresses.interface";
import { DeliveryAddress } from "./deliveryAddresses.model";

const post = async (payload: TDeliveryAddress) => {
  const doesExists = await DeliveryAddress.findOne({
    userId: new Types.ObjectId(payload.userId),
  });
  if (!doesExists) {
    payload.isDefault = true;
  }
  return await DeliveryAddress.create(payload);
};

const patch = async (payload: TDeliveryAddress, id: string) => {
  if (payload.isDefault) {
    await DeliveryAddress.updateMany(
      { userId: new Types.ObjectId(payload.userId) },
      { isDefault: false }
    );
  }

  return await DeliveryAddress.findByIdAndUpdate(id, payload, { new: true });
};

const remove = async (id: string) => {
  return await DeliveryAddress.findByIdAndDelete(id);
};

const getAll = async (userId: string) => {
  return await DeliveryAddress.find({ userId: new Types.ObjectId(userId) });
};

const getSingle = async (id: string) => {
  return await DeliveryAddress.findById(id);
};

const getDefaultDeliveryAddress = async (id: string) => {
  return await DeliveryAddress.findOne({
    userId: new Types.ObjectId(id),
    isDefault: true,
  });
};
export const DeliveryAddressServices = {
  post,
  patch,
  remove,
  getAll,
  getSingle,
  getDefaultDeliveryAddress,
};
