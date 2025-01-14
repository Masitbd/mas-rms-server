import { Model } from "mongoose";
import { Branch } from "../app/modules/branch/branch.model";
import { Customer } from "../app/modules/customer/customer.model";
import { ItemCategroy } from "../app/modules/itemCategory/itemCategory.model";
import { MenuGroup } from "../app/modules/menuGroup/menuGroup.model";
import { Order } from "../app/modules/order/order.model";

import { Waiter } from "../app/modules/waiter/waiter.model";
import { Table } from "../app/modules/table/table.model";

//? generate menu  uiid

const findLastMenuGroupId = async () => {
  const lastItem = await MenuGroup.findOne(
    {},
    {
      uid: 1,
      _id: 0,
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.uid ? lastItem.uid : undefined;
};

export const generateMenuGroupId = async () => {
  let currentId = "0";
  const lastMenugroupId = await findLastMenuGroupId();

  if (lastMenugroupId) {
    currentId = lastMenugroupId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};

// ! generate table id

const findLastTableId = async () => {
  const lastItem = await Table.findOne()
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.tid ? lastItem.tid : undefined;
};

export const generateTableId = async () => {
  let currentId = "0";
  const lastTableId = await findLastTableId();

  if (lastTableId) {
    currentId = lastTableId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};

//! -------------------- generate category id

const findLastItemCategoryId = async () => {
  const lastItem = await ItemCategroy.findOne(
    {},
    {
      uid: 1,
      _id: 0,
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.uid ? lastItem.uid : undefined;
};

export const generateItemCategoryId = async () => {
  let currentId = "0";
  const lastItemCategoryId = await findLastItemCategoryId();

  if (lastItemCategoryId) {
    currentId = lastItemCategoryId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};

//? **********************  generate cutomer id

const findLastCustomerId = async () => {
  const lastItem = await Customer.findOne(
    {},
    {
      cid: 1,
      _id: 0,
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.cid ? lastItem.cid : undefined;
};

export const generateCustomerId = async () => {
  let currentId = "0";
  const lastCustomerId = await findLastCustomerId();

  if (lastCustomerId) {
    currentId = lastCustomerId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};

// ?--------- waiter id -------------

const findLastWaiterId = async () => {
  const lastItem = await Waiter.findOne(
    {},
    {
      uid: 1,
      _id: 0,
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.uid ? lastItem.uid : undefined;
};

export const generateWaiterId = async () => {
  let currentId = "0";
  const lastWaiterId = await findLastWaiterId();

  if (lastWaiterId) {
    currentId = lastWaiterId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};

// ! generate unique order id

const findLastOrderId = async () => {
  const lastItem = await Order.findOne({})
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.billNo ? lastItem.billNo : undefined;
};

export const generateOrderId = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of the year
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  let currentId = "0";
  const lastOrderId = await findLastOrderId();

  if (lastOrderId) {
    currentId = lastOrderId.slice(5);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  incrementId = `R${year}${month}${incrementId}`;

  return incrementId;
};

// ! generate branch id

const findLastBranchId = async () => {
  const lastItem = await Branch.findOne()
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.bid ? lastItem.bid : undefined;
};

export const generateBranchId = async () => {
  let currentId = "0";
  const lastBranchId = await findLastBranchId();

  if (lastBranchId) {
    currentId = lastBranchId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(2, "0");

  return incrementId;
};

export const generateUniqueId = async <T>(
  dataModel: Model<T>,
  startString: string,
  idLengthWithoutStartString: number,
  fieldName: keyof T
) => {
  let currentId = "0";
  const lastId = await dataModel
    .findOne()
    .sort({
      createdAt: -1,
    })
    .lean();

  if (lastId) {
    currentId = lastId[fieldName] as string;
  }

  const incrementedId =
    Number(currentId.substring(startString.length) ?? 0) + 1;
  const newId = incrementedId
    .toString()
    .padStart(idLengthWithoutStartString, "0");

  return `${startString + newId}`;
};
