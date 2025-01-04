import mongoose from "mongoose";
import config from "../app/config";
import { ENUM_USER } from "../app/enums/EnumUser";
import { IProfile } from "../app/modules/profile/profile.interface";
import { Profile } from "../app/modules/profile/profile.model";
import { User } from "../app/modules/user/user.model";
import { generateUUid } from "../app/modules/user/user.utils";

export const insertSuperAdmin = async () => {
  const doesExists = await User.findOne({ role: ENUM_USER.SUPER_ADMIN });
  if (doesExists) {
    return;
  }
  const uuid = await generateUUid();
  const superAdminUserData = {
    uuid: uuid,
    role: ENUM_USER.SUPER_ADMIN,
    password: config.default_user_pass ?? "123456789",
    email: config?.super_admin_email ?? "rms@SuperAdmin.com",
  };
  const SuperAdminProfile: IProfile = {
    address: "super-admin",
    age: "30",
    dateOfBirth: new Date("1990-01-01"),
    email: "rms@SuperAdmin.com",
    fatherName: "SuperAdmin",
    gender: "Male",
    motherName: "SuperAdmin",
    name: "SuperAdmin",
    phone: "1234567890",
    uuid: uuid,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await User.create([superAdminUserData], { session });
    await Profile.create([SuperAdminProfile], { session });
    console.log("Super Admin inserted successfully");
    await session.commitTransaction();
  } catch (error) {
    console.error("Error inserting super admin", error);
    await session.abortTransaction();
  }
};
