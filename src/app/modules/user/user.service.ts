import { StatusCodes as httpStatus, StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import config from "../../config/index";
import ApiError from "../../errors/AppError";
import { IProfile } from "../profile/profile.interface";
import { Profile } from "../profile/profile.model";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { generateUUid } from "./user.utils";
import AppError from "../../errors/AppError";

const createUser = async (
  profile: IProfile,
  user: IUser
): Promise<IUser | null> => {
  // If password is not given,set default password
  if (!user.password) {
    user.password = config.default_user_pass as string;
  }

  let newUserAllData = null;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // generate custom uuid
    const id = await generateUUid();
    // set custom id
    user.uuid = id;
    profile.uuid = id;

    // Checking if th email already exists
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
    // Create profile using sesssin
    const newProfile = await Profile.create([profile], { session });

    if (!newProfile.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create profile");
    }

    user.profile = newProfile[0]._id;

    // Creating new user using sesssin
    const newUser = await User.create([user], { session });

    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create user");
    }

    newUserAllData = newUser[0];

    await session.commitTransaction();
  } catch (error) {
    console.error(error);
    await session.abortTransaction();

    throw new AppError(StatusCodes.BAD_REQUEST, error as string);
  } finally {
    await session.endSession();
  }

  // if (newUserAllData) {
  //   newUserAllData = await User.findOne({ id: newUserAllData.id }).populate({
  //     path: "profile",
  //   });
  // }

  return newUserAllData;
};

const getSIngleUser = async (data: Partial<IUser>) => {
  const result = await User.aggregate([
    {
      $match: {
        uuid: data.uuid,
      },
    },
    {
      $lookup: {
        from: "profiles",
        localField: "uuid",
        foreignField: "uuid",
        as: "profile",
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$permissions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        password: 0,
      },
    },
  ]);

  return result[0];
};

const getALluser = async () => {
  const result = await Profile.aggregate([
    {
      $lookup: {
        from: "userpermissions",
        localField: "uuid",
        foreignField: "uuid",
        as: "permissions",
      },
    },
    {
      $unwind: {
        path: "$permissions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "uuid",
        foreignField: "uuid",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "user.password": 0,
        "user.permissions": 0,
      },
    },
  ]);

  return result;
};

const patchUser = async (uuid: string, data: Partial<IUser>) => {
  const result = await User.findOneAndUpdate({ uuid: uuid }, data, {
    new: true,
  });
  return result;
};

export const UserService = {
  createUser,
  getSIngleUser,
  getALluser,
  patchUser,
};
