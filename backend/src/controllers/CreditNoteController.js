import creditNoteService from "../services/CreditNoteService.js";

class CreditNoteController {
  async createCreditNote(req, res, next) {
    try {
      const creditNote = await creditNoteService.createCreditNote({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        data: creditNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCreditNotes(req, res, next) {
    try {
      const creditNotes = await creditNoteService.getCreditNotes();

      res.status(200).json({
        success: true,
        data: creditNotes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCreditNoteById(req, res, next) {
    try {
      const creditNote = await creditNoteService.getCreditNoteById(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: creditNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCreditNote(req, res, next) {
    try {
      const creditNote = await creditNoteService.updateCreditNote(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: creditNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitCreditNote(req, res, next) {
    try {
      const creditNote = await creditNoteService.submitCreditNote(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: creditNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelCreditNote(req, res, next) {
    try {
      const creditNote = await creditNoteService.cancelCreditNote(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: creditNote,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CreditNoteController();
