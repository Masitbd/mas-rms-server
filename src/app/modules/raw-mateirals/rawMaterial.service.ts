import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { IRawMaterials } from "./rawMaterials.interface";
import RawMaterial from "./rawMaterials.model";
import { JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../../enums/EnumUser";
import { Types } from "mongoose";
import { generateUniqueId } from "../../../utils/generateUniqueId";

const post = async (params: IRawMaterials, loggedInUserInfo: JwtPayload) => {
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    params.branch = loggedInUserInfo?.branch;
  }

  const newId = await generateUniqueId<IRawMaterials>(
    RawMaterial,
    "M",
    3,
    "id"
  );
  params.id = newId;
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

const getAll = async (loggedInUserInfo: JwtPayload) => {
  const filterOption: Record<string, Types.ObjectId> = {};
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    filterOption.branch = loggedInUserInfo?.branch;
  }
  const result = await RawMaterial.find(filterOption);
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
