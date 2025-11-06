import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CashMemoTypeService } from "./cashMemoType.service";
import httpStatus from "http-status-codes";

const createCashMemoType = catchAsync(async (req: Request, res: Response) => {
  const result = await CashMemoTypeService.createCashMemoType(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CashMemoType created successfully",
    data: result,
  });
});

const getAllCashMemoTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await CashMemoTypeService.getAllCashMemoTypes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CashMemoTypes retrieved successfully",
    data: result,
  });
});

const getSingleCashMemoType = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CashMemoTypeService.getSingleCashMemoType(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "CashMemoType retrieved successfully",
      data: result,
    });
  }
);

const updateCashMemoType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CashMemoTypeService.updateCashMemoType(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CashMemoType updated successfully",
    data: result,
  });
});

const deleteCashMemoType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CashMemoTypeService.deleteCashMemoType(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CashMemoType deleted successfully",
    data: result,
  });
});

export const CashMemoTypeController = {
  createCashMemoType,
  getAllCashMemoTypes,
  getSingleCashMemoType,
  updateCashMemoType,
  deleteCashMemoType,
};
