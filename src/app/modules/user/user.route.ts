import express from "express";
import { UserController } from "./user.controller";
const router = express.Router();

router.post("/", UserController.createUser);
router.get("/", UserController.getAllUser);
router.patch("/:uuid", UserController.updateUser);
router.get("/:uuid", UserController.getUserByUUid);
export const UserRoutes = router;
