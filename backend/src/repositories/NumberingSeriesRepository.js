import BaseRepository from "./BaseRepository.js";
import NumberingSeries from "../models/NumberingSeries.js";

class NumberingSeriesRepository extends BaseRepository {
  constructor() {
    super(NumberingSeries);
  }

  async findByDocumentType(documentType) {
    return this.model.findOne({ documentType });
  }

  async getNextNumber(documentType) {
    const series = await this.model.findOneAndUpdate(
      { documentType, isActive: true },
      { $inc: { currentNumber: 1 } },
      { new: true },
    );
    return series;
  }
}

export default new NumberingSeriesRepository();
