import { StatusCodes as httpStatus, StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import config from "../../config/index";
import ApiError from "../../errors/AppError";
import { IProfile } from "../profile/profile.interface";
import { Profile } from "../profile/profile.model";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { generateUUid } from "./user.utils";
import AppError from "../../errors/AppError";
import { USER_ROLE } from "../../enums/userRole.enum";
import { userFinderAggregationBuilder } from "./user.helper";
import { IOptions, paginationHelpers } from "../../helpers/paginationHelper";
import { JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../../enums/EnumUser";
import bcrypt from "bcrypt";
import { ENUM_PROVIDER } from "../../enums/ProviderEnum";
import { AuthService } from "../auth/auth.service";
import { handleGoogleLogin, userCreator } from "./user.halper";
const createUser = async (
  profile: IProfile,
  user: IUser,
  loggedInUserInfo: JwtPayload
): Promise<IUser | null> => {
  if (
    loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
    loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
  ) {
    if (user.role == ENUM_USER.ADMIN || user.role == ENUM_USER.SUPER_ADMIN) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You are not authorized to perform this action"
      );
    }

    if (user?.role !== ENUM_USER.USER && !user?.branch) {
      user.branch = loggedInUserInfo?.branch;
    }
  }

  // set the provider t local
  user.provider = ENUM_PROVIDER.LOCAL;

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

  return newUserAllData;
};

const getSIngleUser = async (uuid: string) => {
  const result = await User.aggregate([
    {
      $match: {
        uuid: uuid,
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
      $project: {
        password: 0,
      },
    },
  ]);

  return result[0];
};

const getALluser = async (
  searchTerm: string,
  filterOptions: Record<string, string>,
  paginationOptions: Record<string, string>,
  loggedInUser: JwtPayload
) => {
  console.log(loggedInUser);
  if (
    loggedInUser.role !== ENUM_USER.ADMIN &&
    loggedInUser.role !== ENUM_USER.SUPER_ADMIN
  ) {
    filterOptions.branch = new Types.ObjectId(
      loggedInUser.branch
    ) as unknown as string;
  }

  const searchablefields = ["name", "email", "phone", "uuid"];
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions as IOptions);

  const result = await Profile.aggregate(
    userFinderAggregationBuilder(searchablefields, searchTerm, filterOptions)
  )
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const totalDocument = await User.estimatedDocumentCount();
  return {
    data: result,
    meta: {
      page: page,
      limit: limit,
      total: totalDocument,
    },
  };
};

const patchUserProfile = async (
  uuid: string,
  data: Partial<IProfile & { branch: string }>
) => {
  const { branch, ...rest } = data;
  if (branch) {
    await User.findOneAndUpdate({ uuid: uuid }, { branch: branch });
  }

  if (rest?.email) {
    await User.findOneAndUpdate({ uuid: uuid }, { email: rest?.email });
  }
  const result = await Profile.findOneAndUpdate({ uuid: uuid }, rest, {
    new: true,
  });

  return result;
};

const deleteUser = async (uuid: string) => {
  if (!uuid) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User ID is required"); // validate user id before deleting it.  If not provided, return an error message.  This is a basic validation and should be replaced with proper validation logic for production.  For example, you can use Joi or a similar library for validation.  In a real-world application, you should also check if the user has sufficient permissions to delete the user.  Also, you should consider implementing a soft-delete mechanism instead of hard-deleting users, as it provides a better audit trail.  In this example, we're hard-deleting the user.  If you want to implement soft-delete, you should update the user status to 'deleted' instead of deleting it.  You would also need to update the related documents (if any) to reference the deleted user.  Finally, you should consider implementing a background job system to handle the deletion of deleted users.
  }
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const user = await User.findOne({ uuid: uuid }).session(session);
    const profile = await Profile.findOne({ uuid: uuid }).session(session);
    if (user?.role == USER_ROLE.SUPER_ADMIN) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not allowed to delete super admin user"
      );
    }
    if (!user || !profile) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User not found");
    }
    await Promise.all([
      user.deleteOne({ session }),
      profile.deleteOne({ session }),
    ]);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error as string);
  } finally {
    await session.endSession();
  }
};

const changePasswordByAdmin = async (
  id: string,
  data: { password: string }
) => {
  const doesUserExists = await User.findOne({ uuid: id });
  if (!doesUserExists) {
    throw new ApiError(404, "User not found");
  }

  const result = await User.findOneAndUpdate(
    { uuid: id },
    {
      password: await bcrypt.hash(
        data.password,
        Number(config.bycrypt_salt_rounds)
      ),
    }
  );

  if (!result) {
    throw new ApiError(400, "Failed to update password");
  }
  return;
};

const userSignUp = async (user: IUser & IProfile) => {
  // For local sign up
  if (user.provider == ENUM_PROVIDER.LOCAL) {
    const doesExists = await User.findOne({ email: user.email });
    if (doesExists) {
      throw new ApiError(409, "Email already exists");
    }
    const result = await userCreator(user);
    return "User created successfully";
  }

  // For provider signup
  if (
    user.provider == ENUM_PROVIDER.GOOGLE ||
    user.provider == ENUM_PROVIDER.FACEBOOK
  ) {
    // if user exists then begin the login process

    // Begin varificatoin process for google
    if (user.provider == ENUM_PROVIDER.GOOGLE) {
      const userInfo = await handleGoogleLogin(
        user?.idToken as string,
        user.provider
      );

      console.log(userInfo);
      const loggedInInfo = await AuthService.loginUser({
        email: userInfo?.email as string,
        provider: ENUM_PROVIDER.GOOGLE,
      });
      return loggedInInfo;
    }
  }
};

export const UserService = {
  createUser,
  getSIngleUser,
  getALluser,
  patchUserProfile,
  deleteUser,
  changePasswordByAdmin,
  userSignUp,
};
