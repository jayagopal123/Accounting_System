import express from "express";
import costCenterController from "../controllers/CostCenterController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, costCenterController.createCostCenter);
router.get("/", authenticate, costCenterController.getCostCenters);
router.get("/:id", authenticate, costCenterController.getCostCenterById);
router.patch("/:id", authenticate, costCenterController.updateCostCenter);

export default router;
