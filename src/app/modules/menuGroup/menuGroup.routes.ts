import { Router } from "express";
import { MenuGroupControllers } from "./menuGroup.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.post(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  MenuGroupControllers.createMenuoGroup
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
  MenuGroupControllers.getAllMenuoGroup
);

routes.patch(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  MenuGroupControllers.updateMenuoGroup
);
routes.delete(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  MenuGroupControllers.deleteMenuoGroup
);

export const MenuGroupRoutes = routes;
