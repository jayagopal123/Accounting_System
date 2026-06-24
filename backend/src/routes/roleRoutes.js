const express = require("express");
const RoleController = require("../controllers/RoleController");
const authMiddleware = require("../middleware/authMiddleware");
const rbacMiddleware = require("../middleware/rbacMiddleware");

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

module.exports = router;
