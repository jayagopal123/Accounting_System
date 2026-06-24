const express = require("express");

const accountController = require("../controllers/AccountController");

const authenticate = require("../middleware/authMiddleware");



const router = express.Router();

router.post(
  "/",
  authenticate,
  accountController.createAccount,
);

router.get(
  "/tree",
  authenticate,
  accountController.getAccountTree,
);

router.patch(
  "/:id/status",
  authenticate,
  accountController.updateStatus,
);

router.delete(
  "/:id",
  authenticate,
  accountController.deleteAccount,
);
router.get(
  "/",
  authenticate,
  accountController.getAccounts,
);

router.get(
  "/:id",
  authenticate,
  accountController.getAccountById,
);

router.put(
  "/:id",
  authenticate,
  accountController.updateAccount,
);
module.exports = router;
