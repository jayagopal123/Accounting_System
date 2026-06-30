import bankAccountRepository from "../repositories/BankAccountRepository.js";
import bankTransactionRepository from "../repositories/BankTransactionRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class BankAccountService {
  async createBankAccount(data) {
    // Check for duplicate account number
    const existing = await bankAccountRepository.findByAccountNumber(
      data.accountNumber,
    );
    if (existing) {
      throw new ApiError(
        409,
        "Bank account with this account number already exists",
        "DUPLICATE_ACCOUNT",
      );
    }

    // Set initial balance to opening balance
    data.currentBalance = data.openingBalance || 0;

    const bankAccount = await bankAccountRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "BankAccount",
      entityId: bankAccount._id,
      entityName: `${bankAccount.bankName} - ${bankAccount.accountName}`,
      description: `Bank account ${bankAccount.accountName} (${bankAccount.bankName}) was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return bankAccount;
  }

  async getBankAccounts() {
    return bankAccountRepository.findAll();
  }

  async getBankAccountById(id) {
    const bankAccount = await bankAccountRepository.findById(id);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }
    return bankAccount;
  }

  async updateBankAccount(id, data) {
    const bankAccount = await bankAccountRepository.findById(id);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    // If account number is being changed, check for duplicates
    if (data.accountNumber && data.accountNumber !== bankAccount.accountNumber) {
      const existing = await bankAccountRepository.findByAccountNumber(
        data.accountNumber,
      );
      if (existing) {
        throw new ApiError(
          409,
          "Bank account with this account number already exists",
          "DUPLICATE_ACCOUNT",
        );
      }
    }

    const updated = await bankAccountRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "BankAccount",
      entityId: updated._id,
      entityName: `${updated.bankName} - ${updated.accountName}`,
      description: `Bank account ${updated.accountName} was updated`,
      category: "business",
      performedBy: data.updatedBy || bankAccount.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async toggleBankAccountStatus(id, userId) {
    const bankAccount = await bankAccountRepository.findById(id);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    const updated = await bankAccountRepository.update(id, {
      isActive: !bankAccount.isActive,
      updatedBy: userId,
    });

    const action = updated.isActive ? "Activated" : "Deactivated";

    await activityLogService.logActivity({
      action,
      entity: "BankAccount",
      entityId: updated._id,
      entityName: `${updated.bankName} - ${updated.accountName}`,
      description: `Bank account ${updated.accountName} was ${action.toLowerCase()}`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async recalculateBalance(id) {
    const bankAccount = await bankAccountRepository.findById(id);
    if (!bankAccount) {
      throw new ApiError(404, "Bank account not found", "BANK_ACCOUNT_NOT_FOUND");
    }

    const balanceData = await bankTransactionRepository.getBalanceUpTo(
      id,
      new Date(),
    );

    const newBalance =
      bankAccount.openingBalance +
      (balanceData.totalDeposits || 0) -
      (balanceData.totalWithdrawals || 0);

    return bankAccountRepository.updateBalance(id, newBalance);
  }
}

export default new BankAccountService();
