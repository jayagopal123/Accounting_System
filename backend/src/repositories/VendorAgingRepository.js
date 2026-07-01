import BaseRepository from "./BaseRepository.js";
import VendorAging from "../models/VendorAging.js";

class VendorAgingRepository extends BaseRepository {
  constructor() {
    super(VendorAging);
  }

  async findBySupplier(supplierId) {
    return this.model.find({ supplier: supplierId });
  }

  async findByInvoice(invoiceId) {
    return this.model.findOne({ invoice: invoiceId });
  }
}

export default new VendorAgingRepository();
