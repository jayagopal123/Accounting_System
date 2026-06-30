import express from "express";
import assetController from "../controllers/AssetController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, assetController.createAsset);
router.get("/", authenticate, assetController.getAssets);
router.get("/summary", authenticate, assetController.getAssetSummary);
router.get("/depreciation/summary", authenticate, assetController.getDepreciationSummary);
router.get("/:id", authenticate, assetController.getAssetById);
router.patch("/:id", authenticate, assetController.updateAsset);
router.patch("/:id/activate", authenticate, assetController.activateAsset);
router.patch("/:id/dispose", authenticate, assetController.disposeAsset);
router.patch("/:id/depreciate", authenticate, assetController.runDepreciation);
router.post("/depreciation/bulk", authenticate, assetController.runBulkDepreciation);

export default router;
