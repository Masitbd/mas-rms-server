/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { PipelineStage } from "mongoose";
import { Order } from "../order/order.model";

import MenuItemConsumption from "../rawMaterialConsumption/rawMaterialConsumption.model";
import { KitchenOrder } from "../kitchenOrders/kitchenOrder.model";
import { Branch } from "../branch/branch.model";
import { DateFormatter } from "../../../utils/dateProvider";
import { itemWiseSalesStatementPipelineProvider } from "./report.helper";
import { ENUM_USER } from "../../enums/EnumUser";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const getDailyStatementFromDB = async (
  payload: Record<string, any>,
  user: any,
) => {
  // Default to current date if no startDate and endDate are provided
  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : new Date();
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const branch = user?.branch || payload.branch;
  const branchInfo = await Branch.findById(branch);

  const query: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        branch: new mongoose.Types.ObjectId(branch),
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "tables",
        localField: "tableName",
        foreignField: "_id",
        as: "tableDetails",
      },
    },
    {
      $unwind: {
        path: "$tableDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          paymentType: {
            $cond: {
              if: { $gt: ["$due", 0] },
              then: "Due",
              else: "Paid",
            },
          },
          timePeriod: {
            $cond: {
              if: {
                $and: [
                  { $gte: [{ $hour: "$createdAt" }, 7] },
                  { $lt: [{ $hour: "$createdAt" }, 17] },
                ],
              },
              then: "Lunch",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $gte: [{ $hour: "$createdAt" }, 17] },
                      { $lt: [{ $hour: "$createdAt" }, 23] },
                    ],
                  },
                  then: "Dinner",
                  else: "Other",
                },
              },
            },
          },
        },
        branchDetails: { $first: "$branchDetails" },
        records: {
          $push: {
            billNo: "$billNo",
            table: "$tableDetails.name",
            guest: "$guest",
            pMode: "$paymentMode",
            totalBill: "$totalBill",
            totalVat: "$totalVat",
            totalScharge: "$serviceCharge",
            discount: "$totalDiscount",
            pPayment: "$pPayment",
            metPayable: "$netPayable",
            due: "$due",
            paid: "$paid",
            date: "$createdAt",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          groupDate: "$_id.groupDate",
          paymentType: "$_id.paymentType",
        },
        timePeriods: {
          $push: {
            timePeriod: "$_id.timePeriod",
            records: "$records",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.groupDate",
        paymentGroups: {
          $push: {
            paymentType: "$_id.paymentType",
            timePeriods: "$timePeriods",
          },
        },
        branchDetails: { $first: "$branchDetails" },
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: "$_id",
        paymentGroups: 1,
        branchDetails: 1,
      },
    },
    {
      $sort: { groupDate: -1 },
    },
  ];

  const result = await Order.aggregate(query);
  return { branchInfo, result };
};

// ? daily sales statement summery

const getDailySalesStatementSummeryFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

  const branch = user?.branch || query.branch;

  let branchInfo = null;

  if (branch) {
    branchInfo = await Branch.findById(branch);
  }

  const queryParams: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branch ? { branch: new mongoose.Types.ObjectId(branch) } : {}),
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $facet: {
        ...(user.role === "super-admin" && !branch
          ? {
              // Group by branch for super-admin without branch
              dateWiseSummary: [
                {
                  $group: {
                    _id: {
                      branch: "$branch",
                      date: {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$createdAt",
                        },
                      },
                    },
                    branchName: { $first: "$branchDetails.name" },
                    totalBill: { $sum: "$totalBill" },
                    totalVat: { $sum: "$totalVat" },
                    totalGuest: { $sum: "$guest" },
                    totalDiscount: { $sum: "$totalDiscount" },
                    totalScharge: { $sum: "$serviceCharge" },
                    totalPayable: { $sum: "$netPayable" },
                    totalDue: { $sum: "$due" },
                    totalPaid: { $sum: "$paid" },
                  },
                },
                { $sort: { branchName: 1 } }, // Sort branches by name
              ],
              paymentModeSummary: [
                {
                  $group: {
                    _id: "$paymentMode",
                    total: { $sum: "$totalBill" },
                  },
                },
              ],
              total: [
                {
                  $group: {
                    _id: null,
                    grandTotalBill: { $sum: "$totalBill" },
                    grandTotalVat: { $sum: "$totalVat" },
                    grandTotalGuest: { $sum: "$guest" },
                    grandTotalDiscount: { $sum: "$totalDiscount" },
                    grandTotalScharge: { $sum: "$serviceCharge" },
                    grandTotalPayable: { $sum: "$netPayable" },
                    grandTotalDue: { $sum: "$due" },
                    grandTotalPaid: { $sum: "$paid" },
                  },
                },
              ],
            }
          : {
              dateWiseSummary: [
                {
                  $group: {
                    _id: {
                      date: {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$createdAt",
                        },
                      },
                      branch: "$branch",
                    },
                    branchName: { $first: "$branchDetails.name" },
                    totalBill: { $sum: "$totalBill" },
                    totalVat: { $sum: "$totalVat" },
                    totalGuest: { $sum: "$guest" },
                    totalDiscount: { $sum: "$totalDiscount" },
                    totalScharge: { $sum: "$serviceCharge" },
                    totalPayable: { $sum: "$netPayable" },
                    totalDue: { $sum: "$due" },
                    totalPaid: { $sum: "$paid" },
                  },
                },
                { $sort: { "_id.date": 1 } },
              ],
              paymentModeSummary: [
                {
                  $group: {
                    _id: "$paymentMode",
                    total: { $sum: "$totalBill" },
                  },
                },
              ],
              total: [
                {
                  $group: {
                    _id: null,
                    grandTotalBill: { $sum: "$totalBill" },
                    grandTotalVat: { $sum: "$totalVat" },
                    grandTotalGuest: { $sum: "$guest" },
                    grandTotalDiscount: { $sum: "$totalDiscount" },
                    grandTotalScharge: { $sum: "$serviceCharge" },
                    grandTotalPayable: { $sum: "$netPayable" },
                    grandTotalDue: { $sum: "$due" },
                    grandTotalPaid: { $sum: "$paid" },
                  },
                },
              ],
            }),
      },
    },
    {
      $project: {
        ...(user.role === "super-admin" && !branch
          ? {
              dateWiseSummary: 1,
              paymentModeSummary: 1,
              total: { $arrayElemAt: ["$total", 0] },
            }
          : {
              dateWiseSummary: 1,
              paymentModeSummary: 1,
              total: { $arrayElemAt: ["$total", 0] },
            }),
        branchDetails: 1,
      },
    },
  ];

  const result = await Order.aggregate(queryParams);
  return { branchInfo, result };
};

