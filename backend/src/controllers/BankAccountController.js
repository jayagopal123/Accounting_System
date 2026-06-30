import bankAccountService from "../services/BankAccountService.js";
import catchAsync from "../utils/catchAsync.js";

class BankAccountController {
  createBankAccount = catchAsync(async (req, res) => {
    const bankAccount = await bankAccountService.createBankAccount({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Bank account created successfully.",
      data: bankAccount,
    });
  });

  getBankAccounts = catchAsync(async (req, res) => {
    const bankAccounts = await bankAccountService.getBankAccounts();

    res.status(200).json({
      success: true,
      data: bankAccounts,
    });
  });

  getBankAccountById = catchAsync(async (req, res) => {
    const bankAccount = await bankAccountService.getBankAccountById(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: bankAccount,
    });
  });

  updateBankAccount = catchAsync(async (req, res) => {
    const bankAccount = await bankAccountService.updateBankAccount(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
    );

    res.status(200).json({
      success: true,
      message: "Bank account updated successfully.",
      data: bankAccount,
    });
  });

  toggleBankAccountStatus = catchAsync(async (req, res) => {
    const bankAccount = await bankAccountService.toggleBankAccountStatus(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: `Bank account ${bankAccount.isActive ? "activated" : "deactivated"} successfully.`,
      data: bankAccount,
    });
  });
}

export default new BankAccountController();
