import { USER_ROLE } from "../../enums/userRole.enum";

export type ILoginUser = {
  email: string;
  password: string;
};

export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
  needsPasswordChange: boolean;
};

export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IVerifiedLoginUser = {
  userId: string;
  role: USER_ROLE;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};
