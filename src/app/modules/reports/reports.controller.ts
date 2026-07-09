import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { reportServices } from "./report.service";

const getDailyStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getDailyStatementFromDB(
    req.query,
    req.user,
  );
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
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Daily Statement summery retrived successfully",
      data: result,
    });
  },
);

//

const getItemWiseSalesSatement = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getItemWiseSalesSatetementFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Item wises sales Statement  retrived successfully",
      data: result,
    });
  },
);

const getItemWiseSalesStatement_v2 = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getItemWiseSalesStatementFormDB_v2(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Item wises sales Statement retrieved successfully",
      data: result,
    });
  },
);

const getMenuGroupItems = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getMenuGroupWithItemsFromDB(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Menu Group Item retrived successfully",
    data: result,
  });
});

const getMenuItemsConsumption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getMenuItemsAndConsumptionFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu Item consumtion retrived successfully",
      data: result,
    });
  },
);

const getMenuItemConsumption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getMenuItemConsumptionReportFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu item consumption retrieved successfully",
      data: result,
    });
  },
);

const getMenuItemsCosting = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getMenuItemsAndCostingFromDB(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Menu Item consting retrived successfully",
    data: result,
  });
});
const getrawMaterialOnDaiylySales = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getRawMaterialConsumptionSalesFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Raw material on sales retrived successfully",
      data: result,
    });
  },
);
const getRawMaterialConsumption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getRawMaterialConsumptionServiceFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Raw material consumption retrieved successfully",
      data: result,
    });
  },
);
const getItemWiseRawMaterailsConsumption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getItemWiseRawMaterialConsumptionFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "item Raw material retrived successfully",
      data: result,
    });
  },
);
const getSalesDueStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getSaledDueStatementFromDB(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Sales Due Statement retrived successfully",
    data: result,
  });
});

const getDueSalesStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getDueSalesStatementReportFromDB(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Due sales statement retrieved successfully",
    data: result,
  });
});

const getWaiterWiseSales_v2 = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getWaiterWiseSalesFromDB_v2(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Waiter wise sales retrived successfully",
    data: result,
  });
});

const getWaiterWiseSales = catchAsync(async (req: Request, res: Response) => {
  const result = await reportServices.getWaiteWiseSalesFromDB(
    req.query,
    req.user,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Waiter wise sales retrived successfully",
    data: result,
  });
});
const getWaiterWiseSalesStatement = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getWaiterWiseSalesStatementFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Waiter wise sales statement retrived successfully",
      data: result,
    });
  },
);
const getDashboardStatisticsData = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getDashboardStatisticsDataFromDB();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard data retrived successfully",
      data: result,
    });
  },
);

const getKitchenOrderCostReport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reportServices.getKitchenOrderCostReportFromDB(
      req.query,
      req.user,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Kitchen orders cost report retrieved successfully",
      data: result,
    });
  },
);

export const reportControllers = {
  getDailyStatement,
  getDailySatesStatementSummery,
  getItemWiseSalesSatement,
  getMenuGroupItems,
  getMenuItemsConsumption,
  getMenuItemConsumption,
  getMenuItemsCosting,
  getrawMaterialOnDaiylySales,
  getItemWiseRawMaterailsConsumption,
  getSalesDueStatement,
  getDueSalesStatement,
  getWaiterWiseSales,
  getWaiterWiseSales_v2,
  getWaiterWiseSalesStatement,
  getDashboardStatisticsData,
  getItemWiseSalesStatement_v2,
  getRawMaterialConsumption,
  getKitchenOrderCostReport,
};
