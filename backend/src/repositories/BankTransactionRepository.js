import BaseRepository from "./BaseRepository.js";
import BankTransaction from "../models/BankTransaction.js";

class BankTransactionRepository extends BaseRepository {
  constructor() {
    super(BankTransaction);
  }

  async findByBankAccount(bankAccountId, filters = {}) {
    const query = { bankAccount: bankAccountId, ...filters };
    return this.model.find(query).sort({ transactionDate: -1 });
  }

  async findUnreconciled(bankAccountId) {
    return this.model
      .find({
        bankAccount: bankAccountId,
        reconciliationStatus: "Unreconciled",
        status: { $in: ["Cleared", "Pending"] },
      })
      .sort({ transactionDate: -1 });
  }

  async findByReference(referenceType, referenceId) {
    return this.model.findOne({ referenceType, referenceId });
  }

  async markAsReconciled(transactionIds, reconciliationId) {
    return this.model.updateMany(
      { _id: { $in: transactionIds } },
      {
        reconciliationStatus: "Reconciled",
        reconciledAt: new Date(),
        reconciledIn: reconciliationId,
      },
    );
  }

  async findByDateRange(bankAccountId, startDate, endDate) {
    return this.model
      .find({
        bankAccount: bankAccountId,
        transactionDate: { $gte: startDate, $lte: endDate },
      })
      .sort({ transactionDate: 1 });
  }

  async getBalanceUpTo(bankAccountId, date) {
    const result = await this.model.aggregate([
      {
        $match: {
          bankAccount: bankAccountId,
          transactionDate: { $lte: new Date(date) },
          status: { $nin: ["Cancelled", "Bounced"] },
        },
      },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: { $cond: [{ $eq: ["$transactionType", "Deposit"] }, "$amount", 0] },
          },
          totalWithdrawals: {
            $sum: { $cond: [{ $eq: ["$transactionType", "Withdrawal"] }, "$amount", 0] },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalDeposits: 0, totalWithdrawals: 0 };
    }

    return result[0];
  }
}

export default new BankTransactionRepository();
