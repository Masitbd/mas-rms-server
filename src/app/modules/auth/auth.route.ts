import express from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
const router = express.Router();

router.post(
  "/login",

  AuthController.loginUser
);

router.post(
  "/refresh-token",

  AuthController.refreshToken
);

router.post(
  "/change-password",
  // auth(
  //   ENUM_USER_PEMISSION.SUPER_ADMIN,
  //   ENUM_USER_PEMISSION.ADMIN,
  //   ENUM_USER_PEMISSION.USER
  // ),
  AuthController.changePassword
);
router.post("/forgot-password", AuthController.forgotPass);

router.post("/reset-password", AuthController.resetPassword);

// router.post(
//   '/change-password-by-admin',
//   validateRequest(AuthValidation.changePasswordBYAdmin),
//   auth(ENUM_USER_PEMISSION.SUPER_ADMIN),
//   AuthController.changePaswordByAdmin
// );

// router.post(
//   '/rusticate-user',
//   auth(ENUM_USER_PEMISSION.SUPER_ADMIN),
//   AuthController.rusticateUser
// );

// router.post(
//   '/activate-user',
//   auth(ENUM_USER_PEMISSION.SUPER_ADMIN),
//   AuthController.makeUserActive
// );

export const AuthRoutes = router;
