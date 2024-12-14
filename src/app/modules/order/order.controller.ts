import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { OrderServices } from "./order.services";
import sendResponse from "../../../shared/sendResponse";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.createOrderIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Order Created Succesfully",
    success: true,
    data: result,
  });
});

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getAllOderFromDB(req.query);
  sendResponse(res, {
    statusCode: 200,
    message: "Order Retrieved Succesfully",
    success: true,
    data: result,
  });
});

const getSingleOrderForPatch = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getSingleOrderForPatch(req.params?.id);
    sendResponse(res, {
      statusCode: 200,
      message: "Order Retrieved Successfully",
      success: true,
      data: result,
    });
  }
);

const getActiveTableList = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getActiveTableList();
  sendResponse(res, {
    statusCode: 200,
    message: "Active Table List Retrieved Successfully",
    success: true,
    data: result,
  });
});

const getKitchenOrderListForSingleBill = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getKitchenOrderListForSingleBill(
      req?.params?.id
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Kitchen Order list Retrieved Successfully",
      success: true,
      data: result,
    });
  }
);
export const OrderControllers = {
  createOrder,
  getAllOrder,
  getSingleOrderForPatch,
  getActiveTableList,
  getKitchenOrderListForSingleBill,
};
