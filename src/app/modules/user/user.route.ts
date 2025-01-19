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
    ENUM_USER.USER,
    ENUM_USER.CASHIER,
    ENUM_USER.ACCOUNTANT
  ),
  UserController.createUser
);
router.get(
  "/",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN, ENUM_USER.MANAGER),
  UserController.getAllUser
);
router.patch("/profile/:uuid", UserController.updateUserProfile);

router.patch(
  "/change-password-admin/:id",
  auth(ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN),
  UserController.changePasswordByAdmin
);
router.get("/:uuid", UserController.getUserByUUid);
router.delete("/:uuid", UserController.deleteUser);

router.post("/user-sign-up", UserController.userSignUp);
export const UserRoutes = router;
