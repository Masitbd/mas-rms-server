import { Router } from "express";
import { ImageController } from "./image.controller";
import multer from "multer";

const routes = Router();
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

routes.post("/", upload.array("images", 5), ImageController.create);
routes.patch("/:id", upload.array("images", 5), ImageController.update);
routes.delete("/:id/:imageId", ImageController.remove);

export const ImageRoutes = routes;
