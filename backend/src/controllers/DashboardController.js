import dashboardService from "../services/DashboardService.js";
import catchAsync from "../utils/catchAsync.js";

class DashboardController {
  getSummary = catchAsync(async (req, res) => {
    const summary = await dashboardService.getSummary();

    res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully.",
      data: summary,
    });
  });

  getRecentActivities = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const activities = await dashboardService.getRecentActivities(limit);

    res.status(200).json({
      success: true,
      message: "Recent activities retrieved successfully.",
      data: activities,
    });
  });

  getCashFlowSeries = catchAsync(async (req, res) => {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
    const series = await dashboardService.getCashFlowSeries(days);

    res.status(200).json({
      success: true,
      message: "Cash flow series retrieved successfully.",
      data: series,
    });
  });
}

export default new DashboardController();
