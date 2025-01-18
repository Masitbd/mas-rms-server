/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { mongo, PipelineStage } from "mongoose";
import { Order } from "../order/order.model";

import MenuItemConsumption from "../rawMaterialConsumption/rawMaterialConsumption.model";
import { Branch } from "../branch/branch.model";

const getDailyStatementFromDB = async (
  payload: Record<string, any>,
  user: any
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
                      { $gte: [{ $hour: "$createdAt" }, 18] },
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
            totalScharge: "$tSChargse",
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
  user: any
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

  const branch = user?.branch || query.branch;

  const branchInfo = await Branch.findById(branch);

  const queryParams: PipelineStage[] = [
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
      $facet: {
        // Group by date for daily summaries
        dateWiseSummary: [
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
              totalBill: { $sum: "$totalBill" },
              totalVat: { $sum: "$totalVat" },
              totalGuest: { $sum: "$guest" },
              totalDiscount: { $sum: "$totalDiscount" },
              totalScharge: { $sum: "$tSChargse" },
              totalPayable: { $sum: "$netPayable" },
              totalDue: { $sum: "$due" },
              totalPaid: { $sum: "$paid" },
            },
          },
          { $sort: { "_id.date": 1 } }, // Sort by date in ascending order
        ],
        // Group by payment mode for overall summary
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
              grandTotalScharge: { $sum: "$tSChargse" },
              grandTotalPayable: { $sum: "$netPayable" },
              grandTotalDue: { $sum: "$due" },
              grandTotalPaid: { $sum: "$paid" },
            },
          },
        ],
      },
    },
    {
      $project: {
        dateWiseSummary: 1,
        paymentModeSummary: 1,
        total: { $arrayElemAt: ["$total", 0] },
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
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
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
    {
      $group: {
        _id: {
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemGroupDetails.name",
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
        itemGroups: 1,

        _id: 0,
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

const getMenuGroupWithItemsFromDB = async (
  payload: Record<string, any>,
  user: any
) => {
  const branch = user?.branch || payload.branch;
  const branchInfo = await Branch.findById(branch);
  const query = [
    {
      $match: {
        branch: new mongoose.Types.ObjectId(branch),
      },
    },

    {
      $lookup: {
        from: "itemcategroys", // Replace with your actual MenuGroup collection name
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
      $group: {
        _id: {
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemCategorysDetails.name",
        },
        items: {
          $push: {
            name: "$itemName",
            code: "$itemCode",
            cookingTime: "$cookingTime",
            rate: "$rate",
          },
        },
      },
    },

    {
      $group: {
        _id: "$_id.menuGroup",
        itemGroups: {
          $push: {
            itemGroup: "$_id.itemGroup",
            items: "$items",
          },
        },
      },
    },

    {
      $project: {
        menuGroup: "$_id",
        itemGroups: 1,

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

// menu item and coinsumptionconst
const getMenuItemsAndConsumptionFromDB = async (
  payload: Record<string, any>,
  user: any
) => {
  const branch = user?.branch || payload.branch;
  const branchInfo = await Branch.findById(branch);
  const query = [
    {
      $match: {
        branch: new mongoose.Types.ObjectId(branch),
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
          itemName: "$itemName",
          itemCode: "$itemCode",
          rate: "$rate",
          menuGroup: "$menuGroupDetails.name",
          itemGroup: "$itemCategorysDetails.name",
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
    //
    {
      $group: {
        _id: {
          menuGroup: "$_id.menuGroup",
          itemGroup: "$_id.itemGroup",
        },
        items: {
          $push: {
            name: "$_id.itemName",
            code: "$_id.itemCode",
            rate: "$_id.rate",
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
  try {
    const result = await MenuItemConsumption.aggregate(query);
    return { branchInfo, result };
  } catch (error) {
    console.error("Error fetching menu group with items:", error);
    throw error;
  }
};
//
const getMenuItemsAndCostingFromDB = async (
  payload: Record<string, any>,
  user: any
) => {
  const branch = user?.branch || payload.branch;
  const branchInfo = await Branch.findById(branch);
  const query = [
    {
      $match: {
        branch: {
          $elemMatch: {
            $eq: new mongoose.Types.ObjectId(branch),
          },
        },
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
        },
        consumptions: {
          $push: {
            rate: "$rawMaterialsDetails.rate",
            qty: "$consumptions.qty",
            materialName: "$rawMaterialsDetails.materialName",
            baseUnit: "$rawMaterialsDetails.baseUnit",
            price: {
              $multiply: ["$rawMaterialsDetails.rate", "$consumptions.qty"],
            },
          },
        },
        rate: { $first: "$rate" },
        totalCosting: {
          $sum: {
            $multiply: ["$rawMaterialsDetails.rate", "$consumptions.qty"],
          },
        },
        totalConsumptionCount: { $sum: 1 },
      },
    },

    {
      $group: {
        _id: {
          menuGroup: "$_id.menuGroup",
          itemGroup: "$_id.itemGroup",
        },
        items: {
          $push: {
            name: "$_id.itemName",
            code: "$_id.itemCode",
            rate: "$_id.rate",
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
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
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
    // eikahn theke ami order item ar data and consumption data pabo
    {
      $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true },
    },

    {
      $unwind: {
        path: "$itemDetails.consumptions",
        preserveNullAndEmptyArrays: true,
      },
    },
    // ekhon amake raw material theke unit price baseunit and name ante hobe
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
        _id: "$rawMaterialsDetails.materialName",
        totalQty: {
          $sum: { $multiply: ["$itemDetails.consumptions.qty", "$items.qty"] },
        }, // Sum quantities of raw materials
        rate: { $first: "$rawMaterialsDetails.rate" }, // Assuming the rate is consistent
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
      },
    },

    {
      $project: {
        rawMaterialName: "$_id",
        totalQty: 1,
        rate: 1,
        unit: 1,
        totalPrice: 1,

        _id: 0,
      },
    },
  ];
  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

// item wise raw materials consumption
const getItemWiseRawMaterialConsumptionFromDB = async (
  query: Record<string, any>,
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
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
          rawMaterialId: "$rawMaterialsDetails.id",
          rate: "$rawMaterialsDetails.rate",
          unit: "$rawMaterialsDetails.baseUnit",
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
      },
    },
    // Calculate total amount for the item
    {
      $project: {
        itemName: "$_id.itemName",
        itemCode: "$_id.itemCode",
        itemRate: "$_id.itemRate",

        totalItemQty: 1,
        totalAmount: {
          $sum: {
            $multiply: ["$_id.itemRate", "$totalItemQty"],
          },
        },
        consumptions: "$rawMaterialConsumptions",
        _id: 0,
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return { branchInfo, result };
};

//

const getSaledDueStatementFromDB = async (
  query: Record<string, any>,
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Group by date
          },
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
      $project: {
        date: "$_id.date",
        totalDue: 1,
        totalBills: 1,
        totalGuests: 1,
        totalVat: 1,
        totalSCharge: 1,
        totalDiscount: 1,
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

const getWaiteWiseSalesFromDB = async (
  query: Record<string, any>,
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
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
        _id: { id: "$waiterDetails._id", name: "$waiterDetails.name" },

        totalAmount: { $sum: "$totalBill" }, // Total quantity of the item
      },
    },
    // Calculate the total amount for each item
    {
      $project: {
        name: "$_id.name",
        totalAmount: 1,
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
  user: any
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
        branch: new mongoose.Types.ObjectId(branch),
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
      $project: {
        waiterId: "$_id.waiterId",
        waiterName: "$_id.waiterName",
        categories: 1,
        _id: 0,
      },
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

export const reportServices = {
  getDailyStatementFromDB,
  getDailySalesStatementSummeryFromDB,
  getItemWiseSalesSatetementFromDB,
  getMenuGroupWithItemsFromDB,
  getMenuItemsAndConsumptionFromDB,
  getMenuItemsAndCostingFromDB,
  getRawMaterialConsumptionSalesFromDB,
  getItemWiseRawMaterialConsumptionFromDB,
  getSaledDueStatementFromDB,
  getWaiteWiseSalesFromDB,
  getWaiterWiseSalesStatementFromDB,
  getDashboardStatisticsDataFromDB,
};
