import bankTransactionService from "../services/BankTransactionService.js";
import catchAsync from "../utils/catchAsync.js";

class BankTransactionController {
  createTransaction = catchAsync(async (req, res) => {
    const transaction = await bankTransactionService.createTransaction({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Bank transaction recorded successfully.",
      data: transaction,
    });
  });

  getTransactions = catchAsync(async (req, res) => {
    const { bankAccount, status, transactionType } = req.query;
    const filters = {};
    if (bankAccount) filters.bankAccount = bankAccount;
    if (status) filters.status = status;
    if (transactionType) filters.transactionType = transactionType;

    const transactions = await bankTransactionService.getTransactions(filters);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  });

  getTransactionById = catchAsync(async (req, res) => {
    const transaction = await bankTransactionService.getTransactionById(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  });

  getTransactionsByBankAccount = catchAsync(async (req, res) => {
    const transactions =
      await bankTransactionService.getTransactionsByBankAccount(
        req.params.bankAccountId,
      );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  });

  getUnreconciledTransactions = catchAsync(async (req, res) => {
    const transactions =
      await bankTransactionService.getUnreconciledTransactions(
        req.params.bankAccountId,
      );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  });

  updateTransactionStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const transaction = await bankTransactionService.updateTransactionStatus(
      req.params.id,
      status,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Transaction status updated successfully.",
      data: transaction,
    });
  });

  cancelTransaction = catchAsync(async (req, res) => {
    const transaction = await bankTransactionService.cancelTransaction(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Transaction cancelled successfully.",
      data: transaction,
    });
  });
}

export default new BankTransactionController();
