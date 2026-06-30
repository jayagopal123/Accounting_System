import assetCategoryService from "../services/AssetCategoryService.js";
import catchAsync from "../utils/catchAsync.js";

class AssetCategoryController {
  createCategory = catchAsync(async (req, res) => {
    const category = await assetCategoryService.createCategory({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Asset category created successfully.",
      data: category,
    });
  });

  getCategories = catchAsync(async (req, res) => {
    const categories = await assetCategoryService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  });

  getCategoryById = catchAsync(async (req, res) => {
    const category = await assetCategoryService.getCategoryById(req.params.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  });

  updateCategory = catchAsync(async (req, res) => {
    const category = await assetCategoryService.updateCategory(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Asset category updated successfully.",
      data: category,
    });
  });

  toggleCategoryStatus = catchAsync(async (req, res) => {
    const category = await assetCategoryService.toggleCategoryStatus(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: `Asset category ${category.isActive ? "activated" : "deactivated"} successfully.`,
      data: category,
    });
  });
}

export default new AssetCategoryController();
