import express from "express";
import { CashMemoTypeController } from "./cashMemoType.controller";

const router = express.Router();

router.post("/", CashMemoTypeController.createCashMemoType);

router.get("/", CashMemoTypeController.getAllCashMemoTypes);
router.get("/:id", CashMemoTypeController.getSingleCashMemoType);
router.patch(
  "/",

  CashMemoTypeController.updateCashMemoType
);
router.delete("/:id", CashMemoTypeController.deleteCashMemoType);

export const CashMemoTypeRoutes = router;
