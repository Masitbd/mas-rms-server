import { ENUM_USER_STATUS } from "../../enums/userStatus.enum";
import ApiError from "../../errors/AppError";
import { IGenericDecodedTokenData } from "../../interface/common";
import { User } from "../user/user.model";
import { IProfile } from "./profile.interface";
import { Profile } from "./profile.model";
import { StatusCodes as httpStatus } from "http-status-codes";

const fetchSIngleUserProfileData = async (data: IGenericDecodedTokenData) => {
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
      $project: {
        password: 0,
      },
    },
  ]);

  if (result[0]?.status == ENUM_USER_STATUS) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your acount has been rusticate");
  }
  return result;
};

const patchProfile = async (uuid: string, profileData: Partial<IProfile>) => {
  const result = await Profile.findOneAndUpdate({ uuid: uuid }, profileData, {
    new: true,
  });
  return result;
};
export const ProfileService = { fetchSIngleUserProfileData, patchProfile };
