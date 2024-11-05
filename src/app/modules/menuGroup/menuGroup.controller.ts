import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { MenuGroupServices } from "./menuGroup.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createMenuoGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await MenuGroupServices.createMenuGroupIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "MenuGroup Created Successfully",
    data: result,
  });
});

//  get all

const getAllMenuoGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await MenuGroupServices.getAllMenuGroupIdFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "MenuGroup Retrieved Successfully",
    data: result,
  });
});
const updateMenuoGroup = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MenuGroupServices.updateMenuGroupIntoDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "MenuGroup Updated Successfully",
    data: result,
  });
});
const deleteMenuoGroup = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MenuGroupServices.deleteMenuGroupIntoDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "MenuGroup Deleted Successfully",
    data: result,
  });
});

//

export const MenuGroupControllers = {
  createMenuoGroup,
  getAllMenuoGroup,
  updateMenuoGroup,
  deleteMenuoGroup,
};
