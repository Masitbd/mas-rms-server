import { Router } from "express";
import { ItemCategoryControllers } from "./itemCategory.controller";

const routes = Router();

routes.post("/", ItemCategoryControllers.createItemCategory);
routes.get("/", ItemCategoryControllers.getAllItemCategory);

routes.patch("/:id", ItemCategoryControllers.updateItemCategory);
routes.delete("/:id", ItemCategoryControllers.deleteItemCategory);

export const ItemCategoryRoutes = routes;
