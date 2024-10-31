import { Router } from "express";
import { TableControllers } from "./table.controller";

const routes = Router();

routes.post("/", TableControllers.createTable);
routes.get("/", TableControllers.getAllTableList);
routes.get("/:id", TableControllers.getSingleTable);
routes.patch("/:id", TableControllers.updateTable);

export const TableRoutes = routes;
