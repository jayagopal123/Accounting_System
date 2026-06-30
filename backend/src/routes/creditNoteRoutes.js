import express from "express";

import creditNoteController from "../controllers/CreditNoteController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("credit_notes:create"),
  creditNoteController.createCreditNote.bind(creditNoteController),
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("credit_notes:view"),
  creditNoteController.getCreditNotes.bind(creditNoteController),
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("credit_notes:view"),
  creditNoteController.getCreditNoteById.bind(creditNoteController),
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("credit_notes:update"),
  creditNoteController.updateCreditNote.bind(creditNoteController),
);

router.patch(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("credit_notes:submit"),
  creditNoteController.submitCreditNote.bind(creditNoteController),
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  rbacMiddleware("credit_notes:cancel"),
  creditNoteController.cancelCreditNote.bind(creditNoteController),
);

export default router;
