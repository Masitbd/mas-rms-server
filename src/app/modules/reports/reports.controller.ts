import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { reportServices } from "./report.service";

const getDailyStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getDailyStatementFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Daily Statement retrived successfully",
    data: result,
  });
});

//
const getDailySatesStatementSummery = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getDailySalesStatementSummeryFromDB(
      req.query
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Daily Statement summery retrived successfully",
      data: result,
    });
  }
);

//

const getItemWiseSalesSatement = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getItemWiseSalesSatetementFromDB(
      req.query
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Item wises sales Statement  retrived successfully",
      data: result,
    });
  }
);

const getMenuGroupItems = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getMenuGroupWithItemsFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Menu Group Item retrived successfully",
    data: result,
  });
});

export const reportControllers = {
  getDailyStatement,
  getDailySatesStatementSummery,
  getItemWiseSalesSatement,
  getMenuGroupItems,
};
