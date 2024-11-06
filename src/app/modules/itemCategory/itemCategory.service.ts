import { generateItemCategoryId } from "../../../utils/generateUniqueId";
import { TItemCategory } from "./itemCategory.interface";
import { ItemCategroy } from "./itemCategory.model";

const createItemCategoryIntoDB = async (payload: TItemCategory) => {
  payload.uid = await generateItemCategoryId();

  //? now save payload into db with ItemCategory id

  const result = await ItemCategroy.create(payload);
  return result;
};

//  get all

const getAllItemCategoryIdFromDB = async () => {
  const result = await ItemCategroy.find()
    .populate("menuGroup", "name")
    .sort({ createdAt: -1 });
  return result;
};

//  update

const updateItemCategoryIntoDB = async (
  id: string,
  payload: Partial<TItemCategory>
) => {
  const result = await ItemCategroy.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

//  delete

const deleteItemCategoryIntoDB = async (id: string) => {
  const result = await ItemCategroy.findByIdAndDelete(id);
  return result;
};

export const ItemCategoryServices = {
  createItemCategoryIntoDB,
  getAllItemCategoryIdFromDB,
  updateItemCategoryIntoDB,
  deleteItemCategoryIntoDB,
};
