import { JwtPayload } from "jsonwebtoken";
import { generateMenuGroupId } from "../../../utils/generateUniqueId";
import { TMenuGroup } from "./menuGroup.interface";
import { MenuGroup } from "./menuGroup.model";
import { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";
import { branchFilterOptionProvider } from "../../helpers/BranchFilterOpeionProvider";

const createMenuGroupIntoDB = async (
  payload: TMenuGroup,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to menugroup object
  }
  payload.uid = await generateMenuGroupId();

  //? now save payload into db with menugroup id

  const result = await MenuGroup.create(payload);
  return result;
};

//  get all

const getAllMenuGroupIdFromDB = async (loggedInUserInfo: JwtPayload) => {
  const filterOption = branchFilterOptionProvider(loggedInUserInfo);
  const result = await MenuGroup.find(filterOption)
    .sort({ createdAt: -1 })
    .populate("branch");
  return result;
};

//  update

const updateMenuGroupIntoDB = async (
  id: string,
  payload: Partial<TMenuGroup>
) => {
  const result = await MenuGroup.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

//  delete

const deleteMenuGroupIntoDB = async (id: string) => {
  const result = await MenuGroup.findByIdAndDelete(id);
  return result;
};

export const MenuGroupServices = {
  createMenuGroupIntoDB,
  getAllMenuGroupIdFromDB,
  updateMenuGroupIntoDB,
  deleteMenuGroupIntoDB,
};
