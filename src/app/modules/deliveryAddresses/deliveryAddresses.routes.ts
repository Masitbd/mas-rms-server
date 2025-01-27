import { Router } from "express";
import { DeliveryAddressController } from "./deliveryAddresses.conroller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.get(
  "/",
  auth(
    ENUM_USER.USER,
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.CASHIER,
    ENUM_USER.MANAGER
  ),
  DeliveryAddressController.getAll
);
routes.get(
  "/default",
  auth(
    ENUM_USER.USER,
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.CASHIER,
    ENUM_USER.MANAGER
  ),
  DeliveryAddressController.getDefaultDeliveryAddress
);
routes.post("/", DeliveryAddressController.createDeliveryAddress);
routes.patch("/:id", DeliveryAddressController.update);
routes.delete("/:id", DeliveryAddressController.remove);

export const DeliveryAddressRoutes = routes;
