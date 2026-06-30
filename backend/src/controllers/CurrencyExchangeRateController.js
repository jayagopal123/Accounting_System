import exchangeRateService from "../services/CurrencyExchangeRateService.js";
import catchAsync from "../utils/catchAsync.js";

class CurrencyExchangeRateController {
  createExchangeRate = catchAsync(async (req, res) => {
    const rate = await exchangeRateService.createExchangeRate({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Exchange rate created successfully.",
      data: rate,
    });
  });

  getExchangeRates = catchAsync(async (req, res) => {
    const rates = await exchangeRateService.getExchangeRates();

    res.status(200).json({
      success: true,
      data: rates,
    });
  });

  getExchangeRateById = catchAsync(async (req, res) => {
    const rate = await exchangeRateService.getExchangeRateById(req.params.id);

    res.status(200).json({
      success: true,
      data: rate,
    });
  });

  updateExchangeRate = catchAsync(async (req, res) => {
    const rate = await exchangeRateService.updateExchangeRate(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Exchange rate updated successfully.",
      data: rate,
    });
  });

  getLatestRate = catchAsync(async (req, res) => {
    const { fromCurrency, toCurrency } = req.query;
    const rate = await exchangeRateService.getLatestRate(
      fromCurrency,
      toCurrency,
    );

    res.status(200).json({
      success: true,
      data: rate,
    });
  });
}

export default new CurrencyExchangeRateController();
