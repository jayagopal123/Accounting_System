import express from "express";

import journalEntryController from "../controllers/JournalEntryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("journal_entries:create"),
  journalEntryController.createJournalEntry.bind(
    journalEntryController,
  ),
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("journal_entries:view"),
  journalEntryController.getJournalEntries.bind(
    journalEntryController,
  ),
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("journal_entries:view"),
  journalEntryController.getJournalEntryById.bind(
    journalEntryController,
  ),
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("journal_entries:update"),
  journalEntryController.updateJournalEntry.bind(
    journalEntryController,
  ),
);

router.patch(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("journal_entries:submit"),
  journalEntryController.submitJournalEntry.bind(
    journalEntryController,
  ),
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  rbacMiddleware("journal_entries:cancel"),
  journalEntryController.cancelJournalEntry.bind(
    journalEntryController,
  ),
);

export default router;