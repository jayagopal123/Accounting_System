const RoleService = require('../services/RoleService');
const { sendSuccess } = require('../utils/responseHandler');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

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

module.exports = RoleController;
