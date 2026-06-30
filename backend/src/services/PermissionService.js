import PermissionRepository from "../repositories/PermissionRepository.js";
import ApiError from "../utils/ApiError.js";

class PermissionService {
  constructor() {
    this.permissionRepository = new PermissionRepository();
  }

  async createPermission(permissionData) {
    const { name, module, description } = permissionData;
    const normalizedName = name.toLowerCase().trim();

    const existingPermission = await this.permissionRepository.findByName(normalizedName);
    if (existingPermission) {
      throw new ApiError(409, `Permission ${normalizedName} already exists`, "PERMISSION_ALREADY_EXISTS");
    }

    return this.permissionRepository.create({
      name: normalizedName,
      module: module.toLowerCase().trim(),
      description
    });
  }

  async getAllPermissions() {
    return this.permissionRepository.find({});
  }
}

export default PermissionService;
