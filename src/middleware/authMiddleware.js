const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const UserRepository = require('../repositories/UserRepository');

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer schema)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HttpOnly secure cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token is missing. Please log in.', 'TOKEN_MISSING');
    }

    // 3. JWT Verification
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Session expired. Please log in again.', 'TOKEN_EXPIRED');
      }
      throw new ApiError(401, 'Invalid authentication token. Please log in again.', 'INVALID_TOKEN');
    }

    // 4. Retrieve complete user metadata (with roles and permission mappings)
    const userRepository = new UserRepository();
    const user = await userRepository.findByIdWithRolesAndPermissions(decoded.id);

    if (!user) {
      throw new ApiError(401, 'The user associated with these credentials no longer exists.', 'USER_NOT_FOUND');
    }

    // 5. Account status validation
    if (user.status !== 'active') {
      throw new ApiError(403, `Access denied. Your account status is: ${user.status}`, 'ACCOUNT_NOT_ACTIVE');
    }

    // 6. Append validated context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
