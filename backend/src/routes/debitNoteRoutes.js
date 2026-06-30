import express from "express";

import debitNoteController from "../controllers/DebitNoteController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("debit_notes:create"),
  debitNoteController.createDebitNote.bind(debitNoteController),
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("debit_notes:view"),
  debitNoteController.getDebitNotes.bind(debitNoteController),
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("debit_notes:view"),
  debitNoteController.getDebitNoteById.bind(debitNoteController),
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("debit_notes:update"),
  debitNoteController.updateDebitNote.bind(debitNoteController),
);

router.patch(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("debit_notes:submit"),
  debitNoteController.submitDebitNote.bind(debitNoteController),
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  rbacMiddleware("debit_notes:cancel"),
  debitNoteController.cancelDebitNote.bind(debitNoteController),
);

export default router;
