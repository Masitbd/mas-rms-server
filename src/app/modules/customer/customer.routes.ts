import { Router } from "express";
import { CustomerControllers } from "./customer.controller";

const routes = Router();

routes.post("/", CustomerControllers.createCustomer);
routes.get("/", CustomerControllers.getAllCustomer);
routes.get("/:id", CustomerControllers.getSingleCustomer);
routes.patch("/:id", CustomerControllers.updateCustomer);
routes.delete("/:id", CustomerControllers.deleteCustomer);
// routes.get(
//   "/discount-code/:discountCard",
//   CustomerControllers.getCustomerByDiscountCode
// );

export const CustomerRoutes = routes;
