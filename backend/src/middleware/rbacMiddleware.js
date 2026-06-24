import ApiError from "../utils/ApiError.js";

const rbacMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'User authentication required', 'UNAUTHENTICATED');
      }

      // Scan the user's roles and permissions
      const hasPermission = req.user.roles.some(role => {
        return role.permissions.some(permission => permission.name === requiredPermission);
      });

      if (!hasPermission) {
        throw new ApiError(403, `Access denied. Missing permission: ${requiredPermission}`, 'FORBIDDEN');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rbacMiddleware;
