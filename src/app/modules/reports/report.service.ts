/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from "mongoose";
import { Order } from "../order/order.model";
import { ItemCategroy } from "../itemCategory/itemCategory.model";

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

// ? item wise sales satement

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
      $unwind: "$items", // Unwind the items array
    },
    {
      $lookup: {
        from: "itemcategories", // Replace with your actual ItemCategory collection name
        localField: "items.item",
        foreignField: "_id",
        as: "itemDetails",
      },
    },
    {
      $unwind: "$itemDetails", // Unwind the itemDetails array
    },
    {
      $lookup: {
        from: "menugroups", // Replace with your actual MenuGroup collection name
        localField: "itemDetails.menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: "$menuGroupDetails", // Unwind the menuGroupDetails array
    },
    {
      $group: {
        _id: "$menuGroupDetails.name", // Group by menuGroup name
        items: {
          $push: {
            code: "$itemDetails.code", // Assuming `code` field exists in ItemCategory
            name: "$itemDetails.name", // Assuming `name` field exists in ItemCategory
            rate: "$itemDetails.rate", // Assuming `rate` field exists in ItemCategory
            quantity: { $sum: "$items.quantity" }, // Sum up the quantities
          },
        },
      },
    },
    {
      $project: {
        menuGroup: "$_id",
        items: 1,
        _id: 0,
      },
    },
  ];

  const result = await Order.aggregate(pipelineAggregate);
  return result;
};

const getMenuGroupWithItemsFromDB = async () => {
  const query = [
    {
      $lookup: {
        from: "menugroups", // Replace with your actual MenuGroup collection name
        localField: "menuGroup",
        foreignField: "_id",
        as: "menuGroupDetails",
      },
    },
    {
      $unwind: "$menuGroupDetails", // Ensure a single menuGroup per item
    },
    {
      $group: {
        _id: "$menuGroupDetails.name", // Group by menuGroup name
        items: {
          $push: {
            itemName: "$name",
            code: "$uid", // Assuming `uid` is the code for items
          },
        },
      },
    },
    {
      $project: {
        menuGroup: "$_id",
        items: 1,
        _id: 0,
      },
    },
  ];

  try {
    const result = await ItemCategroy.aggregate(query); // Replace `ItemCategory` with your model name
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
