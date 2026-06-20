const express = require('express');
const RoleController = require('../controllers/RoleController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');

const router = express.Router();
const roleController = new RoleController();

// POST /api/v1/roles
// Secure route: Requires authenticated user with 'roles:create' permission
router.post('/', authMiddleware, rbacMiddleware('roles:create'), roleController.createRole);

module.exports = router;
