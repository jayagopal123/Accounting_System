import express from "express";
import RoleController from "../controllers/RoleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();
const roleController = new RoleController();

// POST /api/v1/roles
// Secure route: Requires authenticated user with 'roles:create' permission
router.post(
  "/",
  authMiddleware,
  rbacMiddleware("roles:create"),
  roleController.createRole,
);

export default router;
