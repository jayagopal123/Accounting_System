import Account from "../models/Account.js";

class AccountRepository {
  async create(accountData) {
    return Account.create(accountData);
  }

  async findById(accountId) {
    return Account.findById(accountId);
  }

  async findByCode(accountCode) {
    return Account.findOne({
      accountCode,
    });
  }

  async getNextAccountCode() {
    const lastAccount = await Account.findOne()
      .sort({ accountCode: -1 })
      .lean();
    if (!lastAccount) {
      return "1000";
    }
    const lastCode = parseInt(lastAccount.accountCode, 10) || 0;
    return (lastCode + 1).toString();
  }

  async update(accountId, updateData) {
    return Account.findByIdAndUpdate(accountId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findChildren(parentAccountId) {
    return Account.find({
      parentAccount: parentAccountId,
    });
  }

  async hasChildren(accountId) {
    const count = await Account.countDocuments({
      parentAccount: accountId,
    });

    return count > 0;
  }

  async findDescendants(accountId) {
    return Account.find({
      ancestors: accountId,
    });
  }
  async findAll() {
    return Account.find().sort({
      accountCode: 1,
    });
  }

  async updateMany(filter, updateData) {
    return Account.updateMany(filter, updateData);
  }

  async getFlatTree() {
    return Account.find({ status: "ACTIVE" })
      .sort({
        accountCode: 1,
      })
      .lean();
  }
}

export default new AccountRepository();
