import catchAsync from "../utils/catchAsync.js";
import gstrService from "../services/GSTRService.js";

class GSTRController {
  getGSTR1 = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await gstrService.getGSTR1({ startDate, endDate });
    res.json({ success: true, data: report });
  });

  getGSTR3B = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await gstrService.getGSTR3B({ startDate, endDate });
    res.json({ success: true, data: report });
  });
}

export default new GSTRController();
