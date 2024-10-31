import { Router } from "express";
import { CustomerControllers } from "./customer.controller";

const routes = Router();

routes.post("/", CustomerControllers.createCustomer);
routes.get("/", CustomerControllers.getAllCustomer);
routes.get("/:id", CustomerControllers.getSingleCustomer);
routes.patch("/:id", CustomerControllers.updateCustomer);

export const CustomerRoutes = routes;
