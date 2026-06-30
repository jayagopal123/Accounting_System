import bankTransactionRepository from "../repositories/BankTransactionRepository.js";
import bankAccountRepository from "../repositories/BankAccountRepository.js";
import bankAccountService from "./BankAccountService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class BankTransactionService {
  async createTransaction(data) {
    // Validate bank account exists
    const bankAccount = await bankAccountRepository.findById(data.bankAccount);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    if (!bankAccount.isActive) {
      throw new ApiError(400, "Cannot add transaction to inactive bank account", "ACCOUNT_INACTIVE");
    }

    const transaction = await bankTransactionRepository.create(data);

    // Recalculate bank account balance
    await bankAccountService.recalculateBalance(data.bankAccount);

    await activityLogService.logActivity({
      action: "Created",
      entity: "BankTransaction",
      entityId: transaction._id,
      entityName: `${transaction.transactionType} of ${transaction.amount}`,
      description: `${transaction.transactionType} of ${transaction.amount} recorded in ${bankAccount.accountName}`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return transaction;
  }

  async getTransactions(filters = {}) {
    return bankTransactionRepository.find(filters, [
      { path: "bankAccount", select: "accountName bankName accountNumber" },
    ]);
  }

  async getTransactionById(id) {
    const transaction = await bankTransactionRepository.findById(id, [
      { path: "bankAccount", select: "accountName bankName accountNumber" },
    ]);
    if (!transaction) {
      throw new ApiError(404, "Bank transaction not found", "TRANSACTION_NOT_FOUND");
    }
    return transaction;
  }

  async getTransactionsByBankAccount(bankAccountId) {
    const bankAccount = await bankAccountRepository.findById(bankAccountId);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    return bankTransactionRepository.findByBankAccount(bankAccountId);
  }

  async getUnreconciledTransactions(bankAccountId) {
    return bankTransactionRepository.findUnreconciled(bankAccountId);
  }

  async updateTransactionStatus(id, status, userId) {
    const transaction = await bankTransactionRepository.findById(id);
    if (!transaction) {
      throw new ApiError(404, "Bank transaction not found", "TRANSACTION_NOT_FOUND");
    }

    const updated = await bankTransactionRepository.update(id, { status });

    await bankAccountService.recalculateBalance(transaction.bankAccount);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "BankTransaction",
      entityId: updated._id,
      entityName: `Transaction ${updated._id}`,
      description: `Bank transaction status updated to ${status}`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async cancelTransaction(id, userId) {
    const transaction = await bankTransactionRepository.findById(id);
    if (!transaction) {
      throw new ApiError(404, "Bank transaction not found", "TRANSACTION_NOT_FOUND");
    }

    if (transaction.status === "Cancelled") {
      throw new ApiError(400, "Transaction already cancelled", "ALREADY_CANCELLED");
    }

    if (transaction.reconciliationStatus === "Reconciled") {
      throw new ApiError(400, "Cannot cancel a reconciled transaction", "RECONCILED_TRANSACTION");
    }

    const updated = await bankTransactionRepository.update(id, {
      status: "Cancelled",
    });

    // Recalculate bank account balance
    await bankAccountService.recalculateBalance(transaction.bankAccount);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "BankTransaction",
      entityId: updated._id,
      entityName: `Transaction ${updated._id}`,
      description: `Bank transaction of ${transaction.amount} was cancelled`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }
}

export default new BankTransactionService();
