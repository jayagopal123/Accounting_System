import financialReportService from "../services/FinancialReportService.js";
import catchAsync from "../utils/catchAsync.js";

class FinancialReportController {
  getGeneralLedger = catchAsync(async (req, res) => {
    const { startDate, endDate, accountId } = req.query;
    const data = await financialReportService.getGeneralLedger({
      startDate,
      endDate,
      accountId,
    });

    res.status(200).json({
      success: true,
      message: "General Ledger retrieved successfully.",
      data,
    });
  });

  getTrialBalance = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await financialReportService.getTrialBalance({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Trial Balance retrieved successfully.",
      data,
    });
  });

  getProfitAndLoss = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await financialReportService.getProfitAndLoss({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Profit & Loss Statement retrieved successfully.",
      data,
    });
  });

  getBalanceSheet = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await financialReportService.getBalanceSheet({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Balance Sheet retrieved successfully.",
      data,
    });
  });

  getCashFlow = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await financialReportService.getCashFlow({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Cash Flow Statement retrieved successfully.",
      data,
    });
  });

  exportReport = catchAsync(async (req, res) => {
    const { type, format, startDate, endDate } = req.query;

    if (!type || !format) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Report type and format are required.",
        },
      });
    }

    const validTypes = [
      "general-ledger",
      "trial-balance",
      "profit-loss",
      "balance-sheet",
      "cash-flow",
    ];
    const validFormats = ["pdf", "xlsx"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Invalid report type. Must be one of: ${validTypes.join(", ")}`,
        },
      });
    }

    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Invalid format. Must be one of: ${validFormats.join(", ")}`,
        },
      });
    }

    const params = { startDate, endDate };
    let buffer;
    let contentType;
    let filename;

    if (format === "xlsx") {
      buffer = await financialReportService.exportExcel(type, params);
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    } else {
      buffer = await financialReportService.exportPdf(type, params);
      contentType = "application/pdf";
      filename = `${type}-${new Date().toISOString().slice(0, 10)}.pdf`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    res.send(buffer);
  });
}

export default new FinancialReportController();
