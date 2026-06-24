import RoleRepository from "../repositories/RoleRepository.js";
import PermissionRepository from "../repositories/PermissionRepository.js";
import ApiError from "../utils/ApiError.js";

class RoleService {
  constructor() {
    this.roleRepository = new RoleRepository();
    this.permissionRepository = new PermissionRepository();
  }

  async createRole(roleData) {
    const { name, description, permissions } = roleData;
    const normalizedName = name.toUpperCase().trim();

    // Check duplicate role
    const existingRole = await this.roleRepository.findByName(normalizedName);
    if (existingRole) {
      throw new ApiError(409, `Role with name ${normalizedName} already exists`, 'ROLE_ALREADY_EXISTS');
    }

    // Verify all permissions exist
    if (permissions && permissions.length > 0) {
      for (const permId of permissions) {
        const permExists = await this.permissionRepository.findById(permId);
        if (!permExists) {
          throw new ApiError(400, `Permission with ID ${permId} does not exist`, 'PERMISSION_NOT_FOUND');
        }
      }
    }

    return this.roleRepository.create({
      name: normalizedName,
      description,
      permissions: permissions || []
    });
  }
}

export default RoleService;
