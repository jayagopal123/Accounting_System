import BaseRepository from "./BaseRepository.js";
import Supplier from "../models/Supplier.js";

class SupplierRepository extends BaseRepository {
  constructor() {
    super(Supplier);
  }

  async findBySupplierCode(supplierCode) {
    return this.model.findOne({
      supplierCode,
      isDeleted: false
    });
  }

  async findByEmail(email) {
    return this.model.findOne({
      "contacts.email": email,
      isDeleted: false
    });
  }

  async findByGST(gstNumber) {
    return this.model.findOne({
      gstNumber,
      isDeleted: false
    });
  }

  async search(search, page = 1, limit = 10) {

    const query = {
      isDeleted: false,
      $or: [
        {
          supplierName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          supplierCode: {
            $regex: search,
            $options: "i"
          }
        },
        {
          gstNumber: {
            $regex: search,
            $options: "i"
          }
        },
        {
          "contacts.email": {
            $regex: search,
            $options: "i"
          }
        }
      ]
    };

    const skip = (page - 1) * limit;

    const suppliers = await this.model
      .find(query)
      .skip(skip)
      .limit(limit);

    const total = await this.model.countDocuments(query);

    return {
      suppliers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async blockSupplier(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Blocked" },
      { new: true }
    );
  }

  async activateSupplier(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );
  }

  async softDelete(id) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Inactive",
        isDeleted: true
      },
      { new: true }
    );
  }
}

export default new SupplierRepository();