// ! item wise sales satement

const getItemWiseSalesSatetementFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const branch = user?.branch || query.branch;

  let branchInfo = branch ? await Branch.findById(branch) : null;

  const pipelineAggregate: PipelineStage[] = [
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
        as: "itemDetails",
      },
    },
    {
      $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "itemcategroys",
        localField: "itemDetails.itemCategory",
        foreignField: "_id",
        as: "itemGroupDetails",
      },
    },
    {
      $unwind: { path: "$itemGroupDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "menugroups",
        localField: "itemGroupDetails.menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: { path: "$menuGroupDetails", preserveNullAndEmptyArrays: true },
    },
    ...(user?.role === "super-admin" && !branch
      ? [
          {
            $group: {
              _id: "$branch", // Group by branch
              branchData: { $push: "$$ROOT" }, // Preserve all documents under each branch
            },
          },
          {
            $lookup: {
              from: "branches",
              localField: "_id",
              foreignField: "_id",
              as: "branchDetails",
            },
          },
          {
            $unwind: {
              path: "$branchDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$branchData", // Unwind original documents
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  "$branchData",
                  { branchDetails: "$branchDetails" },
                ],
              },
            },
          },
        ]
      : []),
    {
      $group: {
        _id: {
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemGroupDetails.name",
          branch: "$branch", // Preserve branch in the grouping
          branchName: "$branchDetails.name", // Include branch name for super-admins
        },
        items: {
          $push: {
            code: "$itemDetails.itemCode",
            name: "$itemDetails.itemName",
            rate: "$itemDetails.rate",
            quantity: { $sum: "$items.qty" },
            totalBill: "$totalBill",
          },
        },
        grandTotalQty: { $sum: "$items.qty" },
        granTotalBill: { $sum: "$totalBill" },
        grandTotalRate: { $sum: "$itemDetails.rate" },
      },
    },
    {
      $group: {
        _id: "$_id.menuGroup",
        itemGroups: {
          $push: {
            itemGroup: "$_id.itemGroup",
            branch: "$_id.branch", // Carry branch information
            branchName: "$_id.branchName", // Include branch name
            items: "$items",
            granTotalBill: { $sum: "$granTotalBill" },
            grandTotalQty: { $sum: "$grandTotalQty" },
            grandTotalRate: { $sum: "$grandTotalRate" },
          },
        },
      },
    },
    {
      $project: {
        menuGroup: "$_id",
        branchName: "$_id",
        itemGroups: 1,
        _id: 0,
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);

  if (!branchInfo && branch) {
    branchInfo = await Branch.findById(branch);
  }

  return { branchInfo, result };
};

const getItemWiseSalesStatementFormDB_v2 = async (
  query: Record<string, any>,
  user: any,
) => {
  const { endDate, startDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;

  let branchInfo = branch ? await Branch.findById(branch) : null;
  if (!branch) {
    if (user?.role === ENUM_USER.ADMIN || user.role === ENUM_USER.SUPER_ADMIN) {
      const branches = await Branch.find();
      const promises = branches.map(async (b) => {
        const result = await Order.aggregate(
          itemWiseSalesStatementPipelineProvider({
            branch: b?._id?.toString(),
            startDate,
            endDate,
            user,
          }),
        );
        return {
          branchInfo: b,
          result,
        };
      });
      const result = await Promise.all(promises);
      return result;
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, "Branch not provided");
    }
  }
  const result = await Order.aggregate(
    itemWiseSalesStatementPipelineProvider({
      branch,
      startDate,
      endDate,
      user,
    }),
  );

  if (!branchInfo && branch) {
    branchInfo = await Branch.findById(branch);
  }

  return [{ branchInfo, result }];
};

const getRawMaterialConsumptionServiceFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const { startDate, endDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;

  const pipeline: PipelineStage[] = [
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
        as: "itemDetails",
      },
    },
    {
      $unwind: {
        path: "$itemDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$itemDetails.consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "itemDetails.consumptions.item",
        foreignField: "_id",
        as: "rawMaterial",
      },
    },
    {
      $unwind: {
        path: "$rawMaterial",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          branch: "$branch",
          rawMaterialId: "$rawMaterial._id",
          materialName: "$rawMaterial.materialName",
          unit: "$rawMaterial.baseUnit",
          rate: "$rawMaterial.rate",
          conversion: "$rawMaterial.conversion",
        },
        totalQuantity: {
          $sum: {
            $multiply: [
              { $ifNull: ["$items.qty", 0] },
              { $ifNull: ["$itemDetails.consumptions.qty", 0] },
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.branch",
        materials: {
          $push: {
            materialName: "$_id.materialName",
            unit: "$_id.unit",
            rate: "$_id.rate",
            conversion: "$_id.conversion",
            unitRate: {
              $cond: {
                if: { $gt: [{ $ifNull: ["$_id.conversion", 0] }, 0] },
                then: {
                  $divide: [{ $ifNull: ["$_id.rate", 0] }, "$_id.conversion"],
                },
                else: { $ifNull: ["$_id.rate", 0] },
              },
            },
            totalQuantity: "$totalQuantity",
            totalCost: {
              $multiply: [
                "$totalQuantity",
                {
                  $cond: {
                    if: { $gt: [{ $ifNull: ["$_id.conversion", 0] }, 0] },
                    then: {
                      $divide: [
                        { $ifNull: ["$_id.rate", 0] },
                        "$_id.conversion",
                      ],
                    },
                    else: { $ifNull: ["$_id.rate", 0] },
                  },
                },
              ],
            },
          },
        },
        branchGrandTotal: {
          $sum: {
            $multiply: [
              "$totalQuantity",
              {
                $cond: {
                  if: { $gt: [{ $ifNull: ["$_id.conversion", 0] }, 0] },
                  then: {
                    $divide: [{ $ifNull: ["$_id.rate", 0] }, "$_id.conversion"],
                  },
                  else: { $ifNull: ["$_id.rate", 0] },
                },
              },
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    {
      $unwind: {
        path: "$branchInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        branchName: { $ifNull: ["$branchInfo.name", "Unknown Branch"] },
        branchId: "$_id",
        materials: {
          $filter: {
            input: "$materials",
            as: "m",
            cond: { $ne: ["$$m.materialName", null] },
          },
        },
        branchGrandTotal: 1,
      },
    },
  ];

  const result = await Order.aggregate(pipeline);
  return result;
};

const getMenuGroupWithItemsFromDB = async (
  payload: Record<string, any>,
  user: any,
) => {
  const branch = user?.branch || payload.branch;

  const branchInfo = branch ? await Branch.findById(branch) : null;

  // const query = [
  //   ...(branch
  //     ? [
  //         {
  //           $match: {
  //             branch: new mongoose.Types.ObjectId(branch),
  //           },
  //         },
  //       ]
  //     : []), // Skip $match if no branch is provided
  //   {
  //     $unwind: {
  //       path: "$branch", // Unwind the branch array to handle each branch separately
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "itemcategroys", // Replace with your actual ItemCategory collection name
  //       localField: "itemCategory",
  //       foreignField: "_id",
  //       as: "itemCategorysDetails",
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$itemCategorysDetails",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "menugroups",
  //       localField: "itemCategorysDetails.menuGroup",
  //       foreignField: "_id",
  //       as: "menuGroupDetails",
  //     },
  //   },
  //   {
  //     $unwind: { path: "$menuGroupDetails", preserveNullAndEmptyArrays: true },
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         branch: "$branch", // Now grouping by the individual branch
  //         menuGroup: "$menuGroupDetails.name",
  //         itemGroup: "$itemCategorysDetails.name",
  //       },
  //       items: {
  //         $push: {
  //           name: "$itemName",
  //           code: "$itemCode",
  //           rate: "$rate",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         branch: "$_id.branch", // Group by branch
  //         menuGroup: "$_id.menuGroup",
  //       },
  //       itemGroups: {
  //         $push: {
  //           itemGroup: "$_id.itemGroup",
  //           items: "$items",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id.branch", // Group by branch again to consolidate menuGroups
  //       menuGroups: {
  //         $push: {
  //           menuGroup: "$_id.menuGroup",
  //           itemGroups: "$itemGroups",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "branches",
  //       localField: "_id",
  //       foreignField: "_id",
  //       as: "branchDetails",
  //     },
  //   },
  //   {
  //     $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
  //   },
  //   {
  //     $project: {
  //       branch: "$branchDetails.name", // Include branch name
  //       branchId: "$_id", // Include branchId
  //       menuGroups: 1,
  //       _id: 0,
  //     },
  //   },
  // ];

  const query = [
    {
      $unwind: {
        path: "$branch", // Unwind the branch array to handle each branch separately
        preserveNullAndEmptyArrays: true, // Ensure no data is dropped if branch is null/empty
      },
    },
    ...(branch
      ? [
          {
            $match: {
              branch: new mongoose.Types.ObjectId(branch), // Match the branch after unwinding
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
        from: "menugroups",
        localField: "itemCategorysDetails.menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: {
        path: "$menuGroupDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          branch: "$branch", // Grouping by individual branch after filtering
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemCategorysDetails.name",
        },
        items: {
          $push: {
            name: "$itemName",
            code: "$itemCode",
            rate: "$rate",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          branch: "$_id.branch", // Group by branch
          menuGroup: "$_id.menuGroup",
        },
        itemGroups: {
          $push: {
            itemGroup: "$_id.itemGroup",
            items: "$items",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.branch", // Group by branch again to consolidate menuGroups
        menuGroups: {
          $push: {
            menuGroup: "$_id.menuGroup",
            itemGroups: "$itemGroups",
          },
        },
      },
    },
    {
      $lookup: {
        from: "branches", // Join with the branches collection to get branch details
        localField: "_id",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        branch: "$branchDetails.name", // Include branch name
        branchId: "$_id", // Include branchId
        menuGroups: 1,
        _id: 0,
      },
    },
  ];

  const result = await MenuItemConsumption.aggregate(query);
  return { branchInfo, result };
};

// menu item and coinsumptionconst
const getMenuItemsAndConsumptionFromDB = async (
  payload: Record<string, any>,
  user: any,
) => {
  const branch = user?.branch || payload.branch;
  const branchInfo = branch ? await Branch.findById(branch) : null;
  const query = [
    ...(branch
      ? [
          {
            $match: {
              branch: new mongoose.Types.ObjectId(branch), // Match the branch after unwinding
            },
          },
        ]
      : []),
    {
      $unwind: {
        path: "$branch",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...(branch
      ? [
          {
            $match: {
              branch: new mongoose.Types.ObjectId(branch),
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
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
        from: "menugroups",
        localField: "itemCategorysDetails.menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: {
        path: "$menuGroupDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "consumptions.item",
        foreignField: "_id",
        as: "rawMaterialsDetails",
      },
    },
    {
      $unwind: {
        path: "$rawMaterialsDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          itemName: "$itemName",
          itemCode: "$itemCode",
          rate: "$rate",
          cookingTime: "$cookingTime",
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemCategorysDetails.name",
          branch: "$branchDetails.name",
        },
        consumptions: {
          $push: {
            rate: "$rawMaterialsDetails.rate",
            qty: "$consumptions.qty",
            materialName: "$rawMaterialsDetails.materialName",
            baseUnit: "$rawMaterialsDetails.baseUnit",
          },
        },
      },
    },
    {
      $addFields: {
        consumptions: {
          $filter: {
            input: "$consumptions",
            as: "c",
            cond: { $ne: ["$$c.materialName", null] },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          branch: "$_id.branch",
          menuGroup: "$_id.menuGroup",
          itemGroup: "$_id.itemGroup",
        },
        items: {
          $push: {
            name: "$_id.itemName",
            code: "$_id.itemCode",
            rate: "$_id.rate",
            cookingTime: "$_id.cookingTime",
            consumptions: "$consumptions",
          },
        },
        totalConsumptionCount: { $sum: { $size: "$consumptions" } },
      },
    },
    {
      $group: {
        _id: "$_id.menuGroup",
        itemGroups: {
          $push: {
            itemGroup: "$_id.itemGroup",
            items: "$items",
            totalConsumptionCount: "$totalConsumptionCount",
            branch: "$_id.branch",
          },
        },
        menuGroupTotalConsumption: { $sum: "$totalConsumptionCount" },
      },
    },
    {
      $project: {
        menuGroup: "$_id",
        itemGroups: 1,
        menuGroupTotalConsumption: 1,
        _id: 0,
      },
    },
  ];

  const result = await MenuItemConsumption.aggregate(query);
  return { branchInfo, result };
};

//
const getMenuItemsAndCostingFromDB = async (
  payload: Record<string, any>,
  user: any,
) => {
  const branch = user?.branch || payload.branch;
  const branchInfo = await Branch.findById(branch);
  const query = [
    ...(branch
      ? [
          {
            $match: {
              branch: new mongoose.Types.ObjectId(branch), // Match the branch after unwinding
            },
          },
        ]
      : []),
    {
      $unwind: {
        path: "$branch",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...(branch
      ? [
          {
            $match: {
              branch: new mongoose.Types.ObjectId(branch),
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

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
        from: "menugroups",
        localField: "itemCategorysDetails.menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: { path: "$menuGroupDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "consumptions.item",
        foreignField: "_id",
        as: "rawMaterialsDetails",
      },
    },
    {
      $unwind: {
        path: "$rawMaterialsDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemCategorysDetails.name",
          itemName: "$itemName",
          itemCode: "$itemCode",
          rate: "$rate",
          cookingTime: "$cookingTime",
          branch: "$branchDetails.name",
        },
        consumptions: {
          $push: {
            rate: "$rawMaterialsDetails.rate",
            qty: "$consumptions.qty",
            materialName: "$rawMaterialsDetails.materialName",
            baseUnit: "$rawMaterialsDetails.baseUnit",
            price: {
              $multiply: [
                { $ifNull: ["$consumptions.qty", 0] },
                {
                  $cond: {
                    if: {
                      $gt: [
                        { $ifNull: ["$rawMaterialsDetails.conversion", 0] },
                        0,
                      ],
                    },
                    then: {
                      $divide: [
                        { $ifNull: ["$rawMaterialsDetails.rate", 0] },
                        "$rawMaterialsDetails.conversion",
                      ],
                    },
                    else: { $ifNull: ["$rawMaterialsDetails.rate", 0] },
                  },
                },
              ],
            },
          },
        },
        rate: { $first: "$rate" },
        totalCosting: {
          $sum: {
            $multiply: [
              { $ifNull: ["$consumptions.qty", 0] },
              {
                $cond: {
                  if: {
                    $gt: [
                      { $ifNull: ["$rawMaterialsDetails.conversion", 0] },
                      0,
                    ],
                  },
                  then: {
                    $divide: [
                      { $ifNull: ["$rawMaterialsDetails.rate", 0] },
                      "$rawMaterialsDetails.conversion",
                    ],
                  },
                  else: { $ifNull: ["$rawMaterialsDetails.rate", 0] },
                },
              },
            ],
          },
        },
        totalConsumptionCount: {
          $sum: {
            $cond: [{ $ifNull: ["$rawMaterialsDetails._id", false] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        consumptions: {
          $filter: {
            input: "$consumptions",
            as: "c",
            cond: { $ne: ["$$c.materialName", null] },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          branch: "$_id.branch",
          menuGroup: "$_id.menuGroup",
          itemGroup: "$_id.itemGroup",
        },
        items: {
          $push: {
            name: "$_id.itemName",
            code: "$_id.itemCode",
            rate: "$_id.rate",
            cookingTime: "$_id.cookingTime",
            consumptions: "$consumptions",
            totalCosting: "$totalCosting",
          },
        },
        totalCosting: { $sum: "$totalCosting" },
        totalConsumptionCount: { $sum: "$totalConsumptionCount" },
      },
    },
    {
      $group: {
        _id: "$_id.menuGroup",
        itemGroups: {
          $push: {
            itemGroup: "$_id.itemGroup",
            items: "$items",
            totalCosting: "$totalCosting",
            totalConsumptionCount: "$totalConsumptionCount",
            branch: "$_id.branch",
          },
        },
        menuGroupTotalConsumption: { $sum: "$totalConsumptionCount" },
        menuGroupTotalCosting: { $sum: "$totalCosting" },
      },
    },
    {
      $project: {
        menuGroup: "$_id",
        itemGroups: 1,
        menuGroupTotalConsumption: 1,
        menuGroupTotalCosting: 1,
        _id: 0,
      },
    },
  ];

  try {
    const result = await MenuItemConsumption.aggregate(query);
    return { branchInfo, result };
  } catch (error) {
    console.error("Error fetching menu group with items:", error);
    throw error;
  }
};

// raw material consumption stattement based on daily sales

const getRawMaterialConsumptionSalesFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  const branch = user?.branch || query.branch;
  const branchInfo = await Branch.findById(branch);

  const pipelineAggregate = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branch ? { branch: new mongoose.Types.ObjectId(branch) } : {}),
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
        as: "itemDetails",
      },
    },
    {
      $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$itemDetails.consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "itemDetails.consumptions.item",
        foreignField: "_id",
        as: "rawMaterialsDetails",
      },
    },
    {
      $unwind: {
        path: "$rawMaterialsDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: branch
          ? "$rawMaterialsDetails.materialName"
          : {
              branch: "$branch",
              materialName: "$rawMaterialsDetails.materialName",
            },
        totalQty: {
          $sum: { $multiply: ["$itemDetails.consumptions.qty", "$items.qty"] },
        },
        rate: { $first: "$rawMaterialsDetails.rate" },
        unit: { $first: "$rawMaterialsDetails.baseUnit" },
        totalPrice: {
          $sum: {
            $multiply: [
              "$itemDetails.consumptions.qty",
              "$items.qty",
              "$rawMaterialsDetails.rate",
            ],
          },
        },
        branch: { $first: "$branch" },
      },
    },
    {
      $group: {
        _id: branch ? null : "$_id.branch",
        materials: {
          $push: {
            materialName: branch ? "$_id" : "$_id.materialName",
            totalQty: "$totalQty",
            rate: "$rate",
            unit: "$unit",
            totalPrice: "$totalPrice",
          },
        },
        branch: { $first: "$branch" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        branch: "$branchDetails.name",
        materials: 1,
        totalQty: { $sum: "$rawMaterials.totalQty" },
        totalPrice: { $sum: "$rawMaterials.totalPrice" },
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

// item wise raw materials consumption
const getItemWiseRawMaterialConsumptionFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  const branch = user?.branch || query.branch;

  const branchInfo = await Branch.findById(branch);

  const pipelineAggregate: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branch ? { branch: new mongoose.Types.ObjectId(branch) } : {}),
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
        as: "itemDetails",
      },
    },
    {
      $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$itemDetails.consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "itemDetails.consumptions.item",
        foreignField: "_id",
        as: "rawMaterialsDetails",
      },
    },
    {
      $unwind: {
        path: "$rawMaterialsDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          itemName: "$itemDetails.itemName",
          itemCode: "$itemDetails.itemCode",
          itemRate: "$itemDetails.rate",
          rawMaterialName: "$rawMaterialsDetails.materialName",
          rawMaterialId: "$rawMaterialsDetails._id",
          rate: "$rawMaterialsDetails.rate",
          unit: "$rawMaterialsDetails.baseUnit",
          branch: "$branch", // Include branch here for grouping
        },
        totalQty: {
          $sum: {
            $multiply: ["$itemDetails.consumptions.qty", "$items.qty"],
          },
        },
        totalPrice: {
          $sum: {
            $multiply: [
              "$itemDetails.consumptions.qty",
              "$items.qty",
              "$rawMaterialsDetails.rate",
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: {
          itemName: "$_id.itemName",
          itemCode: "$_id.itemCode",
          itemRate: "$_id.itemRate",
        },
        totalItemQty: { $sum: "$totalQty" },

        rawMaterialConsumptions: {
          $push: {
            rawMaterialName: "$_id.rawMaterialName",
            rawMaterialId: "$_id.rawMaterialId",
            totalQty: "$totalQty",
            rate: "$_id.rate",
            unit: "$_id.unit",
            totalPrice: "$totalPrice",
          },
        },
        branch: { $first: "$_id.branch" }, // Keep branch if needed
      },
    },
    {
      $group: {
        _id: branch ? null : "$branch", // If branch exists, group by branch; otherwise group by null
        materials: {
          $push: {
            itemName: "$_id.itemName",
            itemCode: "$_id.itemCode",
            itemRate: "$_id.itemRate",
            totalItemQty: "$totalItemQty",
            totalAmount: {
              $sum: {
                $multiply: ["$_id.itemRate", "$totalItemQty"],
              },
            },
            consumptions: "$rawMaterialConsumptions",
          },
        },
        branch: { $first: "$branch" }, // Keep branch if grouping by branch
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        branch: branch ? "$branchDetails.name" : "All Branches", // Include branch name if present
        materials: 1,
        totalItemQty: { $sum: "$materials.totalItemQty" },
        totalAmount: {
          $sum: {
            $multiply: [
              { $sum: "$materials.totalItemQty" },
              { $first: "$materials.itemRate" }, // Assuming all items have the same rate for the group
            ],
          },
        },
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

//

const getSaledDueStatementFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  const branch = user?.branch || query.branch;

  const branchInfo = await Branch.findById(branch);

  const pipelineAggregate: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        due: {
          $gte: 0,
        },
        ...(branch ? { branch: new mongoose.Types.ObjectId(branch) } : {}), // Conditionally add branch filter
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Group by date
          },
          branch: "$branch", // Group by branch
        },
        totalDue: { $sum: "$due" },
        totalBills: { $sum: "$totalBill" },
        totalGuests: { $sum: "$guests" },
        totalVat: { $sum: "$vat" },
        totalSCharge: { $sum: "$serviceCharge" },
        totalDiscount: { $sum: "$totalDiscount" },
      },
    },
    {
      $lookup: {
        from: "branches", // Look up branch details by ID
        localField: "_id.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true, // Ensure it works even if no branch is matched
      },
    },
    {
      $project: {
        date: "$_id.date",
        totalDue: 1,
        totalBills: 1,
        totalGuests: 1,
        totalVat: 1,
        totalSCharge: 1,
        totalDiscount: 1,
        branchName: "$branchDetails.name", // Include branch name in result
        _id: 0,
      },
    },
    {
      $sort: { date: 1 }, // Sort results by date
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);

  return { branchInfo, result };
};

// waite wise sales

const getWaiterWiseSalesFromDB_v2 = async (
  query: Record<string, any>,
  user: any,
) => {
  const { endDate, startDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;

  let branchInfo = branch ? await Branch.findById(branch) : null;

  const pipelineProvider = (branchId: string) => {
    const matchStage: PipelineStage = {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branchId && { branch: new mongoose.Types.ObjectId(branchId) }),
      },
    };

    return [
      matchStage,
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "waiters",
          localField: "waiter",
          foreignField: "_id",
          as: "waiterDetails",
        },
      },
      {
        $unwind: { path: "$waiterDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: branchId
            ? {
                id: "$waiterDetails._id",
                branchName: "$branchDetails.name",
                name: "$waiterDetails.name",
              }
            : {
                branchName: "$branchDetails.name",
                waiterName: "$waiterDetails.name",
              },
          totalAmount: { $sum: "$totalBill" },
        },
      },
      {
        $project: {
          ...(branchId
            ? {
                branchName: "$_id.branchName",
                waiterName: "$_id.name",
                totalAmount: 1,
              }
            : {
                branchName: "$_id.branchName",
                waiterName: "$_id.waiterName",
                totalAmount: 1,
              }),
          _id: 0,
        },
      },
    ] as PipelineStage[];
  };

  if (!branch) {
    if (user?.role === ENUM_USER.ADMIN || user.role === ENUM_USER.SUPER_ADMIN) {
      const branches = await Branch.find();
      const promises = branches.map(async (b) => {
        const result = await Order.aggregate(
          pipelineProvider(b?._id?.toString() as string),
        );
        return {
          branchInfo: b,
          result,
        };
      });
      const result = await Promise.all(promises);
      return result;
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, "Branch not provided");
    }
  }

  const result = await Order.aggregate(pipelineProvider(branch));

  if (!branchInfo && branch) {
    branchInfo = await Branch.findById(branch);
  }

  return [{ branchInfo, result }];
};

const getWaiteWiseSalesFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  const branch = user?.branch || query.branch;
  const branchInfo = await Branch.findById(branch);

  const pipelineAggregate: PipelineStage[] = [
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
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "waiters",
        localField: "waiter",
        foreignField: "_id",
        as: "waiterDetails",
      },
    },
    {
      $unwind: { path: "$waiterDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: branch
          ? {
              id: "$waiterDetails._id",
              branchName: "$branchDetails.name",
              name: "$waiterDetails.name",
            }
          : {
              branchName: "$branchDetails.name",

              waiterName: "$waiterDetails.name",
            },
        totalAmount: { $sum: "$totalBill" },
      },
    },
    {
      $project: {
        ...(branch
          ? {
              branchName: "$_id.branchName",
              waiterName: "$_id.name",
              totalAmount: 1,
            }
          : {
              branchName: "$_id.branchName",

              waiterName: "$_id.waiterName",
              totalAmount: 1,
            }),
        _id: 0,
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

// waiter wise sales statement

const getWaiterWiseSalesStatementFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  const branch = user?.branch || query.branch;
  const branchInfo = await Branch.findById(branch);
  const pipelineAggregate: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branch ? { branch: new mongoose.Types.ObjectId(branch) } : {}), // Conditionally filter by branch
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
        as: "itemDetails",
      },
    },
    {
      $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "itemcategroys",
        localField: "itemDetails.itemCategory",
        foreignField: "_id",
        as: "itemCategoryDetails",
      },
    },
    {
      $unwind: {
        path: "$itemCategoryDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "waiters",
        localField: "waiter",
        foreignField: "_id",
        as: "waiterDetails",
      },
    },
    {
      $unwind: { path: "$waiterDetails", preserveNullAndEmptyArrays: true },
    },
    // Group by waiter and item category
    {
      $group: {
        _id: {
          branchId: "$branch",
          waiterId: "$waiterDetails._id",
          waiterName: "$waiterDetails.name",
          categoryName: "$itemCategoryDetails.name",
          itemName: "$itemDetails.itemName",
          itemCode: "$itemDetails.itemCode",
          itemRate: "$itemDetails.rate",
        },
        totalQty: { $sum: "$items.qty" },
        totalAmount: {
          $sum: { $multiply: ["$items.qty", "$itemDetails.rate"] },
        },
      },
    },
    // Reshape data for easier consumption
    {
      $group: {
        _id: {
          branchId: "$_id.branchId",
          waiterName: "$_id.waiterName",
          categoryId: "$_id.categoryId",
          categoryName: "$_id.categoryName",
        },
        items: {
          $push: {
            itemName: "$_id.itemName",
            itemCode: "$_id.itemCode",
            rate: "$_id.itemRate",
            totalQty: "$totalQty",
            totalAmount: "$totalAmount",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          branchId: "$_id.branchId",
          waiterId: "$_id.waiterId",
          waiterName: "$_id.waiterName",
        },
        categories: {
          $push: {
            categoryId: "$_id.categoryId",
            categoryName: "$_id.categoryName",
            items: "$items",
          },
        },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id.branchId",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        branchId: "$_id.branchId",
        branchName: "$branchDetails.name",
        waiterId: "$_id.waiterId",
        waiterName: "$_id.waiterName",
        categories: 1,
        _id: 0,
      },
    },
    {
      $sort: { branchName: 1, waiterName: 1 }, // Sort results by branch and waiter name
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

//!  get dashboard static data

const getDashboardStatisticsDataFromDB = async () => {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0); // Start of today
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - 30);
  startDate.setUTCHours(0, 0, 0, 0);

  const pipeLineAggregate = [
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "branch",
        as: "orderData",
      },
    },
    {
      $project: {
        branchName: "$name",
        totalAmount: {
          $cond: {
            if: { $eq: [{ $size: "$orderData" }, 0] },
            then: "N/A",
            else: { $sum: "$orderData.paid" },
          },
        },
        totalBills: {
          $cond: {
            if: { $eq: [{ $size: "$orderData" }, 0] },
            then: "N/A",
            else: { $sum: "$orderData.totalBill" },
          },
        },
        totalDue: {
          $cond: {
            if: { $eq: [{ $size: "$orderData" }, 0] },
            then: 0,
            else: { $sum: "$orderData.due" },
          },
        },
        todayPaid: {
          $cond: {
            if: { $eq: [{ $size: "$orderData" }, 0] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: "$orderData",
                  as: "order",
                  in: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$$order.createdAt", todayStart] },
                          { $lte: ["$$order.createdAt", todayEnd] },
                        ],
                      },
                      "$$order.paid",
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        lastMonthTotalPaid: {
          $cond: {
            if: { $eq: [{ $size: "$orderData" }, 0] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: "$orderData",
                  as: "order",
                  in: {
                    $cond: [
                      {
                        $and: [{ $gte: ["$$order.createdAt", startDate] }],
                      },
                      "$$order.paid",
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  ];

  const branchWiseData = await Branch.aggregate(pipeLineAggregate);

  return { branchWiseData };
};

const getMenuItemConsumptionReportFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const { startDate, endDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;
  const menuItem = query.menuItem;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(branch && mongoose.Types.ObjectId.isValid(branch)
          ? { branch: new mongoose.Types.ObjectId(branch) }
          : {}),
      },
    },
    {
      $unwind: "$items",
    },
    ...(menuItem && mongoose.Types.ObjectId.isValid(menuItem)
      ? [
          {
            $match: {
              "items.item": new mongoose.Types.ObjectId(menuItem),
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "menuitemconsumptions",
        localField: "items.item",
        foreignField: "_id",
        as: "itemDetails",
      },
    },
    {
      $unwind: {
        path: "$itemDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          item: "$items.item",
          branch: "$branch",
          itemName: "$itemDetails.itemName",
          itemCode: "$itemDetails.itemCode",
        },
        totalQuantity: { $sum: { $ifNull: ["$items.qty", 0] } },
        totalRevenue: {
          $sum: {
            $multiply: [
              { $ifNull: ["$items.qty", 0] },
              { $ifNull: ["$items.rate", 0] },
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id.branch",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    {
      $unwind: {
        path: "$branchInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        branchId: "$_id.branch",
        branchName: { $ifNull: ["$branchInfo.name", "Unknown Branch"] },
        itemId: "$_id.item",
        itemName: { $ifNull: ["$_id.itemName", "Unknown Item"] },
        itemCode: { $ifNull: ["$_id.itemCode", "N/A"] },
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: { totalQuantity: -1 },
    },
  ];

  const result = await Order.aggregate(pipeline);
  return result;
};

const getDueSalesStatementReportFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const { startDate, endDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;
  const customer = query.customer;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        due: { $gt: 0 },
        ...(branch && mongoose.Types.ObjectId.isValid(branch)
          ? { branch: new mongoose.Types.ObjectId(branch) }
          : {}),
        ...(customer && mongoose.Types.ObjectId.isValid(customer)
          ? { customer: new mongoose.Types.ObjectId(customer) }
          : {}),
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    {
      $unwind: {
        path: "$customerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    {
      $unwind: {
        path: "$branchInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        billNo: 1,
        date: "$createdAt",
        branchId: "$branch",
        branchName: { $ifNull: ["$branchInfo.name", "Unknown Branch"] },
        customerName: {
          $ifNull: ["$customerInfo.name", "$customer.name", "Walking Customer"],
        },
        customerPhone: { $ifNull: ["$customerInfo.phone", "N/A"] },
        totalBill: { $ifNull: ["$totalBill", 0] },
        paidAmount: { $ifNull: ["$paid", 0] },
        dueAmount: { $ifNull: ["$due", 0] },
        netPayable: { $ifNull: ["$netPayable", 0] },
      },
    },
    {
      $sort: { date: -1 },
    },
  ];

  const result = await Order.aggregate(pipeline);
  return result;
};

const getKitchenOrderCostReportFromDB = async (
  query: Record<string, any>,
  user: any,
) => {
  const { endDate, startDate } = DateFormatter(
    query?.startDate,
    query?.endDate,
  );
  const branch = user?.branch || query.branch;
  const status = query.status;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        ...(status ? { status } : {}),
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "orderDetails",
      },
    },
    {
      $unwind: {
        path: "$orderDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (branch) {
    pipeline.push({
      $match: {
        "orderDetails.branch": new mongoose.Types.ObjectId(branch),
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "branches",
        localField: "orderDetails.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: {
        path: "$branchDetails",
        preserveNullAndEmptyArrays: true,
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
        let: { itemCode: "$items.itemCode", itemName: "$items.itemName" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $ne: ["$$itemCode", null] },
                      { $eq: ["$itemCode", "$$itemCode"] },
                    ],
                  },
                  {
                    $and: [
                      { $ne: ["$$itemName", null] },
                      { $eq: ["$itemName", "$$itemName"] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "consumptionDetails",
      },
    },
    {
      $unwind: {
        path: "$consumptionDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$consumptionDetails.consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rawmaterials",
        localField: "consumptionDetails.consumptions.item",
        foreignField: "_id",
        as: "rawMaterialsDetails",
      },
    },
    {
      $unwind: {
        path: "$rawMaterialsDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          kitchenOrderId: "$_id",
          itemCode: "$items.itemCode",
          itemName: "$items.itemName",
        },
        kitchenOrderNo: { $first: "$kitchenOrderNo" },
        billNo: { $first: "$billNo" },
        status: { $first: "$status" },
        remark: { $first: "$remark" },
        tableName: { $first: "$tableName" },
        waiterName: { $first: "$waiterName" },
        createdAt: { $first: "$createdAt" },
        branchName: { $first: "$branchDetails.name" },
        qty: { $first: "$items.qty" },
        rate: { $first: "$items.rate" },
        unitCostPrice: {
          $sum: {
            $multiply: [
              { $ifNull: ["$consumptionDetails.consumptions.qty", 0] },
              { $ifNull: ["$rawMaterialsDetails.rate", 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        kitchenOrderId: "$_id.kitchenOrderId",
        kitchenOrderNo: 1,
        billNo: 1,
        status: 1,
        remark: 1,
        tableName: 1,
        waiterName: 1,
        createdAt: 1,
        branchName: 1,
        item: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$_id.itemCode", null] },
                { $eq: ["$_id.itemName", null] },
              ],
            },
            then: "$$REMOVE",
            else: {
              itemCode: "$_id.itemCode",
              itemName: "$_id.itemName",
              qty: { $ifNull: ["$qty", 0] },
              rate: { $ifNull: ["$rate", 0] },
              unitCostPrice: "$unitCostPrice",
              totalCostPrice: {
                $multiply: ["$unitCostPrice", { $ifNull: ["$qty", 0] }],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$kitchenOrderId",
        kitchenOrderNo: { $first: "$kitchenOrderNo" },
        billNo: { $first: "$billNo" },
        status: { $first: "$status" },
        remark: { $first: "$remark" },
        tableName: { $first: "$tableName" },
        waiterName: { $first: "$waiterName" },
        createdAt: { $first: "$createdAt" },
        branchName: { $first: "$branchName" },
        items: {
          $push: "$item",
        },
      },
    },
    {
      $project: {
        _id: 1,
        kitchenOrderNo: 1,
        billNo: 1,
        status: 1,
        remark: 1,
        tableName: 1,
        waiterName: 1,
        createdAt: 1,
        branchName: 1,
        items: {
          $filter: {
            input: "$items",
            as: "it",
            cond: { $ne: ["$$it", null] },
          },
        },
        totalOrderCostPrice: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$items",
                  as: "it",
                  cond: { $ne: ["$$it", null] },
                },
              },
              as: "it",
              in: "$$it.totalCostPrice",
            },
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  );

  const result = await KitchenOrder.aggregate(pipeline);
  return result;
};

export const reportServices = {
  getDailyStatementFromDB,
  getDailySalesStatementSummeryFromDB,
  getItemWiseSalesSatetementFromDB,
  getMenuGroupWithItemsFromDB,
  getMenuItemsAndConsumptionFromDB,
  getMenuItemsAndCostingFromDB,
  getRawMaterialConsumptionSalesFromDB,
  getRawMaterialConsumptionServiceFromDB,
  getItemWiseRawMaterialConsumptionFromDB,
  getSaledDueStatementFromDB,
  getWaiteWiseSalesFromDB,
  getWaiterWiseSalesFromDB_v2,
  getWaiterWiseSalesStatementFromDB,
  getDashboardStatisticsDataFromDB,
  getItemWiseSalesStatementFormDB_v2,
  getMenuItemConsumptionReportFromDB,
  getDueSalesStatementReportFromDB,
  getKitchenOrderCostReportFromDB,
};
