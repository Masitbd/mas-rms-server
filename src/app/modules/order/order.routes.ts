import { Router } from "express";
import { OrderControllers } from "./order.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.get(
  "/user-orders",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.USER
  ),
  OrderControllers.getUserOrder
);
routes.post(
  "/",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  OrderControllers.createOrder
);
routes.get(
  "/",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  OrderControllers.getAllOrder
);
routes.get("/patch-data/:id", OrderControllers.getSingleOrderForPatch);
routes.get(
  "/active-table-list",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  OrderControllers.getActiveTableList
);
routes.get(
  "/kitchen-order-list/:id",
  OrderControllers.getKitchenOrderListForSingleBill
);
routes.get(
  "/active-table-list-details",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  OrderControllers.getActiveTableListDetails
);

routes.patch("/:id", OrderControllers.updateOrder);
routes.patch("/status/:id", OrderControllers.orderStatusUpdater);

routes.get("/:id", OrderControllers.getSIngleOrderWithPopulate);

routes.patch(
  "/due-collection/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  OrderControllers.dueCollection
);

routes.get(
  "/due-collection/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  OrderControllers.getDueCollectionHistory
);

export const OrderRoutes = routes;
