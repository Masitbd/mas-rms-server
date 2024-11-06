import express from "express";
import { RawMaterialController } from "./rawMaterial.controller";
const routes = express.Router();

routes.post("/", RawMaterialController.create);
routes.patch("/", RawMaterialController.update);
routes.get("/", RawMaterialController.getAll);
routes.get("/:id", RawMaterialController.getSingle);
routes.delete("/:id", RawMaterialController.removeSingle);

export const RawMaterialRoutes = routes;
