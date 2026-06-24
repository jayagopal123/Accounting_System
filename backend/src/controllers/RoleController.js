import RoleService from "../services/RoleService.js";
import { sendSuccess } from "../utils/responseHandler.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

class RoleController {
  constructor() {
    this.roleService = new RoleService();
  }

  createRole = catchAsync(async (req, res) => {
    const { name, description, permissions } = req.body;

    if (!name) {
      throw new ApiError(400, 'Role name is required', 'MISSING_REQUIRED_FIELDS');
    }

    const role = await this.roleService.createRole({ name, description, permissions });
    return sendSuccess(res, 'Role created successfully', { role }, 201);
  });
}

export default RoleController;
