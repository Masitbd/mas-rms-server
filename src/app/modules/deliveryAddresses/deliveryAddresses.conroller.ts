import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import { DeliveryAddressServices } from "./deliveryAddresses.service";

const createDeliveryAddress = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DeliveryAddressServices.post(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Delivery Address Created Successfully",
      data: result,
    });
  }
);

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryAddressServices.patch(req.body, req?.params?.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery Address Updated Successfully",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryAddressServices.remove(req?.params?.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery Address Deleted Successfully",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryAddressServices.getAll(req.user?.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery Address Retrieved Successfully",
    data: result,
  });
});

const getSIngle = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryAddressServices.getSingle(req?.params?.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery Address Retrieved Successfully",
    data: result,
  });
});

const getDefaultDeliveryAddress = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DeliveryAddressServices.getDefaultDeliveryAddress(
      req?.user?.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Delivery Address Retrieved Successfully",
      data: result,
    });
  }
);

export const DeliveryAddressController = {
  createDeliveryAddress,
  update,
  remove,
  getAll,
  getSIngle,
  getDefaultDeliveryAddress,
};
