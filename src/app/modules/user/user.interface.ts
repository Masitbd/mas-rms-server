/* eslint-disable no-unused-vars */
import { Model, Types } from "mongoose";
import { IProfile } from "../profile/profile.interface";

export type IUser = {
  uuid: string;
  role: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  profile?: Types.ObjectId | IProfile;
  status: string;
  email: string;
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
};
export type UserModel = {
  isUserExist(
    uuid: string
  ): Promise<Pick<IUser, "uuid" | "password" | "role" | "needsPasswordChange">>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;
