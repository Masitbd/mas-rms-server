/* eslint-disable @typescript-eslint/no-explicit-any */
import { OAuth2Client, TokenPayload } from "google-auth-library";
import config from "../../config";
import { User } from "./user.model";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Profile } from "../profile/profile.model";
import { IUser } from "./user.interface";
import { IProfile } from "../profile/profile.interface";
import { generateUUid } from "./user.utils";
import { ENUM_PROVIDER } from "../../enums/ProviderEnum";

export async function handleGoogleLogin(idToken: string, provider: string) {
  const client = new OAuth2Client(config.google_client_id);

  // generate custom uuid
  try {
    // Verify the ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google_client_id,
    });
    const payload = ticket.getPayload();

    if (!payload?.email_verified) {
      throw new Error("Email not verified");
    }
    // Extract user info
    const { sub, email, name } = payload as TokenPayload;

    // Check if the user already exists
    let user = await User.findOne({
      provider: ENUM_PROVIDER.GOOGLE,
      sub,
      email: email,
    });

    // if user does not exists began user creation process
    if (!user) {
      user = (await userCreator({
        email: email as string,
        provider: provider as string,
        sub,
        name: name as string,
      })) as any;
    }

    return user;
  } catch (error) {
    console.error("Google login error:", error);
    throw new AppError(StatusCodes.BAD_REQUEST, error as string);
  }
}

export const userCreator = async (payload: {
  name: string;
  email: string;
  provider?: string;
  sub?: string;
  password?: string;
}): Promise<IUser & IProfile> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const uuid = await generateUUid();
    const newProfile = await Profile.create([{ ...payload, uuid: uuid }], {
      session,
    });
    if (!newProfile.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Failed to create profile");
    }

    const user = await User.create(
      [
        {
          uuid: uuid, // Function to generate a unique ID
          ...payload,
          role: "user", // Default role
          profile: newProfile[0]._id,
        },
      ],
      { session }
    );

    const populaetdUser = { ...user, ...newProfile };
    await session.commitTransaction();
    return populaetdUser as unknown as IUser & IProfile;
  } catch (error) {
    await session.abortTransaction();
    console.error("User creation error:", error);
    throw new AppError(StatusCodes.BAD_REQUEST, error as string);
  } finally {
    await session.endSession();
  }
};
