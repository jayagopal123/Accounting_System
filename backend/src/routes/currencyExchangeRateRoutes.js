import express from "express";
import exchangeRateController from "../controllers/CurrencyExchangeRateController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, exchangeRateController.createExchangeRate);
router.get("/", authenticate, exchangeRateController.getExchangeRates);
router.get("/latest", authenticate, exchangeRateController.getLatestRate);
router.get("/:id", authenticate, exchangeRateController.getExchangeRateById);
router.patch("/:id", authenticate, exchangeRateController.updateExchangeRate);

export default router;
