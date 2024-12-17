import express from "express";
import { RawMaterialConsumptionController } from "./rawMaterialConsumption.controller";
const router = express.Router();

router.post("/", RawMaterialConsumptionController.create);
router.patch("/:id", RawMaterialConsumptionController.update);
router.get("/", RawMaterialConsumptionController.getAll);
router.get("/:id", RawMaterialConsumptionController.getSingle);
router.delete("/:id", RawMaterialConsumptionController.remove);
export const RawMaterialConsumptionRouter = router;
