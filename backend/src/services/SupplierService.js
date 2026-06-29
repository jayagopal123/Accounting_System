import supplierRepository from "../repositories/SupplierRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

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

    const supplier = await supplierRepository.create(supplierData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "Supplier",
      entityId: supplier._id,
      entityName: supplier.supplierName,
      description: `Supplier "${supplier.supplierName}" was created`,
      category: "business",
      performedBy: supplierData.createdBy,
      performedByName: supplierData.createdByName || "",
    });

    return supplier;
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
    const supplier = await this.getSupplierById(id);

    const updated = await supplierRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "Supplier",
      entityId: supplier._id,
      entityName: supplier.supplierName,
      description: `Supplier "${supplier.supplierName}" was updated`,
      category: "business",
      performedBy: data.updatedBy,
      performedByName: data.updatedByName || "",
    });

    return updated;
  }

  async deleteSupplier(id, userId) {
    const supplier = await this.getSupplierById(id);

    const updated = await supplierRepository.softDelete(id);

    await activityLogService.logActivity({
      action: "Deleted",
      entity: "Supplier",
      entityId: supplier._id,
      entityName: supplier.supplierName,
      description: `Supplier "${supplier.supplierName}" was deleted`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async blockSupplier(id, userId) {
    const supplier = await this.getSupplierById(id);

    const updated = await supplierRepository.blockSupplier(id);

    await activityLogService.logActivity({
      action: "Blocked",
      entity: "Supplier",
      entityId: supplier._id,
      entityName: supplier.supplierName,
      description: `Supplier "${supplier.supplierName}" was blocked`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async activateSupplier(id, userId) {
    const supplier = await this.getSupplierById(id);

    const updated = await supplierRepository.activateSupplier(id);

    await activityLogService.logActivity({
      action: "Activated",
      entity: "Supplier",
      entityId: supplier._id,
      entityName: supplier.supplierName,
      description: `Supplier "${supplier.supplierName}" was activated`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }
}

export default new SupplierService();