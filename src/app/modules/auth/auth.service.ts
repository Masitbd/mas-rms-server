import bcrypt from "bcrypt";
import { StatusCodes as httpStatus } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import ApiError from "../../errors/AppError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from "./auth.interface";
import { sendEmail } from "./sendResetMail";
import { User } from "../user/user.model";
import { IUserResponse } from "../user/user.interface";
import { Profile } from "../profile/profile.model";
import config from "../../config";
import { ENUM_PROVIDER } from "../../enums/ProviderEnum";

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password, provider } = payload;

  // IF local login no need fo password check
  if (provider == ENUM_PROVIDER.LOCAL && (!email || !password)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide email and password"
    );
  }

  const isUserExist = await User.isUserExist(payload.email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  // no need for password validation for provider login
  if (
    isUserExist.password &&
    provider == ENUM_PROVIDER.LOCAL &&
    !(await User.isPasswordMatched(password as string, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  //create access token & refresh token

  const {
    uuid: userId,
    role,
    needsPasswordChange,
    status,
    email: userMail,
    id,
    branch,
  } = isUserExist as unknown as IUserResponse;

  const profile = await Profile.findOne({ uuid: isUserExist?.uuid });
  if (!profile) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to find profile"
    );
  }

  // checking is the user is rusticate

  const accessToken = jwtHelpers.createToken(
    {
      uuid: userId,
      role,
      name: profile.name,
      email: userMail,
      status: status,
      id: id,
      branch: branch,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role, email: userMail, status },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    console.error(err);
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid Refresh Token");
  }

  const { email } = verifiedToken;

  // checking deleted user's refresh token

  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      uuid: isUserExist.uuid,
      role: isUserExist.role,
      email,
      branch: isUserExist?.branch,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  const isUserExist = await User.findOne({ id: user?.userId }).select(
    "+password"
  );

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  // checking old password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old Password is incorrect");
  }
  isUserExist.password = newPassword;
  isUserExist.needsPasswordChange = false;

  // updating using save()
  isUserExist.save();
};

const forgotPass = async (payload: { uuid: string }) => {
  const user = await User.findOne({ uuid: payload.uuid }, { uuid: 1, role: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist!");
  }

  const profile = await Profile.findOne({ uuid: payload.uuid });

  if (!profile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile not found!");
  }

  const passResetToken = await jwtHelpers.createResetToken(
    { uuid: user.uuid },
    config.jwt.secret as string,
    "50m"
  );

  const resetLink: string = config.resetlink + "/" + `${passResetToken}`;

  if (!profile?.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }

  await sendEmail(
    profile?.email,
    `
      <div>
        <p>Hi, ${profile.name}</p>
        <p>Your password reset link: <a href=${resetLink}>Click Here</a></p>
        <p>Thank you</p>
      </div>
  `
  );

  return {
    message:
      "A Password reset link Has been sent to you Email. Check your email! Also check spam",
  };
};

const resetPassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  const { newPassword, token } = payload;
  const isVarified = await jwtHelpers.verifyToken(
    token,
    config.jwt.secret as string
  );
  const user = await User.findOne({ uuid: isVarified?.uuid }, { id: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const password = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  await User.updateOne({ uuid: isVarified?.uuid }, { password });
};

//! it has some but. will fix when implementing this feature
// const changePasswordBySuperAdmin = async (
//   user: JwtPayload | null,
//   payload: { id: string; password: string }
// ) => {
//   console.log(payload);
//   if (!user?.permissions?.includes(ENUM_USER_PEMISSION.SUPER_ADMIN)) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       "You are not authorized to change the user password"
//     );
//   }

//   const isUserExist = await User.findOne({
//     uuid: payload.id,
//   }).select("+password");

//   console.log(isUserExist);

//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
//   }

//   // data update
//   isUserExist.password = payload.password;
//   isUserExist.needsPasswordChange = false;

//   // updating using save()
//   isUserExist.save();
// };

// const rusticateUser = async (payload: string) => {
//   if (!payload) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user id");
//   }

//   const doesUserExists = await User.findOne({ _id: payload });
//   if (!doesUserExists) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
//   }

//   doesUserExists.status = ENUM_STATUS.RUSTICATED;
//   const result = await User.findOneAndUpdate(
//     {
//       uuid: doesUserExists?.uuid,
//     },
//     { status: ENUM_STATUS.RUSTICATED }
//   );

//   return "User Has been successfully rusticated";
// };

// const makeUserActive = async (payload: string) => {
//   if (!payload) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user id");
//   }

//   const doesUserExists = await User.findOne({ _id: payload });
//   if (!doesUserExists) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
//   }

//   const userPermissions = await UserPermission.findOne({
//     uuid: doesUserExists?.uuid,
//   });

//   if (!userPermissions) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User permissions not found");
//   }

//   if (
//     userPermissions.permissions.length &&
//     userPermissions.permissions.includes(ENUM_USER_PEMISSION.SUPER_ADMIN)
//   ) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       "Super admin status cannot be changed"
//     );
//   }

//   doesUserExists.status = ENUM_STATUS.RUSTICATED;
//   const result = await User.findOneAndUpdate(
//     {
//       uuid: doesUserExists?.uuid,
//     },
//     { status: ENUM_STATUS.ACTIVE }
//   );

//   return "User Has been successfully Activated";
// };
export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPass,
  resetPassword,
  // changePasswordBySuperAdmin,
  // rusticateUser,
  // makeUserActive,
};
