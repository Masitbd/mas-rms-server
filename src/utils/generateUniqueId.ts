import { Customer } from "../app/modules/customer/customer.model";
import { ItemCategroy } from "../app/modules/itemCategory/itemCategory.model";
import { MenuGroup } from "../app/modules/menuGroup/menuGroup.model";

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
