import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { BranchSerives } from "./branch.service";
import sendResponse from "../../../shared/sendResponse";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchSerives.createBranchIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch Created Successfully",
    data: result,
  });
});
const getAllBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchSerives.getAllBranchFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch retrived Successfully",
    data: result,
  });
});
const getSingleBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchSerives.getSingleBranchFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch retrived Successfully",
    data: result,
  });
});
const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchSerives.updateBranchIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch update Successfully",
    data: result,
  });
});
const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchSerives.deleteBranchFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch delete Successfully",
    data: result,
  });
});

export const BranchControllers = {
  createBranch,
  getAllBranch,
  getSingleBranch,
  updateBranch,
  deleteBranch,
};
