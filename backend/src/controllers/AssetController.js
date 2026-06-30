import assetService from "../services/AssetService.js";
import catchAsync from "../utils/catchAsync.js";

class AssetController {
  createAsset = catchAsync(async (req, res) => {
    const asset = await assetService.createAsset({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Asset created successfully.",
      data: asset,
    });
  });

  getAssets = catchAsync(async (req, res) => {
    const assets = await assetService.getAssets();

    res.status(200).json({
      success: true,
      data: assets,
    });
  });

  getAssetById = catchAsync(async (req, res) => {
    const asset = await assetService.getAssetById(req.params.id);

    res.status(200).json({
      success: true,
      data: asset,
    });
  });

  updateAsset = catchAsync(async (req, res) => {
    const asset = await assetService.updateAsset(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Asset updated successfully.",
      data: asset,
    });
  });

  activateAsset = catchAsync(async (req, res) => {
    const asset = await assetService.activateAsset(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Asset activated and capitalized.",
      data: asset,
    });
  });

  disposeAsset = catchAsync(async (req, res) => {
    const asset = await assetService.disposeAsset(
      req.params.id,
      req.body,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Asset disposed successfully.",
      data: asset,
    });
  });

  runDepreciation = catchAsync(async (req, res) => {
    const asset = await assetService.runDepreciation(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Depreciation calculated for asset.",
      data: asset,
    });
  });

  runBulkDepreciation = catchAsync(async (req, res) => {
    const results = await assetService.runBulkDepreciation(req.user._id);

    res.status(200).json({
      success: true,
      message: `Bulk depreciation completed for ${results.filter((r) => r.success).length} assets.`,
      data: results,
    });
  });

  getAssetSummary = catchAsync(async (req, res) => {
    const summary = await assetService.getAssetSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  getDepreciationSummary = catchAsync(async (req, res) => {
    const summary = await assetService.getDepreciationSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  });
}

export default new AssetController();
