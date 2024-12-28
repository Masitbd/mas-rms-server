import { StatusCodes } from "http-status-codes";
import cloudinary from "../../../utils/claudinary";
import { uploadToCloudinary } from "./image.helper";
import { Images } from "./image.model";
import AppError from "../../errors/AppError";
import { TFIle } from "./image.interface";

const uploadImages = async (params: { buffer: Buffer }[]) => {
  const uploadResults = await Promise.all(
    params.map(async (file) => await uploadToCloudinary(file.buffer))
  );

  const savedImages = await Images.create({ files: uploadResults });
  return savedImages._id;
};

const updateImage = async (files: { buffer: Buffer }[], id: string) => {
  const uploadResults = await Promise.all(
    files.map(async (file) => await uploadToCloudinary(file.buffer))
  );
  const result: TFIle[] = uploadResults as TFIle[];
  if (id == "undefined" || id == "null") {
    const newResult = await Images.create({ files: uploadResults });
    return newResult._id;
  }
  const doesExists = await Images.findById(id);
  if (!doesExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid id");
  }

  doesExists.files = [
    ...doesExists.files,
    ...result.map((r: TFIle) => ({
      secure_url: r.secure_url,
      public_id: r.public_id,
    })),
  ];

  return await doesExists.save();
};

const imageRemover = async (id: string, imageId: string) => {
  const doesExists = await Images.findOne({ _id: id });
  if (!doesExists)
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid image id");

  const imagePublicIdIndex = doesExists.files.findIndex(
    (file) => file.public_id === imageId
  );

  const result = await cloudinary.uploader.destroy(
    doesExists.files[imagePublicIdIndex].public_id
  );
  doesExists.files.splice(imagePublicIdIndex, 1);
  return await doesExists.save();
};
export const ImageService = { uploadImages, imageRemover, updateImage };
