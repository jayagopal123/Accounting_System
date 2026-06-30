import BaseRepository from "./BaseRepository.js";
import CurrencyExchangeRate from "../models/CurrencyExchangeRate.js";

class CurrencyExchangeRateRepository extends BaseRepository {
  constructor() {
    super(CurrencyExchangeRate);
  }

  async findLatestRate(fromCurrency, toCurrency) {
    return this.model
      .findOne({ fromCurrency, toCurrency, isActive: true })
      .sort({ effectiveDate: -1 });
  }
}

export default new CurrencyExchangeRateRepository();
