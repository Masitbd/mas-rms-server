import { Router } from "express";
import { BranchControllers } from "./branch.controller";

const routes = Router();

routes.get("/", BranchControllers.getAllBranch);
routes.get("/:id", BranchControllers.getSingleBranch);
routes.post("/", BranchControllers.createBranch);
routes.patch("/:id", BranchControllers.updateBranch);
routes.delete("/:id", BranchControllers.deleteBranch);

export const BranchRoutes = routes;
