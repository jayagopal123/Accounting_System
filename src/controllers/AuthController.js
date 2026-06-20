const AuthService = require('../services/AuthService');
const { sendSuccess } = require('../utils/responseHandler');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req, res) => {
    const { name, email, password, roles } = req.body;

    // 1. Controller-level Validation: check presence of required inputs
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required fields', 'MISSING_REQUIRED_FIELDS');
    }

    // 2. Delegate registration logic to service
    const user = await this.authService.register({ name, email, password, roles });

    // 3. Return response
    return sendSuccess(res, 'User registered successfully', { user }, 201);
  });

  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // 1. Controller-level Validation
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required fields', 'MISSING_REQUIRED_FIELDS');
    }

    // 2. Delegate login logic to service
    const { user, token } = await this.authService.login(email, password);

    // 3. Set HttpOnly secure cookie for web security
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours matching JWT expiry
    });

    // 4. Return user info and token in body payload
    return sendSuccess(res, 'Login successful', { user, token }, 200);
  });

  logout = catchAsync(async (req, res) => {
    // Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return sendSuccess(res, 'Logout successful', {}, 200);
  });
}

module.exports = AuthController;
