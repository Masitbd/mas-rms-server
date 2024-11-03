import { Request, RequestHandler, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import { IGenericDecodedTokenData } from "../../interface/common";
import { ProfileService } from "./profile.service";

const getSingleUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProfileService.fetchSIngleUserProfileData(
      req.user as IGenericDecodedTokenData
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile fetched successfully!",
      data: result,
    });
  }
);
const updateProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProfileService.patchProfile(req.params.uuid, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Updated successfully!",
      data: result,
    });
  }
);

export const ProfileController = { getSingleUserProfile, updateProfile };
