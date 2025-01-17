import { Router } from "express";
import { ItemCategoryControllers } from "./itemCategory.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";

const routes = Router();

routes.post(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  ItemCategoryControllers.createItemCategory
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
  ItemCategoryControllers.getAllItemCategory
);
routes.get("/items", ItemCategoryControllers.getItemByCategory);

routes.patch(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  ItemCategoryControllers.updateItemCategory
);
routes.delete(
  "/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  ItemCategoryControllers.deleteItemCategory
);

export const ItemCategoryRoutes = routes;
