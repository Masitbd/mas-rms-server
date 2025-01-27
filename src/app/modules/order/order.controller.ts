import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { OrderServices } from "./order.services";
import sendResponse from "../../../shared/sendResponse";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const loggedInuserInfo = req.user;
  const result = await OrderServices.createOrderIntoDB(
    req.body,
    loggedInuserInfo
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Order Created Succesfully",
    success: true,
    data: result,
  });
});

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const loggedInUserInfo = req.user;
  const result = await OrderServices.getAllOderFromDB(
    req.query,
    loggedInUserInfo
  );
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
  const result = await OrderServices.getActiveTableList(req.user);
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

const getActiveTableListDetails = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getActiveTableListDetails(req.user);
    sendResponse(res, {
      statusCode: 200,
      message: "Active Table List Details Retrieved Successfully",
      success: true,
      data: result,
    });
  }
);

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.updateOrder(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Order Updated Successfully",
    success: true,
    data: result,
  });
});

const orderStatusUpdater = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.changeStatus(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Order status changed Successfully",
    success: true,
    data: result,
  });
});

const getSIngleOrderWithPopulate = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OrderServices.getSIngleOrderWithPopulate(id);
    sendResponse(res, {
      statusCode: 200,
      message: "Order Retrieved Successfully",
      success: true,
      data: result,
    });
  }
);

const dueCollection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.dueCollection(id, req.body, req.user);
  sendResponse(res, {
    statusCode: 200,
    message: "Dew Amount deducted Successfully",
    success: true,
    data: result,
  });
});

const getDueCollectionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OrderServices.getDueCollectionHistory(id);
    sendResponse(res, {
      statusCode: 200,
      message: "Dew Collection History Retrieved Successfully",
      success: true,
      data: result,
    });
  }
);

const getUserOrder = catchAsync(async (req: Request, res: Response) => {
  console.log(req?.user);
  const result = await OrderServices.getUserOrder(req?.user?.id);
  sendResponse(res, {
    statusCode: 200,
    message: "User Order History Retrieved Successfully",
    success: true,
    data: result,
  });
});
export const OrderControllers = {
  createOrder,
  getAllOrder,
  getSingleOrderForPatch,
  getActiveTableList,
  getKitchenOrderListForSingleBill,
  getActiveTableListDetails,
  updateOrder,
  orderStatusUpdater,
  getSIngleOrderWithPopulate,
  dueCollection,
  getDueCollectionHistory,
  getUserOrder,
};
