import { generateMenuGroupId } from "../../../utils/generateUniqueId";
import { TMenuGroup } from "./menuGroup.interface";
import { MenuGroup } from "./menuGroup.model";

const createMenuGroupIntoDB = async (payload: TMenuGroup) => {
  payload.uid = await generateMenuGroupId();

  //? now save payload into db with menugroup id

  const result = await MenuGroup.create(payload);
  return result;
};

//  get all

const getAllMenuGroupIdFromDB = async () => {
  const result = await MenuGroup.find().sort({ createdAt: -1 });
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
