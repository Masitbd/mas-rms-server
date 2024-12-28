import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CustomerSevices } from "./customer.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user; //? add branch id to table object
  const result = await CustomerSevices.createCustomerIntoDB(
    req.body,
    loggedInUserInfo
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "created Successfully",
    data: result,
  });
});

//  get all

const getAllCustomer = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await CustomerSevices.getAllCustomerIntoDB(loggedInUserInfo);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Retrieved Successfully",
    data: result,
  });
});

// ge single

const getSingleCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerSevices.getSingleCustomerIntoDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Retrived Successfully",
    data: result,
  });
});

//  update

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CustomerSevices.updateCustomerIntoDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "updated Successfully",
    data: result,
  });
});

// ! delete

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CustomerSevices.deleteCustomerFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Deleted Successfully",
    data: result,
  });
});

const getCustomerByDiscountCode = catchAsync(
  async (req: Request, res: Response) => {
    const { discountCard } = req.params;

    const result =
      await CustomerSevices.getCustomerByDiscountCode(discountCard);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Customer Retrieved successfully",
      data: result,
    });
  }
);
//  exports

export const CustomerControllers = {
  createCustomer,
  getAllCustomer,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerByDiscountCode,
};
