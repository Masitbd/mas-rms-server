/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from "mongoose";
import { Order } from "../order/order.model";

import MenuItemConsumption from "../rawMaterialConsumption/rawMaterialConsumption.model";

const getDailyStatementFromDB = async (payload: Record<string, any>) => {
  // Default to current date if no startDate and endDate are provided
  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : new Date();
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const query: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
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
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: "$_id",
        paymentGroups: 1,
      },
    },
    {
      $sort: { groupDate: -1 },
    },
  ];

  const result = await Order.aggregate(query);
  return result;
};

// ? daily sales statement summery

const getDailySalesStatementSummeryFromDB = async (
  query: Record<string, any>
) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

  const queryParams: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
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
      },
    },
  ];

  const result = await Order.aggregate(queryParams);
  return result;
};

// ! item wise sales satement

const getItemWiseSalesSatetementFromDB = async (query: Record<string, any>) => {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const pipelineAggregate: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
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

    //

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
  return result;
};

// ? ******************************************

const getMenuGroupWithItemsFromDB = async () => {
  const query = [
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
            itemName: "$itemName",
            code: "$itemCode",
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
    const result = await MenuItemConsumption.aggregate(query); // Replace `ItemCategory` with your model name
    return result;
  } catch (error) {
    console.error("Error fetching menu group with items:", error);
    throw error;
  }
};

export const reportServices = {
  getDailyStatementFromDB,
  getDailySalesStatementSummeryFromDB,
  getItemWiseSalesSatetementFromDB,
  getMenuGroupWithItemsFromDB,
};
