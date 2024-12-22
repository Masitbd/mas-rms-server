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

export const reportRoutes = routes;
