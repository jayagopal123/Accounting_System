import budgetRepository from "../repositories/BudgetRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class BudgetService {
  async createBudget(data) {
    // Calculate total from line items
    if (data.lineItems && data.lineItems.length > 0) {
      data.totalAmount = data.lineItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
      );
    }

    const budget = await budgetRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "Budget",
      entityId: budget._id,
      entityName: budget.name,
      description: `Budget ${budget.name} was created for fiscal year ${budget.fiscalYear}`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return budget.populate(["fiscalYear", "costCenter", "lineItems.account"]);
  }

  async getBudgets() {
    return budgetRepository.find({}, [
      { path: "fiscalYear", select: "yearName" },
      { path: "costCenter", select: "name code" },
      { path: "lineItems.account", select: "accountCode accountName" },
    ]);
  }

  async getBudgetById(id) {
    const budget = await budgetRepository.findById(id, [
      { path: "fiscalYear", select: "yearName startDate endDate" },
      { path: "costCenter", select: "name code" },
      { path: "lineItems.account", select: "accountCode accountName accountType" },
    ]);

    if (!budget) {
      throw new ApiError(404, "Budget not found", "BUDGET_NOT_FOUND");
    }

    return budget;
  }

  async updateBudget(id, data) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new ApiError(404, "Budget not found", "BUDGET_NOT_FOUND");
    }

    // Recalculate total if line items changed
    if (data.lineItems) {
      data.totalAmount = data.lineItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
      );
    }

    await budgetRepository.update(id, data);

    // Re-fetch with populated references (findByIdAndUpdate doesn't return populated docs reliably)
    const updated = await budgetRepository.findById(id, [
      { path: "fiscalYear", select: "yearName" },
      { path: "costCenter", select: "name code" },
      { path: "lineItems.account", select: "accountCode accountName" },
    ]);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "Budget",
      entityId: updated._id,
      entityName: updated.name,
      description: `Budget ${updated.name} was updated`,
      category: "business",
      performedBy: data.updatedBy || budget.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async approveBudget(id, userId) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new ApiError(404, "Budget not found", "BUDGET_NOT_FOUND");
    }
    if (budget.status !== "Draft") {
      throw new ApiError(400, "Only draft budgets can be approved", "INVALID_STATUS");
    }

    const approved = await budgetRepository.approve(id);

    await activityLogService.logActivity({
      action: "Approved",
      entity: "Budget",
      entityId: approved._id,
      entityName: approved.name,
      description: `Budget ${approved.name} was approved`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return approved;
  }

  async closeBudget(id, userId) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new ApiError(404, "Budget not found", "BUDGET_NOT_FOUND");
    }
    if (budget.status === "Closed") {
      throw new ApiError(400, "Budget already closed", "ALREADY_CLOSED");
    }

    const closed = await budgetRepository.close(id);

    await activityLogService.logActivity({
      action: "Closed",
      entity: "Budget",
      entityId: closed._id,
      entityName: closed.name,
      description: `Budget ${closed.name} was closed`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return closed;
  }

  async getBudgetVsActual(budgetId) {
    const budget = await budgetRepository.findById(budgetId, [
      { path: "fiscalYear", select: "yearName startDate endDate" },
      { path: "costCenter", select: "name code" },
      { path: "lineItems.account", select: "accountCode accountName" },
    ]);

    if (!budget) {
      throw new ApiError(404, "Budget not found", "BUDGET_NOT_FOUND");
    }

    const budgetVsActual = await Promise.all(
      budget.lineItems.map(async (line) => {
        // Find actual debit/credit postings for this account and fiscal year
        const actuals = await journalEntryRepository.find({
          "lineItems.account": line.account._id,
          status: "Submitted",
          date: {
            $gte: budget.fiscalYear.startDate,
            $lte: budget.fiscalYear.endDate,
          },
        });

        let actualAmount = 0;
        actuals.forEach((je) => {
          je.lineItems.forEach((li) => {
            if (String(li.account) === String(line.account._id)) {
              actualAmount += (li.debitAmount || 0) - (li.creditAmount || 0);
            }
          });
        });

        // Actual amounts are always positive for budget comparison
        const signedActual = Math.abs(actualAmount);

        return {
          account: line.account,
          budgetedAmount: line.amount,
          actualAmount: signedActual,
          variance: line.amount - signedActual,
          variancePercentage:
            line.amount > 0
              ? (((line.amount - signedActual) / line.amount) * 100).toFixed(1)
              : "0.0",
          notes: line.notes,
        };
      }),
    );

    return {
      budget,
      lines: budgetVsActual,
      totals: {
        budgeted: budget.totalAmount,
        actual: budgetVsActual.reduce((sum, l) => sum + l.actualAmount, 0),
        variance: budgetVsActual.reduce((sum, l) => sum + l.variance, 0),
      },
    };
  }
}

export default new BudgetService();
