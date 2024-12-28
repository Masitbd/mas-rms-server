import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import { ImageService } from "./image.service";
const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ImageService.uploadImages(
    req.files as { buffer: Buffer }[]
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully created",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ImageService.updateImage(
    req.files as { buffer: Buffer }[],
    id
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully created",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const imageId = req.params.imageId;
  const result = await ImageService.imageRemover(id, imageId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully created",
    data: result,
  });
});

export const ImageController = { create, update, remove };
