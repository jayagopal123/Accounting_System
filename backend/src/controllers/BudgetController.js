import budgetService from "../services/BudgetService.js";
import catchAsync from "../utils/catchAsync.js";

class BudgetController {
  createBudget = catchAsync(async (req, res) => {
    const budget = await budgetService.createBudget({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully.",
      data: budget,
    });
  });

  getBudgets = catchAsync(async (req, res) => {
    const budgets = await budgetService.getBudgets();

    res.status(200).json({
      success: true,
      data: budgets,
    });
  });

  getBudgetById = catchAsync(async (req, res) => {
    const budget = await budgetService.getBudgetById(req.params.id);

    res.status(200).json({
      success: true,
      data: budget,
    });
  });

  updateBudget = catchAsync(async (req, res) => {
    const budget = await budgetService.updateBudget(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      data: budget,
    });
  });

  approveBudget = catchAsync(async (req, res) => {
    const budget = await budgetService.approveBudget(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Budget approved successfully.",
      data: budget,
    });
  });

  closeBudget = catchAsync(async (req, res) => {
    const budget = await budgetService.closeBudget(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Budget closed successfully.",
      data: budget,
    });
  });

  getBudgetVsActual = catchAsync(async (req, res) => {
    const report = await budgetService.getBudgetVsActual(req.params.id);

    res.status(200).json({
      success: true,
      data: report,
    });
  });
}

export default new BudgetController();
