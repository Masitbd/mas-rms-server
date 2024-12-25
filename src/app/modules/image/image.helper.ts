import cloudinary from "../../../utils/claudinary";
import { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result as UploadApiResponse);
    });
    // Write the buffer to the Cloudinary stream
    stream.end(buffer);
  });
};
