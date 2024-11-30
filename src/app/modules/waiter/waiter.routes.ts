import { Router } from "express";
import { WaiterControllers } from "./waiter.controller";

const routes = Router();

routes.post("/", WaiterControllers.createWaiter);
routes.get("/", WaiterControllers.getAllWaiter);

routes.patch("/:id", WaiterControllers.updateWaiter);
routes.delete("/:id", WaiterControllers.deleteWaiter);

export const WaiterRoutes = routes;
