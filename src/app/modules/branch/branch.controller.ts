import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { BranchSerives } from "./branch.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";

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

const getDeliverableCIty = catchAsync(async (req: Request, res: Response) => {
  const { division } = req.params;
  const result = await BranchSerives.getDeliverableCity(division);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "City Fetched Successfully",
    data: result,
  });
});

const getDeliveryZones = catchAsync(async (req: Request, res: Response) => {
  const params = pick(req.query, ["division", "city"]);
  console.log(params);

  const result = await BranchSerives.getDeliveryZones(
    params?.division as string,
    params?.city as string
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "ZOnes Fetched Successfully",
    data: result,
  });
});
const getDoesDeliver = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchSerives.getDoesDeliver(req?.params?.location);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery Location retrived Successfully",
    data: result,
  });
});
export const BranchControllers = {
  createBranch,
  getAllBranch,
  getSingleBranch,
  updateBranch,
  deleteBranch,
  getDeliverableCIty,
  getDeliveryZones,
  getDoesDeliver,
};
