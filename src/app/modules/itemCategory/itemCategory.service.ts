/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { generateItemCategoryId } from "../../../utils/generateUniqueId";
import { TItemCategory } from "./itemCategory.interface";
import { ItemCategroy } from "./itemCategory.model";
import mongoose, { Types } from "mongoose";
import { ENUM_USER } from "../../enums/EnumUser";
import { branchFilterOptionProvider } from "../../helpers/BranchFilterOpeionProvider";
import MenuItemConsumption from "../rawMaterialConsumption/rawMaterialConsumption.model";

const createItemCategoryIntoDB = async (
  payload: TItemCategory,
  loggedInUserInfo: JwtPayload
) => {
  if (loggedInUserInfo?.branch) {
    payload.branch = loggedInUserInfo.branch; //? add branch id to table object
  }
  payload.uid = await generateItemCategoryId();

  //? now save payload into db with ItemCategory id

  const result = await ItemCategroy.create(payload);
  return result;
};

//  get all

const getAllItemCategoryIdFromDB = async (payload: any) => {
  const isCondition: Record<string, any> = payload?.menuGroup
    ? { menuGroup: payload?.menuGroup }
    : {};

  if (payload?.isPopular) {
    isCondition.isPopular = true;
  }
  const result = await ItemCategroy.find({ $and: [isCondition] })
    .populate("menuGroup", "name")
    .populate("branch")
    .populate("image")
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

//! get items by item category

const getItemsByItemCategoryFromDB = async (query: Record<string, any>) => {
  const {id , search}= query;
  const piplelineQuery = [
    ...(id
      ? [
          {
            $match: {
              itemCategory: new mongoose.Types.ObjectId(id),
            },
          },
        ]
      : []),

    ...(search
      ? [
          {
            $match: {
              itemName: { $regex: search, $options: "i" }, // Case-insensitive search
            },
          },
        ]
      : []),

    {
      $lookup: {
        from: "itemcategroys",
        localField: "itemCategory",
        foreignField: "_id",
        as: "itemCategorysDetails",
      },
    },
    {
      $unwind: {
        path: "$itemCategorysDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "images",
        localField: "images",
        foreignField: "_id",
        as: "images",
      },
    },
    {
      $unwind: {
        path: "$images",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          itemGroup: "$itemCategorysDetails.name",
        },
        items: {
          $push: {
            itemName: "$itemName",
            itemCode: "$itemCode",
            rate: "$rate",
            description: "$description",
            images: "$images",
            _id: "$_id",
            discount: "$discount",
            isDiscount: "$isDiscount",
            isVat: "$isVat",
          },
        },
      },
    },
    {
      $project: {
        itemCategoryName: "$_id.itemGroup", // Rename _id to itemCategoryName
        items: 1, // Include items array in the result
        _id: 0, // Exclude the default _id field
      },
    },
  ];

  const result = await MenuItemConsumption.aggregate(piplelineQuery);
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
  getItemsByItemCategoryFromDB,
  deleteItemCategoryIntoDB,
};
