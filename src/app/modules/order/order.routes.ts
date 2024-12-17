import { Router } from "express";
import { OrderControllers } from "./order.controller";

const routes = Router();

routes.post("/", OrderControllers.createOrder);
routes.get("/", OrderControllers.getAllOrder);
routes.get("/patch-data/:id", OrderControllers.getSingleOrderForPatch);
routes.get("/active-table-list", OrderControllers.getActiveTableList);
routes.get(
  "/kitchen-order-list/:id",
  OrderControllers.getKitchenOrderListForSingleBill
);

export const OrderRoutes = routes;
