import express from "express";
import { ProfileController } from "./profile.controller";
import { ProfileValidator } from "./profileValidation";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
const router = express.Router();

router.get(
  "/",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.CHEF,
    ENUM_USER_PERMISSION.MANAGER,
    ENUM_USER_PERMISSION.USER,
    ENUM_USER_PERMISSION.WAITRESS
  ),
  ProfileController.getSingleUserProfile
);
router.patch(
  "/:uuid",

  ProfileController.updateProfile
);

export const ProfileRoutes = router;
