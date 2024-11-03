import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TableServices } from "./table.services";
import { Request, Response } from "express";

const createTable = catchAsync(async (req: Request, res: Response) => {
  const result = await TableServices.createTableIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Table Created Successfully",
    data: result,
  });
});

//  get all

const getAllTableList = catchAsync(async (req: Request, res: Response) => {
  const cookie = req.headers?.authorization;
  console.log(cookie);
  const result = await TableServices.getAllTableListFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Table Retrived Successfully",
    data: result,
  });
});

// get single

const getSingleTable = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await TableServices.getSingleTableFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Table Retrived Successfully",
    data: result,
  });
});

//  update

const updateTable = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await TableServices.updateTableIntoDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Table Updated Successfully",
    data: result,
  });
});

//  exports

export const TableControllers = {
  createTable,
  getAllTableList,
  getSingleTable,
  updateTable,
};
