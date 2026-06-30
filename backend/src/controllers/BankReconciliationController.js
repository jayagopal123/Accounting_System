import bankReconciliationService from "../services/BankReconciliationService.js";
import catchAsync from "../utils/catchAsync.js";

class BankReconciliationController {
  createReconciliation = catchAsync(async (req, res) => {
    const reconciliation =
      await bankReconciliationService.createReconciliation({
        ...req.body,
        createdBy: req.user._id,
      });

    res.status(201).json({
      success: true,
      message: "Bank reconciliation created successfully.",
      data: reconciliation,
    });
  });

  getReconciliations = catchAsync(async (req, res) => {
    const { bankAccount } = req.query;

    let reconciliations;
    if (bankAccount) {
      reconciliations =
        await bankReconciliationService.getReconciliationsByBankAccount(
          bankAccount,
        );
    } else {
      reconciliations = await bankReconciliationService.getReconciliations();
    }

    res.status(200).json({
      success: true,
      data: reconciliations,
    });
  });

  getReconciliationById = catchAsync(async (req, res) => {
    const reconciliation =
      await bankReconciliationService.getReconciliationById(req.params.id);

    res.status(200).json({
      success: true,
      data: reconciliation,
    });
  });

  matchTransactions = catchAsync(async (req, res) => {
    const { transactionIds } = req.body;
    const reconciliation =
      await bankReconciliationService.matchTransactions(
        req.params.id,
        transactionIds,
        req.user._id,
      );

    res.status(200).json({
      success: true,
      message: "Transactions matched successfully.",
      data: reconciliation,
    });
  });

  completeReconciliation = catchAsync(async (req, res) => {
    const reconciliation =
      await bankReconciliationService.completeReconciliation(
        req.params.id,
        req.user._id,
      );

    res.status(200).json({
      success: true,
      message: "Reconciliation completed successfully.",
      data: reconciliation,
    });
  });

  verifyReconciliation = catchAsync(async (req, res) => {
    const reconciliation =
      await bankReconciliationService.verifyReconciliation(
        req.params.id,
        req.user._id,
      );

    res.status(200).json({
      success: true,
      message: "Reconciliation verified successfully.",
      data: reconciliation,
    });
  });
}

export default new BankReconciliationController();
