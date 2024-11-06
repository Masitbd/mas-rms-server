import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { IRawMaterials } from "./rawMaterials.interface";
import RawMaterial from "./rawMaterials.model";

const post = async (params: IRawMaterials) => {
  const result = await RawMaterial.create(params);
  return result;
};

const patch = async (params: IRawMaterials) => {
  const { _id, ...updateParams } = params;

  const doesExists = await RawMaterial.exists({ _id: _id });

  if (!doesExists?._id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Item does not exists");
  }
  const result = await RawMaterial.findOneAndUpdate({ _id }, params, {
    new: true,
  });

  return result;
};

const remove = async (id: string) => {
  const doesExists = await RawMaterial.exists({ id: id });

  if (!doesExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Item does not exists");
  }
  await RawMaterial.findOneAndDelete({ id: id });
  return true;
};

const getAll = async () => {
  const result = await RawMaterial.find({});
  return result;
};

const getById = async (id: string) => {
  const result = await RawMaterial.findOne({ id: id });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Item not found");
  }
  return result;
};
export const RawMaterialService = { post, patch, remove, getAll, getById };
