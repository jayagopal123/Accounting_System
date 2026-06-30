import exchangeRateRepository from "../repositories/CurrencyExchangeRateRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class CurrencyExchangeRateService {
  async createExchangeRate(data) {
    if (data.rate <= 0) {
      throw new ApiError(400, "Exchange rate must be greater than 0", "INVALID_RATE");
    }

    const exchangeRate = await exchangeRateRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "CurrencyExchangeRate",
      entityId: exchangeRate._id,
      entityName: `${exchangeRate.fromCurrency}/${exchangeRate.toCurrency}`,
      description: `Exchange rate ${exchangeRate.fromCurrency}/${exchangeRate.toCurrency} = ${exchangeRate.rate} was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return exchangeRate;
  }

  async getExchangeRates() {
    return exchangeRateRepository.findAll();
  }

  async getExchangeRateById(id) {
    const rate = await exchangeRateRepository.findById(id);
    if (!rate) {
      throw new ApiError(404, "Exchange rate not found", "RATE_NOT_FOUND");
    }
    return rate;
  }

  async updateExchangeRate(id, data) {
    const rate = await exchangeRateRepository.findById(id);
    if (!rate) {
      throw new ApiError(404, "Exchange rate not found", "RATE_NOT_FOUND");
    }

    if (data.rate !== undefined && data.rate <= 0) {
      throw new ApiError(400, "Exchange rate must be greater than 0", "INVALID_RATE");
    }

    const updated = await exchangeRateRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "CurrencyExchangeRate",
      entityId: updated._id,
      entityName: `${updated.fromCurrency}/${updated.toCurrency}`,
      description: `Exchange rate ${updated.fromCurrency}/${updated.toCurrency} was updated to ${updated.rate}`,
      category: "business",
      performedBy: data.updatedBy || rate.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async getLatestRate(fromCurrency, toCurrency) {
    const rate = await exchangeRateRepository.findLatestRate(
      fromCurrency,
      toCurrency,
    );
    if (!rate) {
      throw new ApiError(
        404,
        `No exchange rate found for ${fromCurrency}/${toCurrency}`,
        "RATE_NOT_FOUND",
      );
    }
    return rate;
  }
}

export default new CurrencyExchangeRateService();
