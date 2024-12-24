import { Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IUser } from "./user.interface";
import { UserService } from "./user.service";
import pick from "../../../shared/pick";

const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const loggedInUserInfo = req.user;
    const { profile, ...userData } = req.body;
    const result = await UserService.createUser(
      profile,
      userData,
      loggedInUserInfo
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User created successfully!",
      data: result,
    });
  }
);

const getSingleUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const uuid = req?.params.uuid;
    console.log(uuid);
    const result = await UserService.getSIngleUser(uuid);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User featched successfully!",
      data: result,
    });
  }
);
const getAllUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const searchTerm = req?.query?.searchTerm;
    const filterOption = pick(req.query, ["status", "brunch"]);
    const loggedInUser = req.user;
    const paginationOption = pick(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);
    const result = await UserService.getALluser(
      searchTerm as string,
      filterOption as Record<string, string>,
      paginationOption as Record<string, string>,
      loggedInUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User featched successfully!",
      data: result,
    });
  }
);

const updateUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.patchUserProfile(
      req.params.uuid,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully!",
      data: result,
    });
  }
);

const getUserByUUid: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getSIngleUser(req.params?.uuid);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully!",
      data: result,
    });
  }
);

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params?.uuid);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Deleted successfully!",
    data: result,
  });
});

export const UserController = {
  getUserByUUid,
  createUser,
  getSingleUser,
  getAllUser,
  updateUserProfile,
  deleteUser,
};
