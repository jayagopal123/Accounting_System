import BaseRepository from "./BaseRepository.js";
import BankAccount from "../models/BankAccount.js";

class BankAccountRepository extends BaseRepository {
  constructor() {
    super(BankAccount);
  }

  async findActive() {
    return this.model.find({ isActive: true }).sort({ bankName: 1 });
  }

  async findByAccountNumber(accountNumber) {
    return this.model.findOne({ accountNumber });
  }

  async updateBalance(id, newBalance) {
    return this.model.findByIdAndUpdate(
      id,
      { currentBalance: newBalance },
      { new: true },
    );
  }
}

export default new BankAccountRepository();
