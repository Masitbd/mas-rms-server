import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { RawMaterialService } from "./rawMaterial.service";
import sendResponse from "../../../shared/sendResponse";

const create = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await RawMaterialService.post(req.body, loggedInUserInfo);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Raw Material created successfully",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await RawMaterialService.patch(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Raw Material Updated successfully",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await RawMaterialService.getAll(loggedInUserInfo);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Raw Material retrieved successfully",
    data: result,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await RawMaterialService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Raw Material retrieved successfully",
    data: result,
  });
});

const removeSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await RawMaterialService.remove(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Raw Material deleted successfully",
    data: result,
  });
});

export const RawMaterialController = {
  create,
  update,
  getAll,
  getSingle,
  removeSingle,
};
