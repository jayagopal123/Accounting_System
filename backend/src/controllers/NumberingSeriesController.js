import numberingSeriesService from "../services/NumberingSeriesService.js";
import catchAsync from "../utils/catchAsync.js";

class NumberingSeriesController {
  createNumberingSeries = catchAsync(async (req, res) => {
    const series = await numberingSeriesService.createNumberingSeries({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Numbering series created successfully.",
      data: series,
    });
  });

  getNumberingSeries = catchAsync(async (req, res) => {
    const series = await numberingSeriesService.getNumberingSeries();

    res.status(200).json({
      success: true,
      data: series,
    });
  });

  getNumberingSeriesById = catchAsync(async (req, res) => {
    const series = await numberingSeriesService.getNumberingSeriesById(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: series,
    });
  });

  updateNumberingSeries = catchAsync(async (req, res) => {
    const series = await numberingSeriesService.updateNumberingSeries(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
    );

    res.status(200).json({
      success: true,
      message: "Numbering series updated successfully.",
      data: series,
    });
  });

  generateNextNumber = catchAsync(async (req, res) => {
    const nextNumber = await numberingSeriesService.generateNextNumber(
      req.params.documentType,
    );

    res.status(200).json({
      success: true,
      data: { nextNumber },
    });
  });
}

export default new NumberingSeriesController();
