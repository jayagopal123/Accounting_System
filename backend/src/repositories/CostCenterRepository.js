import BaseRepository from "./BaseRepository.js";
import CostCenter from "../models/CostCenter.js";

class CostCenterRepository extends BaseRepository {
  constructor() {
    super(CostCenter);
  }

  async findByCode(code) {
    return this.model.findOne({ code });
  }
}

export default new CostCenterRepository();
