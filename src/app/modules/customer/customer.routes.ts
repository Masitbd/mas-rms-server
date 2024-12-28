import { Router } from "express";
import { CustomerControllers } from "./customer.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.post(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  CustomerControllers.createCustomer
);
routes.get(
  "/",
  auth(
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.MANAGER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.CASHIER,
    ENUM_USER.USER
  ),
  CustomerControllers.getAllCustomer
);
routes.get("/:id", CustomerControllers.getSingleCustomer);
routes.patch(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  CustomerControllers.updateCustomer
);
routes.delete(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  CustomerControllers.deleteCustomer
);
routes.get(
  "/discount-code/:discountCard",
  CustomerControllers.getCustomerByDiscountCode
);

export const CustomerRoutes = routes;
