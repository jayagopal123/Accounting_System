import ApiError from "../utils/ApiError.js";
import accountRepository from "../repositories/AccountRepository.js";

class AccountService {
  async getNextAccountCode() {
    return accountRepository.getNextAccountCode();
  }

  async createAccount(accountData, userId) {
    const {
      accountName,
      accountType,
      parentAccount,
      isGroup,
      currency,
      amount,
      description,
    } = accountData;

    const accountCode = await accountRepository.getNextAccountCode();

    let resolvedLevel = 1;
    let resolvedAncestors = [];
    let resolvedAccountType = accountType;

    if (parentAccount) {
      const parent = await accountRepository.findById(
        parentAccount,
      );

      if (!parent) {
        throw new ApiError(404, "Parent account not found.");
      }

      if (accountType && accountType !== parent.accountType) {
        throw new ApiError(
          400,
          "Child account type must match parent account type.",
        );
      }

      resolvedLevel = parent.level + 1;

      resolvedAncestors = [...parent.ancestors, parent._id];

      resolvedAccountType = parent.accountType;
    }

    return accountRepository.create({
      accountCode,
      accountName,
      accountType: resolvedAccountType,
      parentAccount: parentAccount || null,
      ancestors: resolvedAncestors,
      level: resolvedLevel,
      isGroup: isGroup || false,
      currency: currency || "INR",
      amount: amount || 0,
      description,
      createdBy: userId,
      updatedBy: userId,
    });
  }
  async getAccounts() {
    return accountRepository.findAll();
  }
  async getAccountById(accountId) {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw new ApiError(404, "Account not found.");
    }

    return account;
  }

  async getAccountTree() {
    const accounts = await accountRepository.getFlatTree();

    const accountMap = {};
    const tree = [];

    accounts.forEach((account) => {
      account.children = [];
      accountMap[account._id] = account;
    });

    accounts.forEach((account) => {
      if (account.parentAccount) {
        accountMap[account.parentAccount]?.children.push(account);
      } else {
        tree.push(account);
      }
    });

    return tree;
  }
  async updateAccount(accountId, updateData, userId) {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw new ApiError(404, "Account not found.");
    }

    if (
      updateData.parentAccount &&
      updateData.parentAccount.toString() === account._id.toString()
    ) {
      throw new ApiError(400, "Circular dependency detected.");
    }

    let level = account.level;
    let ancestors = account.ancestors;
    let accountType = account.accountType;
    const payload = {
      ...updateData,
      currency: updateData.currency || account.currency || "INR",
    };

    if (payload.parentAccount) {
      const parent = await accountRepository.findById(
        payload.parentAccount,
      );

      if (!parent) {
        throw new ApiError(404, "Parent account not found.");
      }

      level = parent.level + 1;

      ancestors = [...parent.ancestors, parent._id];

      accountType = parent.accountType;
    }

    const updatedAccount = await accountRepository.update(accountId, {
      ...payload,
      level,
      ancestors,
      accountType,
      updatedBy: userId,
    });

    return updatedAccount;
  }

  async updateStatus(accountId, status, userId) {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw new ApiError(404, "Account not found.");
    }

    return accountRepository.update(accountId, {
      status,
      updatedBy: userId,
    });
  }
  async cascadePathUpdate(accountId) {
    const parent = await accountRepository.findById(accountId);

    const descendants = await accountRepository.findDescendants(accountId);

    for (const descendant of descendants) {
      const ancestorIndex = descendant.ancestors.findIndex(
        (id) => id.toString() === parent._id.toString(),
      );

      descendant.ancestors = [
        ...parent.ancestors,
        parent._id,
        ...descendant.ancestors.slice(ancestorIndex + 1),
      ];

      await descendant.save();
    }
  }

  async deleteAccount(accountId) {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw new ApiError(404, "Account not found.");
    }

    const hasChildren = await accountRepository.hasChildren(accountId);

    if (hasChildren) {
      throw new ApiError(400, "Cannot delete account with child accounts.");
    }

    return accountRepository.update(accountId, {
      status: "INACTIVE",
    });
  }
}

export default new AccountService();
