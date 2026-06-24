import Account from "../models/Account.js";

class AccountRepository {
  async create(accountData) {
    return Account.create(accountData);
  }

  async findById(accountId) {
    return Account.findById(accountId);
  }

  async findByCode(companyId, accountCode) {
    return Account.findOne({
      companyId,
      accountCode,
    });
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
  async findAll(companyId) {
    return Account.find({
      companyId,
    }).sort({
      accountCode: 1,
    });
  }

  async findByIdWithCompany(accountId, companyId) {
    return Account.findOne({
      _id: accountId,
      companyId,
    });
  }

  async updateMany(filter, updateData) {
    return Account.updateMany(filter, updateData);
  }

  async getFlatTree(companyId) {
    return Account.find({
      companyId,
      status: "ACTIVE",
    })
      .sort({
        accountCode: 1,
      })
      .lean();
  }
}

export default new AccountRepository();
