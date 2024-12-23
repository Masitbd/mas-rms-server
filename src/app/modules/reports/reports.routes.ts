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
routes.get("/raw-materials/sales", reportControllers.getrawMaterialOnDaiylySales);

export const reportRoutes = routes;