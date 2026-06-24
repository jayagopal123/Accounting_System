import jwt from "jsonwebtoken";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import UserRepository from "../repositories/UserRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  // Generate JWT helper
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      status: user.status
    };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });
  }

  // Register a new user
  async register(userData) {
    const { name, email, password, roles } = userData;

    // 1. Business Validation: Email unique check
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email address is already in use', 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Validate roles exist (if provided)
    let roleIds = [];
    if (roles && roles.length > 0) {
      for (const roleId of roles) {
        const roleExists = await this.roleRepository.findById(roleId);
        if (!roleExists) {
          throw new ApiError(400, `Role with ID ${roleId} does not exist`, 'ROLE_NOT_FOUND');
        }
        roleIds.push(roleId);
      }
    } else {
      // Default fallback role (e.g., standard accountant)
      const defaultRole = await this.roleRepository.findByName('ACCOUNTANT');
      if (defaultRole) {
        roleIds.push(defaultRole._id);
      }
    }

    // 3. Create the user
    const newUser = await this.userRepository.create({
      name,
      email,
      password, // hashed automatically by Mongoose pre-save hook
      roles: roleIds,
      status: 'active'
    });

    // Strip password from returned document
    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
  }

  // Login a user
  async login(email, password) {
    // 1. Find user and populate their full role/permission graph
    const user = await this.userRepository.findByEmailWithRolesAndPermissions(email);
    
    // Prevent user enumeration by throwing standard credentials error
    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 2. Business Validation: Check active status
    if (user.status !== 'active') {
      throw new ApiError(403, `Account status is ${user.status}. Please contact system support.`, 'ACCOUNT_NOT_ACTIVE');
    }

    // 3. Validate password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 4. Generate JWT
    const token = this.generateToken(user);

    // Format output
    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      token
    };
  }
}

export default AuthService;
