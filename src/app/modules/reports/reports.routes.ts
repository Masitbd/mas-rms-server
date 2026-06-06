import { Router } from "express";
import { reportControllers } from "./reports.controller";
import auth from "../../middleware/auth";

const routes = Router();

routes.get("/daily-statement", auth(), reportControllers.getDailyStatement);
routes.get(
  "/daily-statement-summery",
  auth(),
  reportControllers.getDailySatesStatementSummery
);
routes.get(
  "/itemwise-sales",
  auth(),
  reportControllers.getItemWiseSalesSatement
);

routes.get(
  "/itemwise-sales-v2",
  auth(),
  reportControllers.getItemWiseSalesStatement_v2
);
routes.get("/menugroup-items", auth(), reportControllers.getMenuGroupItems);
routes.get(
  "/menuitem-consumption",
  auth(),
  reportControllers.getMenuItemConsumption
);
routes.get("/menuitem-costing", reportControllers.getMenuItemsCosting);
routes.get(
  "/raw-materials/sales",
  auth(),
  reportControllers.getrawMaterialOnDaiylySales
);
routes.get(
  "/raw-material-consumption",
  auth(),
  reportControllers.getRawMaterialConsumption
);
routes.get(
  "/item/raw-materials",
  auth(),
  reportControllers.getItemWiseRawMaterailsConsumption
);
routes.get(
  "/sales/due-statement",
  auth(),
  reportControllers.getDueSalesStatement
);
routes.get("/waiter-wise-sales", auth(), reportControllers.getWaiterWiseSales);
routes.get("/waiter-wise-sales-v2", auth(), reportControllers.getWaiterWiseSales_v2);
routes.get(
  "/waiter-wise-sales/statement",
  auth(),
  reportControllers.getWaiterWiseSalesStatement
);
routes.get(
  "/dashboard-statistics",
  auth(),
  reportControllers.getDashboardStatisticsData
);

export const reportRoutes = routes;
