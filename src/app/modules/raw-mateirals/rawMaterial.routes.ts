import express from "express";
import { RawMaterialController } from "./rawMaterial.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";
const routes = express.Router();

routes.post(
  "/",

  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialController.create
);
routes.patch(
  "/",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialController.update
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
  RawMaterialController.getAll
);
routes.get(
  "/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialController.getSingle
);
routes.delete(
  "/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialController.removeSingle
);

export const RawMaterialRoutes = routes;
