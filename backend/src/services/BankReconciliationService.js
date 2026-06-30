import bankReconciliationRepository from "../repositories/BankReconciliationRepository.js";
import bankTransactionRepository from "../repositories/BankTransactionRepository.js";
import bankAccountRepository from "../repositories/BankAccountRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class BankReconciliationService {
  async createReconciliation(data) {
    // Validate bank account exists
    const bankAccount = await bankAccountRepository.findById(data.bankAccount);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    // Validate date range
    if (new Date(data.statementStartDate) >= new Date(data.statementEndDate)) {
      throw new ApiError(
        400,
        "Statement end date must be after start date",
        "INVALID_DATE_RANGE",
      );
    }

    // Get system balance
    const systemBalance = bankAccount.currentBalance;

    // Calculate difference
    const difference = data.closingBalance - systemBalance;

    const reconciliation = await bankReconciliationRepository.create({
      ...data,
      systemBalance,
      difference,
      createdBy: data.createdBy,
    });

    await activityLogService.logActivity({
      action: "Created",
      entity: "BankReconciliation",
      entityId: reconciliation._id,
      entityName: `Reconciliation - ${bankAccount.accountName}`,
      description: `Bank reconciliation started for ${bankAccount.accountName} (${new Date(data.statementStartDate).toLocaleDateString()} - ${new Date(data.statementEndDate).toLocaleDateString()})`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return reconciliation;
  }

  async getReconciliations() {
    return bankReconciliationRepository.findAll();
  }

  async getReconciliationById(id) {
    const reconciliation = await bankReconciliationRepository.findById(id, [
      { path: "bankAccount", select: "accountName bankName accountNumber" },
      {
        path: "matchedTransactions",
        select: "transactionDate transactionType amount description status",
      },
      {
        path: "unmatchedSystemTransactions",
        select: "transactionDate transactionType amount description status",
      },
      { path: "createdBy", select: "name email" },
      { path: "verifiedBy", select: "name email" },
    ]);
    if (!reconciliation) {
      throw new ApiError(
        404,
        "Bank reconciliation not found",
        "RECONCILIATION_NOT_FOUND",
      );
    }
    return reconciliation;
  }

  async getReconciliationsByBankAccount(bankAccountId) {
    return bankReconciliationRepository.findByBankAccount(bankAccountId);
  }

  async matchTransactions(reconciliationId, transactionIds, userId) {
    const reconciliation = await bankReconciliationRepository.findById(
      reconciliationId,
    );
    if (!reconciliation) {
      throw new ApiError(
        404,
        "Bank reconciliation not found",
        "RECONCILIATION_NOT_FOUND",
      );
    }

    if (reconciliation.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft reconciliations can be updated",
        "INVALID_STATUS",
      );
    }

    // Mark transactions as reconciled
    await bankTransactionRepository.markAsReconciled(
      transactionIds,
      reconciliationId,
    );

    // Update reconciliation with matched transactions
    const matchedSet = new Set([
      ...(reconciliation.matchedTransactions || []).map((id) => id.toString()),
      ...transactionIds,
    ]);

    // Remove matched transactions from unmatched
    const unmatchedIds = (reconciliation.unmatchedSystemTransactions || [])
      .filter((id) => !matchedSet.has(id.toString()))
      .map((id) => id);

    const updated = await bankReconciliationRepository.update(reconciliationId, {
      matchedTransactions: Array.from(matchedSet),
      unmatchedSystemTransactions: unmatchedIds,
    });

    await activityLogService.logActivity({
      action: "Updated",
      entity: "BankReconciliation",
      entityId: updated._id,
      entityName: `Reconciliation - ${reconciliationId}`,
      description: `${transactionIds.length} transaction(s) matched in reconciliation`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async completeReconciliation(id, userId) {
    const reconciliation = await bankReconciliationRepository.findById(id);
    if (!reconciliation) {
      throw new ApiError(
        404,
        "Bank reconciliation not found",
        "RECONCILIATION_NOT_FOUND",
      );
    }

    if (reconciliation.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft reconciliations can be completed",
        "INVALID_STATUS",
      );
    }

    const updated = await bankReconciliationRepository.update(id, {
      status: "Completed",
    });

    await activityLogService.logActivity({
      action: "Completed",
      entity: "BankReconciliation",
      entityId: updated._id,
      entityName: `Reconciliation - ${reconciliation.bankAccount}`,
      description: `Bank reconciliation completed`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async verifyReconciliation(id, userId) {
    const reconciliation = await bankReconciliationRepository.findById(id);
    if (!reconciliation) {
      throw new ApiError(
        404,
        "Bank reconciliation not found",
        "RECONCILIATION_NOT_FOUND",
      );
    }

    if (reconciliation.status !== "Completed") {
      throw new ApiError(
        400,
        "Only completed reconciliations can be verified",
        "INVALID_STATUS",
      );
    }

    const updated = await bankReconciliationRepository.update(id, {
      status: "Verified",
      verifiedBy: userId,
    });

    await activityLogService.logActivity({
      action: "Verified",
      entity: "BankReconciliation",
      entityId: updated._id,
      entityName: `Reconciliation - ${reconciliation.bankAccount}`,
      description: `Bank reconciliation verified`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }
}

export default new BankReconciliationService();
