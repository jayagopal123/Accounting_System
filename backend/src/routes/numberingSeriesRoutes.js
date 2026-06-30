import express from "express";
import numberingSeriesController from "../controllers/NumberingSeriesController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, numberingSeriesController.createNumberingSeries);
router.get("/", authenticate, numberingSeriesController.getNumberingSeries);
router.get("/:id", authenticate, numberingSeriesController.getNumberingSeriesById);
router.patch("/:id", authenticate, numberingSeriesController.updateNumberingSeries);
router.get("/next/:documentType", authenticate, numberingSeriesController.generateNextNumber);

export default router;
