/* eslint-disable no-unused-vars */
import { Model, Types } from "mongoose";
import { IProfile } from "../profile/profile.interface";
import { TBranch } from "../branch/branch.interface";

export type IUser = {
  uuid: string;
  role: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  profile?: Types.ObjectId | IProfile;
  status: string;
  email: string;
  branch: Types.ObjectId;
};

export type IUserResponse = {
  id: string;
  uuid: string;
  role: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  profile?: IProfile;
  status: string;
  email: string;
  branch: TBranch;
};
export type UserModel = {
  isUserExist(
    uuid: string
  ): Promise<
    Pick<IUser, "uuid" | "password" | "role" | "needsPasswordChange" | "branch">
  >;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;

export const userFilterableFields = ["status", "branch"];
