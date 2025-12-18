import mongoose from "mongoose";
import { IUserResponse } from "../user/user.interface";

export const itemWiseSalesStatementPipelineProvider = ({
  branch,
  endDate,
  startDate,
}: {
  startDate: Date;
  endDate: Date;
  branch: string;
  user: IUserResponse;
}) => {
  if (branch) {
    return [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          ...(branch && { branch: new mongoose.Types.ObjectId(branch) }),
        },
      },
      {
        $project: {
          items: 1,
          branch: 1,
          billNo: 1,
        },
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "menuitemconsumptions",
          localField: "items.item",
          foreignField: "_id",
          as: "itemDetail",
        },
      },
      {
        $unwind: {
          path: "$itemDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          billNo: 1,
          branch: 1,
          "itemDetail.rate": 1,
          "itemDetail.itemGroup": 1,
          "itemDetail.itemCategory": 1,
          "itemDetail.itemName": 1,
          "itemDetail.itemCode": 1,
          items: 1,
        },
      },
      {
        $group: {
          _id: {
            _id: "$items.item",
            rate: "$items.rate",
          },
          qty: { $sum: "$items.qty" },
          branch: { $first: "$branch" },
          itemCategory: { $first: "$itemDetail.itemCategory" },
          itemName: { $first: "$itemDetail.itemName" },
          itemCode: { $first: "$itemDetail.itemCode" },
        },
      },
      {
        $lookup: {
          from: "itemcategroys",
          localField: "itemCategory",
          foreignField: "_id",
          as: "itemCategory",
        },
      },
      {
        $unwind: {
          path: "$itemCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          qty: 1,
          branch: 1,
          "itemCategory._id": 1,
          "itemCategory.uid": 1,
          "itemCategory.name": 1,
          "itemCategory.menuGroup": 1,
          itemName: 1,
          itemCode: 1,
        },
      },
      {
        $lookup: {
          from: "menugroups",
          localField: "itemCategory.menuGroup",
          foreignField: "_id",
          as: "menuGroup",
        },
      },
      {
        $unwind: {
          path: "$menuGroup",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "menuGroup.description": 0,
          "menuGroup.branch": 0,
          "menuGroup.createdAt": 0,
          "menuGroup.updatedAt": 0,
          "menuGroup.__v": 0,
          branch: 0,
        },
      },
      {
        $group: {
          _id: "$menuGroup._id",

          menuGroup: { $first: "$menuGroup.name" },

          items: {
            $push: {
              _id: "$_id._id", // itemId
              rate: "$_id.rate",
              qty: "$qty",
              itemCategory: "$itemCategory",
              itemName: "$itemName",
              itemCode: "$itemCode",
              branch: "$branch",
            },
          },
        },
      },
    ];
  }
};
