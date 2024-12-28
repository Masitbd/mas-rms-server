import { Router } from "express";
import { WaiterControllers } from "./waiter.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.post(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  WaiterControllers.createWaiter
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
  WaiterControllers.getAllWaiter
);

routes.patch(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  WaiterControllers.updateWaiter
);
routes.delete(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  WaiterControllers.deleteWaiter
);

export const WaiterRoutes = routes;
