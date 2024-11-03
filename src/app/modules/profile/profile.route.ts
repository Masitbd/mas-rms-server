import express from "express";
import { ProfileController } from "./profile.controller";
import { ProfileValidator } from "./profileValidation";
const router = express.Router();

router.get("/", ProfileController.getSingleUserProfile);
router.patch(
  "/:uuid",

  ProfileController.updateProfile
);

export const ProfileRoutes = router;
