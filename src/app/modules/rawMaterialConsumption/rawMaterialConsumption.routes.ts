import express from "express";
import { RawMaterialConsumptionController } from "./rawMaterialConsumption.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";
const router = express.Router();

router.post(
  "/",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialConsumptionController.create
);
router.patch(
  "/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialConsumptionController.update
);
router.get(
  "/",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialConsumptionController.getAll
);
router.get(
  "/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialConsumptionController.getSingle
);
router.delete(
  "/:id",
  auth(
    ENUM_USER.MANAGER,
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT,
    ENUM_USER.ADMIN,
    ENUM_USER.SUPER_ADMIN
  ),
  RawMaterialConsumptionController.remove
);
export const RawMaterialConsumptionRouter = router;
