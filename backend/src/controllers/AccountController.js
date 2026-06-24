import accountService from "../services/AccountService.js";
import catchAsync from "../utils/catchAsync.js";

class AccountController {
  createAccount = catchAsync(async (req, res) => {
    const account = await accountService.createAccount(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: account,
    });
  });

  getAccountTree = catchAsync(async (req, res) => {
    const tree = await accountService.getAccountTree(req.user.companyId);

    res.status(200).json({
      success: true,
      data: tree,
    });
  });

  updateStatus = catchAsync(async (req, res) => {
    const account = await accountService.updateStatus(
      req.params.id,
      req.body.status,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Account status updated successfully.",
      data: account,
    });
  });

  deleteAccount = catchAsync(async (req, res) => {
    await accountService.deleteAccount(req.params.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  });
  getAccounts = catchAsync(async (req, res) => {
    const accounts = await accountService.getAccounts(req.user.companyId);

    res.status(200).json({
      success: true,
      data: accounts,
    });
  });

  getAccountById = catchAsync(async (req, res) => {
    const account = await accountService.getAccountById(
      req.params.id,
      req.user.companyId,
    );

    res.status(200).json({
      success: true,
      data: account,
    });
  });

  updateAccount = catchAsync(async (req, res) => {
    const account = await accountService.updateAccount(
      req.params.id,
      req.body,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Account updated successfully.",
      data: account,
    });
  });
}

export default new AccountController();
