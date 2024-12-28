import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { WaiterServices } from "./waiter.service";
import { Request, Response } from "express";

const createWaiter = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await WaiterServices.createWaiterIntoDB(
    req.body,
    loggedInUserInfo
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Waiter Created Successfully",
    data: result,
  });
});

//  get all

const getAllWaiter = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await WaiterServices.getAllWaiterIdFromDB(loggedInUserInfo);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Waiter Retrieved Successfully",
    data: result,
  });
});
const updateWaiter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WaiterServices.updateWaiterIntoDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Waiter Updated Successfully",
    data: result,
  });
});
const deleteWaiter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WaiterServices.deleteWaiterIntoDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Waiter Deleted Successfully",
    data: result,
  });
});

//

export const WaiterControllers = {
  createWaiter,
  getAllWaiter,
  updateWaiter,
  deleteWaiter,
};
