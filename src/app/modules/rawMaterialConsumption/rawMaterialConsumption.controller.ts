import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import rawMaterialConsumptionService from "./rawMaterialConsumption.service";
import pick from "../../../shared/pick";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await rawMaterialConsumptionService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully created",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await rawMaterialConsumptionService.update(
    req?.params?.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully update",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await rawMaterialConsumptionService.delete(req?.params?.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully deleted",
    data: result,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await rawMaterialConsumptionService.fetchById(req?.params?.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully deleted",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const paginationOpeion = pick(req.query, ["page", "limit", "skip"]);
  const searchOption = pick(req.query, ["searchTerm"]);
  const result = await rawMaterialConsumptionService.fetchAll({
    limit: Number(paginationOpeion?.limit ?? 10),
    page: Number(paginationOpeion?.page ?? 1),
    search: (searchOption?.searchTerm as string) ?? "",
  });
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully deleted",
    data: result?.items,
    meta: {
      limit: result?.limit,
      page: result?.page,
      total: result?.total,
    },
  });
});

export const RawMaterialConsumptionController = {
  create,
  update,
  remove,
  getSingle,
  getAll,
};
