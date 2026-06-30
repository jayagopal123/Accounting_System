import express from "express";
import assetCategoryController from "../controllers/AssetCategoryController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, assetCategoryController.createCategory);
router.get("/", authenticate, assetCategoryController.getCategories);
router.get("/:id", authenticate, assetCategoryController.getCategoryById);
router.patch("/:id", authenticate, assetCategoryController.updateCategory);
router.patch("/:id/toggle-status", authenticate, assetCategoryController.toggleCategoryStatus);

export default router;
