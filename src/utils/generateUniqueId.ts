import { Customer } from "../app/modules/customer/customer.model";
import { Table } from "../app/modules/table/table.model";

//? generate table id

const findLastTableId = async () => {
  const lastItem = await Table.findOne(
    {},
    {
      tid: 1,
      _id: 0,
    }
  )
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

//?  generate cutomer id

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
