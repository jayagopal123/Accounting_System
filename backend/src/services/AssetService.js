import assetRepository from "../repositories/AssetRepository.js";
import assetCategoryRepository from "../repositories/AssetCategoryRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class AssetService {
  async createAsset(data) {
    const existing = await assetRepository.findByCode(data.assetCode);
    if (existing) {
      throw new ApiError(409, "Asset with this code already exists", "DUPLICATE_ASSET_CODE");
    }

    // Validate category exists
    const category = await assetCategoryRepository.findById(data.category);
    if (!category) {
      throw new ApiError(404, "Asset category not found", "CATEGORY_NOT_FOUND");
    }

    // Set defaults from category if not provided
    if (!data.usefulLife) data.usefulLife = category.defaultUsefulLife;
    if (!data.depreciationMethod) data.depreciationMethod = category.defaultDepreciationMethod;
    if (!data.salvageValue) {
      data.salvageValue = (data.purchaseCost * category.defaultSalvageValuePercent) / 100;
    }
    if (!data.glAccount) data.glAccount = category.glAccount;
    if (!data.depreciationExpenseAccount) data.depreciationExpenseAccount = category.depreciationExpenseAccount;
    if (!data.accumulatedDepreciationAccount) data.accumulatedDepreciationAccount = category.accumulatedDepreciationAccount;

    // Set current value to purchase cost initially
    data.currentValue = data.purchaseCost;

    // Set next depreciation date
    data.nextDepreciationDate = this.calculateNextDepreciationDate(
      data.purchaseDate,
      data.usefulLife,
    );

    const asset = await assetRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "Asset",
      entityId: asset._id,
      entityName: asset.assetName,
      description: `Asset ${asset.assetName} (${asset.assetCode}) was created with cost ${asset.purchaseCost}`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return asset;
  }

  async getAssets() {
    return assetRepository.findAll();
  }

  async getAssetById(id) {
    const asset = await assetRepository.findById(id, [
      { path: "category", select: "categoryName categoryCode defaultUsefulLife defaultDepreciationMethod" },
      { path: "glAccount", select: "accountCode accountName" },
      { path: "depreciationExpenseAccount", select: "accountCode accountName" },
      { path: "accumulatedDepreciationAccount", select: "accountCode accountName" },
    ]);
    if (!asset) {
      throw new ApiError(404, "Asset not found", "ASSET_NOT_FOUND");
    }
    return asset;
  }

  async updateAsset(id, data) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new ApiError(404, "Asset not found", "ASSET_NOT_FOUND");
    }

    if (asset.status !== "Draft") {
      throw new ApiError(400, "Only draft assets can be edited", "INVALID_STATUS");
    }

    if (data.assetCode && data.assetCode !== asset.assetCode) {
      const existing = await assetRepository.findByCode(data.assetCode);
      if (existing) {
        throw new ApiError(409, "Asset with this code already exists", "DUPLICATE_ASSET_CODE");
      }
    }

    const updated = await assetRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "Asset",
      entityId: updated._id,
      entityName: updated.assetName,
      description: `Asset ${updated.assetName} was updated`,
      category: "business",
      performedBy: data.updatedBy || asset.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async activateAsset(id, userId) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new ApiError(404, "Asset not found", "ASSET_NOT_FOUND");
    }

    if (asset.status !== "Draft") {
      throw new ApiError(400, "Only draft assets can be activated", "INVALID_STATUS");
    }

    const activated = await assetRepository.activate(id);

    // Create journal entry for asset capitalization
    try {
      const assetAccount = asset.glAccount
        ? await accountRepository.findById(asset.glAccount)
        : null;
      const bankAccount = await accountRepository.findByCode("1202"); // Bank account

      if (assetAccount && bankAccount) {
        const voucherNumber = `DEP-${asset.assetCode}-CAP`;
        await journalEntryRepository.create({
          voucherNumber,
          date: asset.purchaseDate,
          referenceType: "Asset",
          referenceNumber: asset.assetCode,
          remarks: `Capitalization of asset ${asset.assetName} (${asset.assetCode})`,
          totalDebit: asset.purchaseCost,
          totalCredit: asset.purchaseCost,
          status: "Submitted",
          createdBy: userId,
          lineItems: [
            {
              account: assetAccount._id,
              debitAmount: asset.purchaseCost,
              creditAmount: 0,
              description: `Asset ${asset.assetName} capitalized`,
            },
            {
              account: bankAccount._id,
              debitAmount: 0,
              creditAmount: asset.purchaseCost,
              description: `Payment for ${asset.assetName}`,
            },
          ],
        });
      }
    } catch (err) {
      console.error(`Failed to create capitalization journal for asset ${asset.assetCode}:`, err.message);
    }

    await activityLogService.logActivity({
      action: "Activated",
      entity: "Asset",
      entityId: activated._id,
      entityName: activated.assetName,
      description: `Asset ${activated.assetName} was activated and capitalized`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return activated;
  }

  async disposeAsset(id, data, userId) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new ApiError(404, "Asset not found", "ASSET_NOT_FOUND");
    }

    if (asset.status === "Draft" || asset.status === "Disposed" || asset.status === "Sold") {
      throw new ApiError(400, `Cannot dispose asset with status ${asset.status}`, "INVALID_STATUS");
    }

    const disposed = await assetRepository.dispose(id, {
      ...data,
      updatedBy: userId,
    });

    // Create journal entry for disposal
    try {
      const assetAccount = asset.glAccount
        ? await accountRepository.findById(asset.glAccount)
        : null;
      const accDepAccount = asset.accumulatedDepreciationAccount
        ? await accountRepository.findById(asset.accumulatedDepreciationAccount)
        : null;
      const bankAccount = await accountRepository.findByCode("1202");
      const lossAccount = await accountRepository.findByCode("5100"); // Indirect Expenses

      if (assetAccount && accDepAccount) {
        const netBookValue = asset.currentValue;
        const saleAmount = data.disposalAmount || 0;
        const gainLoss = saleAmount - netBookValue;

        const lineItems = [
          {
            account: accDepAccount._id,
            debitAmount: asset.accumulatedDepreciation,
            creditAmount: 0,
            description: `Accumulated depreciation written off`,
          },
        ];

        if (saleAmount > 0 && bankAccount) {
          lineItems.push({
            account: bankAccount._id,
            debitAmount: saleAmount,
            creditAmount: 0,
            description: `Sale proceeds from ${asset.assetName}`,
          });
        }

        lineItems.push({
          account: assetAccount._id,
          debitAmount: 0,
          creditAmount: asset.purchaseCost,
          description: `Asset ${asset.assetName} disposed`,
        });

        if (gainLoss !== 0 && lossAccount) {
          if (gainLoss < 0) {
            lineItems.push({
              account: lossAccount._id,
              debitAmount: Math.abs(gainLoss),
              creditAmount: 0,
              description: `Loss on disposal of ${asset.assetName}`,
            });
          } else {
            lineItems.push({
              account: lossAccount._id,
              debitAmount: 0,
              creditAmount: gainLoss,
              description: `Gain on disposal of ${asset.assetName}`,
            });
          }
        }

        const totalDebit = lineItems.reduce((s, i) => s + i.debitAmount, 0);
        const totalCredit = lineItems.reduce((s, i) => s + i.creditAmount, 0);

        await journalEntryRepository.create({
          voucherNumber: `DEP-${asset.assetCode}-DSP`,
          date: data.disposalDate || new Date(),
          referenceType: "Asset",
          referenceNumber: asset.assetCode,
          remarks: `Disposal of asset ${asset.assetName} (${asset.assetCode})`,
          totalDebit,
          totalCredit,
          status: "Submitted",
          createdBy: userId,
          lineItems,
        });
      }
    } catch (err) {
      console.error(`Failed to create disposal journal for asset ${asset.assetCode}:`, err.message);
    }

    await activityLogService.logActivity({
      action: "Disposed",
      entity: "Asset",
      entityId: disposed._id,
      entityName: disposed.assetName,
      description: `Asset ${disposed.assetName} was disposed`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return disposed;
  }

  async runDepreciation(assetId, userId) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new ApiError(404, "Asset not found", "ASSET_NOT_FOUND");
    }

    if (asset.status !== "Active") {
      throw new ApiError(400, "Only active assets can be depreciated", "INVALID_STATUS");
    }

    if (asset.depreciationMethod === "None") {
      throw new ApiError(400, "Asset depreciation method is set to None", "NO_DEPRECIATION");
    }

    const monthlyDepreciation = this.calculateMonthlyDepreciation(asset);
    if (monthlyDepreciation <= 0) {
      throw new ApiError(400, "Asset is already fully depreciated", "FULLY_DEPRECIATED");
    }

    const newAccumulatedDep = asset.accumulatedDepreciation + monthlyDepreciation;
    const newCurrentValue = Math.max(0, asset.purchaseCost - newAccumulatedDep);
    const newStatus = newCurrentValue <= asset.salvageValue ? "Depreciated" : "Active";

    const nextDate = new Date(asset.nextDepreciationDate || asset.purchaseDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const updated = await assetRepository.update(assetId, {
      accumulatedDepreciation: newAccumulatedDep,
      currentValue: newCurrentValue,
      lastDepreciationDate: new Date(),
      nextDepreciationDate: nextDate,
      status: newStatus,
    });

    // Create journal entry for depreciation
    try {
      const expAccount = asset.depreciationExpenseAccount
        ? await accountRepository.findById(asset.depreciationExpenseAccount)
        : null;
      const accDepAccount = asset.accumulatedDepreciationAccount
        ? await accountRepository.findById(asset.accumulatedDepreciationAccount)
        : null;

      if (expAccount && accDepAccount) {
        await journalEntryRepository.create({
          voucherNumber: `DEP-${asset.assetCode}-${String(new Date().getMonth() + 1).padStart(2, "0")}${new Date().getFullYear()}`,
          date: new Date(),
          referenceType: "Asset",
          referenceNumber: asset.assetCode,
          remarks: `Monthly depreciation for ${asset.assetName}`,
          totalDebit: monthlyDepreciation,
          totalCredit: monthlyDepreciation,
          status: "Submitted",
          createdBy: userId,
          lineItems: [
            {
              account: expAccount._id,
              debitAmount: monthlyDepreciation,
              creditAmount: 0,
              description: `Depreciation expense for ${asset.assetName}`,
            },
            {
              account: accDepAccount._id,
              debitAmount: 0,
              creditAmount: monthlyDepreciation,
              description: `Accumulated depreciation for ${asset.assetName}`,
            },
          ],
        });
      }
    } catch (err) {
      console.error(`Failed to create depreciation journal for asset ${asset.assetCode}:`, err.message);
    }

    return updated;
  }

  async runBulkDepreciation(userId) {
    const assetsDue = await assetRepository.findDueForDepreciation();
    const results = [];

    for (const asset of assetsDue) {
      try {
        const monthlyDep = this.calculateMonthlyDepreciation(asset);
        if (monthlyDep <= 0) continue;

        const newAccumulatedDep = asset.accumulatedDepreciation + monthlyDep;
        const newCurrentValue = Math.max(0, asset.purchaseCost - newAccumulatedDep);
        const newStatus = newCurrentValue <= asset.salvageValue ? "Depreciated" : "Active";

        const nextDate = new Date(asset.nextDepreciationDate || asset.purchaseDate);
        nextDate.setMonth(nextDate.getMonth() + 1);

        await assetRepository.update(asset._id, {
          accumulatedDepreciation: newAccumulatedDep,
          currentValue: newCurrentValue,
          lastDepreciationDate: new Date(),
          nextDepreciationDate: nextDate,
          status: newStatus,
        });

        // Create journal entry
        const expAccount = asset.depreciationExpenseAccount
          ? await accountRepository.findById(asset.depreciationExpenseAccount)
          : null;
        const accDepAccount = asset.accumulatedDepreciationAccount
          ? await accountRepository.findById(asset.accumulatedDepreciationAccount)
          : null;

        if (expAccount && accDepAccount) {
          await journalEntryRepository.create({
            voucherNumber: `DEP-BULK-${String(new Date().getMonth() + 1).padStart(2, "0")}${new Date().getFullYear()}-${asset.assetCode}`,
            date: new Date(),
            referenceType: "Asset",
            referenceNumber: asset.assetCode,
            remarks: `Bulk monthly depreciation for ${asset.assetName}`,
            totalDebit: monthlyDep,
            totalCredit: monthlyDep,
            status: "Submitted",
            createdBy: userId,
            lineItems: [
              {
                account: expAccount._id,
                debitAmount: monthlyDep,
                creditAmount: 0,
                description: `Depreciation expense for ${asset.assetName}`,
              },
              {
                account: accDepAccount._id,
                debitAmount: 0,
                creditAmount: monthlyDep,
                description: `Accumulated depreciation for ${asset.assetName}`,
              },
            ],
          });
        }

        results.push({ assetCode: asset.assetCode, depreciationAmount: monthlyDep, success: true });
      } catch (err) {
        results.push({ assetCode: asset.assetCode, error: err.message, success: false });
      }
    }

    await activityLogService.logActivity({
      action: "Bulk Depreciation",
      entity: "Asset",
      entityId: null,
      entityName: "Bulk Depreciation Run",
      description: `Bulk depreciation run completed for ${results.filter((r) => r.success).length} assets`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return results;
  }

  async getAssetSummary() {
    return assetRepository.getTotalAssetValue();
  }

  async getDepreciationSummary() {
    return assetRepository.getDepreciationSummaryByCategory();
  }

  // --- Depreciation Calculation Helpers ---

  calculateMonthlyDepreciation(asset) {
    const remainingValue = asset.purchaseCost - asset.salvageValue - asset.accumulatedDepreciation;
    if (remainingValue <= 0) return 0;

    switch (asset.depreciationMethod) {
      case "StraightLine": {
        const totalMonths = asset.usefulLife;
        const monthlyDep = (asset.purchaseCost - asset.salvageValue) / totalMonths;
        return Math.min(monthlyDep, remainingValue);
      }
      case "WrittenDownValue": {
        const annualRate = 2 / (asset.usefulLife / 12); // Double declining
        const monthlyRate = annualRate / 12;
        const monthlyDep = (asset.currentValue || asset.purchaseCost) * monthlyRate;
        return Math.min(monthlyDep, remainingValue);
      }
      case "SumOfYearsDigits": {
        const remainingLife = asset.usefulLife - Math.floor(
          (Date.now() - new Date(asset.purchaseDate).getTime()) / (30 * 24 * 60 * 60 * 1000),
        );
        if (remainingLife <= 0) return remainingValue;
        const sumOfYears = (asset.usefulLife * (asset.usefulLife + 1)) / 2;
        const annualDep = ((asset.purchaseCost - asset.salvageValue) * remainingLife) / sumOfYears;
        return Math.min(annualDep / 12, remainingValue);
      }
      default:
        return 0;
    }
  }

  calculateNextDepreciationDate(purchaseDate, usefulLifeMonths) {
    const date = new Date(purchaseDate);
    date.setMonth(date.getMonth() + 1);
    return date;
  }
}

export default new AssetService();
