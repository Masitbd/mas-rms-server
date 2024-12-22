import express from "express";
import { UserController } from "./user.controller";
const router = express.Router();

router.post("/", UserController.createUser);
router.get("/", UserController.getAllUser);
router.patch("/profile/:uuid", UserController.updateUserProfile);
router.get("/:uuid", UserController.getUserByUUid);
router.delete("/:uuid", UserController.deleteUser);
export const UserRoutes = router;
