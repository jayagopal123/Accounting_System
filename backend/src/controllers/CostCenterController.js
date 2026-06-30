import costCenterService from "../services/CostCenterService.js";
import catchAsync from "../utils/catchAsync.js";

class CostCenterController {
  createCostCenter = catchAsync(async (req, res) => {
    const costCenter = await costCenterService.createCostCenter({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Cost center created successfully.",
      data: costCenter,
    });
  });

  getCostCenters = catchAsync(async (req, res) => {
    const costCenters = await costCenterService.getCostCenters();

    res.status(200).json({
      success: true,
      data: costCenters,
    });
  });

  getCostCenterById = catchAsync(async (req, res) => {
    const costCenter = await costCenterService.getCostCenterById(req.params.id);

    res.status(200).json({
      success: true,
      data: costCenter,
    });
  });

  updateCostCenter = catchAsync(async (req, res) => {
    const costCenter = await costCenterService.updateCostCenter(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Cost center updated successfully.",
      data: costCenter,
    });
  });
}

export default new CostCenterController();
