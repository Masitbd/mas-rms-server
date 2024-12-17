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
        localField: "table",
        foreignField: "_id",
        as: "tableDetails",
      },
    },
    {
      $unwind: {
        path: "$tableDetails", // Unwind the user details array
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          timePeriod: {
            $cond: {
              if: {
                $and: [
                  { $gte: [{ $hour: "$createdAt" }, 7] },
                  { $lt: [{ $hour: "$createdAt" }, 17] },
                ],
              },
              then: "Lunch", // Between 7 AM and 5 PM is Lunch
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $gte: [{ $hour: "$createdAt" }, 18] },
                      { $lt: [{ $hour: "$createdAt" }, 23] },
                    ],
                  },
                  then: "Dinner", // Between 6 PM and 11:59 PM is Dinner
                  else: "Other", // Other times can be grouped separately (e.g., before 7 AM)
                },
              },
            },
          },
        },
        totalPaid: { $sum: "$paid" }, // Sum total paid amount for each time period
        records: {
          $push: {
            oid: "$oid",
            table: "$tableDetails.name",
            guest: "$guest",
            pMode: "$pMode",
            totalBill: "$totalBill",
            totalVat: "$totalVat",
            totalScharge: "$tSChargse",
            discount: "$totalDiscount",
            pPayment: "$pPayment",
            metPayable: "$netPayable",

            date: "$createdAt",
          },
        },
      },
    },
    {
      $sort: { "_id.groupDate": -1 }, // Sort by group date
    },
    {
      $group: {
        _id: "$_id.groupDate", // Group by date
        timePeriods: {
          $push: {
            timePeriod: "$_id.timePeriod",
            totalPaid: { $sum: "$totalPaid" }, // Total paid in each period
            records: "$records",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: "$_id",
        timePeriods: 1,
      },
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
              _id: "$pMode",
              total: { $sum: "$totalBill" },
            },
          },
        ],
      },
    },
    {
      $project: {
        dateWiseSummary: 1,
        paymentModeSummary: 1,
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
