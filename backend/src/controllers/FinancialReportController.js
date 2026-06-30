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

  getSalesRegister = catchAsync(async (req, res) => {
    const { startDate, endDate, customerId } = req.query;
    const data = await financialReportService.getSalesRegister({
      startDate,
      endDate,
      customerId,
    });

    res.status(200).json({
      success: true,
      message: "Sales Register retrieved successfully.",
      data,
    });
  });

  getPurchaseRegister = catchAsync(async (req, res) => {
    const { startDate, endDate, supplierId } = req.query;
    const data = await financialReportService.getPurchaseRegister({
      startDate,
      endDate,
      supplierId,
    });

    res.status(200).json({
      success: true,
      message: "Purchase Register retrieved successfully.",
      data,
    });
  });

  getCustomerStatement = catchAsync(async (req, res) => {
    const { customerId, startDate, endDate } = req.query;
    const data = await financialReportService.getCustomerStatement({
      customerId,
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Customer Statement retrieved successfully.",
      data,
    });
  });

  getVendorStatement = catchAsync(async (req, res) => {
    const { supplierId, startDate, endDate } = req.query;
    const data = await financialReportService.getVendorStatement({
      supplierId,
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Vendor Statement retrieved successfully.",
      data,
    });
  });

  getARAging = catchAsync(async (req, res) => {
    const { asOfDate } = req.query;
    const data = await financialReportService.getARAging({ asOfDate });

    res.status(200).json({
      success: true,
      message: "AR Aging retrieved successfully.",
      data,
    });
  });

  getAPAging = catchAsync(async (req, res) => {
    const { asOfDate } = req.query;
    const data = await financialReportService.getAPAging({ asOfDate });

    res.status(200).json({
      success: true,
      message: "AP Aging retrieved successfully.",
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
