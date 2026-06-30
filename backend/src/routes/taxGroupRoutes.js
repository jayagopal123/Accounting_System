import { Router } from "express";
import taxGroupController from "../controllers/TaxGroupController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/active", taxGroupController.getActiveTaxGroups);
router.post("/calculate", taxGroupController.calculateTax);
router.get("/", taxGroupController.getTaxGroups);
router.get("/:id", taxGroupController.getTaxGroupById);
router.post("/", taxGroupController.createTaxGroup);
router.put("/:id", taxGroupController.updateTaxGroup);

export default router;
