import activityLogService from "../services/ActivityLogService.js";
import catchAsync from "../utils/catchAsync.js";

class SystemLogController {
  getLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, search = "" } = req.query;
    const result = await activityLogService.getSystemLogs(
      Number(page),
      Number(limit),
      search
    );

    res.status(200).json({
      success: true,
      message: "System logs retrieved successfully.",
      data: result,
    });
  });
}

export default new SystemLogController();
