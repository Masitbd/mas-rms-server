import { Router } from "express";
import { TableControllers } from "./table.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.post(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  TableControllers.createTable
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
  TableControllers.getAllTableList
);
routes.get("/:id", TableControllers.getSingleTable);
routes.patch(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  TableControllers.updateTable
);
routes.delete(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  TableControllers.deleteTable
);

export const TableRoutes = routes;
