import journalEntryService from "../services/JournalEntryService.js";

class JournalEntryController {
  async createJournalEntry(req, res, next) {
    try {
      const journalEntry =
        await journalEntryService.createJournalEntry({
          ...req.body,
          createdBy: req.user._id,
        });

      res.status(201).json({
        success: true,
        data: journalEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJournalEntries(req, res, next) {
    try {
      const journalEntries =
        await journalEntryService.getJournalEntries();

      res.status(200).json({
        success: true,
        data: journalEntries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJournalEntryById(req, res, next) {
    try {
      const journalEntry =
        await journalEntryService.getJournalEntryById(
          req.params.id,
        );

      res.status(200).json({
        success: true,
        data: journalEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJournalEntry(req, res, next) {
    try {
      const journalEntry =
        await journalEntryService.updateJournalEntry(
          req.params.id,
          req.body,
        );

      res.status(200).json({
        success: true,
        data: journalEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitJournalEntry(req, res, next) {
    try {
      const journalEntry =
        await journalEntryService.submitJournalEntry(
          req.params.id,
        );

      res.status(200).json({
        success: true,
        data: journalEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelJournalEntry(req, res, next) {
    try {
      const journalEntry =
        await journalEntryService.cancelJournalEntry(
          req.params.id,
        );

      res.status(200).json({
        success: true,
        data: journalEntry,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new JournalEntryController();