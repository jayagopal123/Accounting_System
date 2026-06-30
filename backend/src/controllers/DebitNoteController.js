import debitNoteService from "../services/DebitNoteService.js";

class DebitNoteController {
  async createDebitNote(req, res, next) {
    try {
      const debitNote = await debitNoteService.createDebitNote({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        data: debitNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDebitNotes(req, res, next) {
    try {
      const debitNotes = await debitNoteService.getDebitNotes();

      res.status(200).json({
        success: true,
        data: debitNotes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDebitNoteById(req, res, next) {
    try {
      const debitNote = await debitNoteService.getDebitNoteById(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: debitNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDebitNote(req, res, next) {
    try {
      const debitNote = await debitNoteService.updateDebitNote(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: debitNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitDebitNote(req, res, next) {
    try {
      const debitNote = await debitNoteService.submitDebitNote(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: debitNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelDebitNote(req, res, next) {
    try {
      const debitNote = await debitNoteService.cancelDebitNote(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: debitNote,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DebitNoteController();
