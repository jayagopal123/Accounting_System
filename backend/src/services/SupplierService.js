import supplierRepository from "../repositories/SupplierRepository.js";
import ApiError from "../utils/ApiError.js";

class SupplierService {
  async createSupplier(supplierData) {
    const existingSupplier =
      await supplierRepository.findBySupplierCode(
        supplierData.supplierCode
      );

    if (existingSupplier) {
      throw new ApiError(
        409,
        "Supplier code already exists",
        "SUPPLIER_ALREADY_EXISTS"
      );
    }

    if (supplierData.gstNumber) {
      const existingGST =
        await supplierRepository.findByGST(
          supplierData.gstNumber
        );

      if (existingGST) {
        throw new ApiError(
          409,
          "GST number already exists",
          "GST_ALREADY_EXISTS"
        );
      }
    }

    const email = supplierData.contacts?.[0]?.email;

    if (email) {
      const existingEmail =
        await supplierRepository.findByEmail(email);

      if (existingEmail) {
        throw new ApiError(
          409,
          "Email already exists",
          "EMAIL_ALREADY_EXISTS"
        );
      }
    }

    return supplierRepository.create(supplierData);
  }

  async getSuppliers(page, limit, search) {
    if (search) {
      return supplierRepository.search(
        search,
        page,
        limit
      );
    }

    return supplierRepository.findAll({}, page, limit);
  }

  async getSupplierById(id) {
    const supplier =
      await supplierRepository.findById(id);

    if (!supplier) {
      throw new ApiError(
        404,
        "Supplier not found",
        "SUPPLIER_NOT_FOUND"
      );
    }

    return supplier;
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);

    return supplierRepository.update(id, data);
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);

    return supplierRepository.softDelete(id);
  }

  async blockSupplier(id) {
    await this.getSupplierById(id);

    return supplierRepository.blockSupplier(id);
  }

  async activateSupplier(id) {
    await this.getSupplierById(id);

    return supplierRepository.activateSupplier(id);
  }
}

export default new SupplierService();