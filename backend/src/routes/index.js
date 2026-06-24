const express = require('express');
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');

const router = express.Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
