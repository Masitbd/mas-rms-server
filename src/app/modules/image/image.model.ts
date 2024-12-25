import { model, Schema } from "mongoose";
import { TImage } from "./image.interface";

const imageSchema = new Schema<TImage>({
  files: [
    {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  ],
});

export const Images = model("Images", imageSchema);
