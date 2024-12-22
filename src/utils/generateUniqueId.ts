import { Customer } from "../app/modules/customer/customer.model";
import { ItemCategroy } from "../app/modules/itemCategory/itemCategory.model";
import { MenuGroup } from "../app/modules/menuGroup/menuGroup.model";
import { Order } from "../app/modules/order/order.model";
import { Waiter } from "../app/modules/waiter/waiter.model";

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
