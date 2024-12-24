import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { ENUM_USER } from "../../enums/EnumUser";
const router = express.Router();

router.post(
  "/",
  auth(
    ENUM_USER.SUPER_ADMIN,
    ENUM_USER.ADMIN,
    ENUM_USER.MANAGER,
    ENUM_USER.USER
  ),
  UserController.createUser
);
router.get(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  UserController.getAllUser
);
router.patch("/profile/:uuid", UserController.updateUserProfile);
router.get("/:uuid", UserController.getUserByUUid);
router.delete("/:uuid", UserController.deleteUser);
export const UserRoutes = router;
