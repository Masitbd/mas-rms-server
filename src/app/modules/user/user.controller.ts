import { Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IUser } from "./user.interface";
import { UserService } from "./user.service";

const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { profile, ...userData } = req.body;
    const result = await UserService.createUser(profile, userData);

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
    const result = await UserService.getSIngleUser(req.user as IUser);

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
    const result = await UserService.getALluser();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User featched successfully!",
      data: result,
    });
  }
);

const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.patchUser(req.params.uuid, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User created successfully!",
      data: result,
    });
  }
);

const getUserByUUid: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getSIngleUser({ uuid: req.params.uuid });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User created successfully!",
      data: result,
    });
  }
);
export const UserController = {
  getUserByUUid,
  createUser,
  getSingleUser,
  getAllUser,
  updateUser,
};
