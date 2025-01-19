/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import config from "../../config";
import { IUser, UserModel } from "./user.interface";
import { ENUM_PROVIDER } from "../../enums/ProviderEnum";

const UserSchema = new Schema<IUser, UserModel>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "rusticate"],
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    provider: {
      type: String,
      enum: ["google", "facebook", "local"],
      default: ENUM_PROVIDER.LOCAL,
    },
    sub: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

UserSchema.statics.isUserExist = async function (
  email: string
): Promise<IUser | null> {
  return await User.findOne(
    { email: email },
    {
      _id: 1,
      uuid: 1,
      password: 1,
      role: 1,
      needsPasswordChange: 1,
      status: 1,
      email: 1,
      branch: 1,
    }
  );
};

UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.methods.changedPasswordAfterJwtIssued = function (
  jwtTimestamp: number
) {
  console.log({ jwtTimestamp }, "hi");
};

// User.create() / user.save()
UserSchema.pre("save", async function (next) {
  // hashing user password
  const user = this;
  if (user.provider == ENUM_PROVIDER.LOCAL && user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bycrypt_salt_rounds)
    );
  }

  if (!user.needsPasswordChange) {
    user.passwordChangedAt = new Date();
  }

  next();
});

export const User = model<IUser, UserModel>("User", UserSchema);
