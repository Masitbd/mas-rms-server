import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ItemCategoryServices } from "./itemCategory.service";

const createItemCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemCategoryServices.createItemCategoryIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "ItemCategory Created Successfully",
    data: result,
  });
});

//  get all

const getAllItemCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemCategoryServices.getAllItemCategoryIdFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "ItemCategory Retrieved Successfully",
    data: result,
  });
});
const updateItemCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ItemCategoryServices.updateItemCategoryIntoDB(
    id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "ItemCategory Updated Successfully",
    data: result,
  });
});
const deleteItemCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ItemCategoryServices.deleteItemCategoryIntoDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "ItemCategory Deleted Successfully",
    data: result,
  });
});

//

export const ItemCategoryControllers = {
  createItemCategory,
  getAllItemCategory,
  updateItemCategory,
  deleteItemCategory,
};
