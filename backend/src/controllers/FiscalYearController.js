import fiscalYearService from "../services/FiscalYearService.js";
import catchAsync from "../utils/catchAsync.js";

class FiscalYearController {
  createFiscalYear = catchAsync(async (req, res) => {
    const fiscalYear = await fiscalYearService.createFiscalYear({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Fiscal year created successfully.",
      data: fiscalYear,
    });
  });

  getFiscalYears = catchAsync(async (req, res) => {
    const fiscalYears = await fiscalYearService.getFiscalYears();

    res.status(200).json({
      success: true,
      data: fiscalYears,
    });
  });

  getFiscalYearById = catchAsync(async (req, res) => {
    const fiscalYear = await fiscalYearService.getFiscalYearById(req.params.id);

    res.status(200).json({
      success: true,
      data: fiscalYear,
    });
  });

  updateFiscalYear = catchAsync(async (req, res) => {
    const fiscalYear = await fiscalYearService.updateFiscalYear(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
    );

    res.status(200).json({
      success: true,
      message: "Fiscal year updated successfully.",
      data: fiscalYear,
    });
  });

  closeFiscalYear = catchAsync(async (req, res) => {
    const fiscalYear = await fiscalYearService.closeFiscalYear(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Fiscal year closed successfully.",
      data: fiscalYear,
    });
  });
}

export default new FiscalYearController();
