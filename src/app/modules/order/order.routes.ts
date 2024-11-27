import { Router } from "express";
import { OrderControllers } from "./order.controller";

const routes = Router();

routes.post("/", OrderControllers.createOrder);
routes.get("/", OrderControllers.getAllOrder);

export const OrderRoutes = routes;
