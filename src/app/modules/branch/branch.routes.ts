import { Router } from "express";
import { BranchControllers } from "./branch.controller";

const routes = Router();
routes.get("/does-deliver/:location", BranchControllers.getDoesDeliver);
routes.get("/", BranchControllers.getAllBranch);
routes.get("/:id", BranchControllers.getSingleBranch);
routes.post("/", BranchControllers.createBranch);
routes.patch("/:id", BranchControllers.updateBranch);
routes.delete("/:id", BranchControllers.deleteBranch);

routes.get("/deliverable-city/:division", BranchControllers.getDeliverableCIty);
routes.get("/deliverable-zone/zone", BranchControllers.getDeliveryZones);

export const BranchRoutes = routes;
