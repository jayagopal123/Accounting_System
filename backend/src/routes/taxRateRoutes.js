import { Router } from "express";
import taxRateController from "../controllers/TaxRateController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/active", taxRateController.getActiveTaxRates);
router.get("/", taxRateController.getTaxRates);
router.get("/:id", taxRateController.getTaxRateById);
router.post("/", taxRateController.createTaxRate);
router.put("/:id", taxRateController.updateTaxRate);

export default router;
