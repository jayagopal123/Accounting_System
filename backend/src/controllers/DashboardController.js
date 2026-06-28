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
}

export default new DashboardController();
