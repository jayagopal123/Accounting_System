import catchAsync from "../utils/catchAsync.js";
import taxRateService from "../services/TaxRateService.js";

class TaxRateController {
  createTaxRate = catchAsync(async (req, res) => {
    const taxRate = await taxRateService.createTaxRate({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Tax rate created", data: taxRate });
  });

  getTaxRates = catchAsync(async (req, res) => {
    const taxRates = await taxRateService.getTaxRates();
    res.json({ success: true, data: taxRates });
  });

  getActiveTaxRates = catchAsync(async (req, res) => {
    const taxRates = await taxRateService.getActiveTaxRates();
    res.json({ success: true, data: taxRates });
  });

  getTaxRateById = catchAsync(async (req, res) => {
    const taxRate = await taxRateService.getTaxRateById(req.params.id);
    res.json({ success: true, data: taxRate });
  });

  updateTaxRate = catchAsync(async (req, res) => {
    const taxRate = await taxRateService.updateTaxRate(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });
    res.json({ success: true, message: "Tax rate updated", data: taxRate });
  });
}

export default new TaxRateController();
