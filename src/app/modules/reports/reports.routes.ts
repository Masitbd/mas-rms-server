import { Router } from "express";
import { reportControllers } from "./reports.controller";

const routes = Router();

routes.get("/daily-statement", reportControllers.getDailyStatement);
routes.get(
  "/daily-statement-summery",
  reportControllers.getDailySatesStatementSummery
);
routes.get("/itemwise-sales", reportControllers.getItemWiseSalesSatement);
routes.get("/menugroup-items", reportControllers.getMenuGroupItems);
routes.get("/menuitem-consumption", reportControllers.getMenuItemsConsumption);
routes.get("/menuitem-costing", reportControllers.getMenuItemsCosting);
routes.get(
  "/raw-materials/sales",
  reportControllers.getrawMaterialOnDaiylySales
);
routes.get(
  "/item/raw-materials",
  reportControllers.getItemWiseRawMaterailsConsumption
);
routes.get("/sales/due-statement", reportControllers.getSalesDueStatement);
routes.get("/waiter-wise-sales", reportControllers.getWaiterWiseSales);
routes.get(
  "/waiter-wise-sales/statement",
  reportControllers.getWaiterWiseSalesStatement
);

export const reportRoutes = routes;
