import { Router } from "express";
import { MenuGroupControllers } from "./menuGroup.controller";

const routes = Router();

routes.post("/", MenuGroupControllers.createMenuoGroup);
routes.get("/", MenuGroupControllers.getAllMenuoGroup);

routes.patch("/:id", MenuGroupControllers.updateMenuoGroup);
routes.delete("/:id", MenuGroupControllers.deleteMenuoGroup);

export const MenuGroupRoutes = routes;
