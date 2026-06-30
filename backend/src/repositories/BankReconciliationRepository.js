import BaseRepository from "./BaseRepository.js";
import BankReconciliation from "../models/BankReconciliation.js";

class BankReconciliationRepository extends BaseRepository {
  constructor() {
    super(BankReconciliation);
  }

  async findByBankAccount(bankAccountId) {
    return this.model
      .find({ bankAccount: bankAccountId })
      .sort({ reconciliationDate: -1 });
  }

  async findLatest(bankAccountId) {
    return this.model
      .findOne({ bankAccount: bankAccountId })
      .sort({ reconciliationDate: -1 });
  }
}

export default new BankReconciliationRepository();
