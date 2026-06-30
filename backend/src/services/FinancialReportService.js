import JournalEntry from "../models/JournalEntry.js";
import Account from "../models/Account.js";
import ApiError from "../utils/ApiError.js";

class FinancialReportService {
  // =========================================================================
  // Shared helpers
  // =========================================================================

  /**
   * Build a date-filtered aggregation pipeline that unwinds lineItems and
   * returns all posted (Submitted) entries as an array of plain line-item
   * objects enriched with journal-level metadata.
   */
  _buildLineItemPipeline({ startDate, endDate, accountId } = {}) {
    const match = { status: "Submitted" };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: match },
      { $sort: { date: 1, createdAt: 1 } },
      { $unwind: "$lineItems" },
    ];

    if (accountId) {
      pipeline.push({
        $match: { "lineItems.account": accountId },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "accounts",
          localField: "lineItems.account",
          foreignField: "_id",
          as: "accountInfo",
        },
      },
      { $unwind: { path: "$accountInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          date: 1,
          voucherNumber: 1,
          remarks: 1,
          referenceType: 1,
          referenceNumber: 1,
          "lineItems.account": 1,
          "lineItems.debitAmount": 1,
          "lineItems.creditAmount": 1,
          "lineItems.description": 1,
          accountCode: "$accountInfo.accountCode",
          accountName: "$accountInfo.accountName",
          accountType: "$accountInfo.accountType",
          isGroup: "$accountInfo.isGroup",
          parentAccount: "$accountInfo.parentAccount",
          ancestors: "$accountInfo.ancestors",
        },
      },
    );

    return pipeline;
  }

  /**
   * Compute net balance for every non-group leaf account based on its type.
   *   Asset / Expense  →  balance = totalDebits - totalCredits
   *   Liab / Equity / Income →  balance = totalCredits - totalDebits
   */
  async _computeAccountBalances({ startDate, endDate } = {}) {
    const match = { status: "Submitted" };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const results = await JournalEntry.aggregate([
      { $match: match },
      { $unwind: "$lineItems" },
      {
        $group: {
          _id: "$lineItems.account",
          totalDebit: { $sum: "$lineItems.debitAmount" },
          totalCredit: { $sum: "$lineItems.creditAmount" },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },
      {
        $project: {
          _id: 1,
          accountCode: "$account.accountCode",
          accountName: "$account.accountName",
          accountType: "$account.accountType",
          isGroup: "$account.isGroup",
          parentAccount: "$account.parentAccount",
          ancestors: "$account.ancestors",
          level: "$account.level",
          totalDebit: 1,
          totalCredit: 1,
          balance: {
            $cond: {
              if: {
                $in: ["$account.accountType", ["ASSET", "EXPENSE"]],
              },
              then: { $subtract: ["$totalDebit", "$totalCredit"] },
              else: { $subtract: ["$totalCredit", "$totalDebit"] },
            },
          },
        },
      },
      { $sort: { accountCode: 1 } },
    ]);

    return results;
  }

  /**
   * Build a hierarchical tree from a flat list of accounts with balances.
   */
  _buildTree(accounts, allAccounts) {
    const map = {};
    const tree = [];

    // Build map: all accounts (including groups) from the full account list
    for (const acc of allAccounts) {
      map[acc._id.toString()] = {
        _id: acc._id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        isGroup: acc.isGroup,
        level: acc.level,
        parentAccount: acc.parentAccount,
        ancestors: acc.ancestors,
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        children: [],
      };
    }

    // Merge computed balances into the map
    for (const acc of accounts) {
      const id = acc._id.toString();
      if (map[id]) {
        map[id].totalDebit = acc.totalDebit;
        map[id].totalCredit = acc.totalCredit;
        map[id].balance = acc.balance;
      }
    }

    // Build tree
    const accountArray = Object.values(map);
    for (const acc of accountArray) {
      if (acc.parentAccount && map[acc.parentAccount.toString()]) {
        map[acc.parentAccount.toString()].children.push(acc);
      } else if (!acc.parentAccount) {
        tree.push(acc);
      }
    }

    // Compute group balances by summing children
    this._rollUp(tree);
    return tree;
  }

  _rollUp(nodes) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        this._rollUp(node.children);
        node.totalDebit = node.children.reduce(
          (sum, c) => sum + c.totalDebit,
          0,
        );
        node.totalCredit = node.children.reduce(
          (sum, c) => sum + c.totalCredit,
          0,
        );
        node.balance = node.children.reduce((sum, c) => sum + c.balance, 0);
      }
    }
  }

  // =========================================================================
  // 1. General Ledger
  // =========================================================================

  async getGeneralLedger(params = {}) {
    const { startDate, endDate, accountId } = params;

    const pipeline = this._buildLineItemPipeline({
      startDate,
      endDate,
      accountId,
    });

    const lineItems = await JournalEntry.aggregate(pipeline);

    // Compute running balance per account
    const runningBalances = {};
    const result = [];

    for (const item of lineItems) {
      const accId = item.lineItems.account.toString();
      const debit = item.lineItems.debitAmount || 0;
      const credit = item.lineItems.creditAmount || 0;

      if (!runningBalances[accId]) {
        runningBalances[accId] = 0;
      }

      const accountType = item.accountType;
      if (accountType === "ASSET" || accountType === "EXPENSE") {
        runningBalances[accId] += debit - credit;
      } else {
        runningBalances[accId] += credit - debit;
      }

      result.push({
        date: item.date,
        voucherNumber: item.voucherNumber,
        remarks: item.remarks,
        referenceType: item.referenceType,
        referenceNumber: item.referenceNumber,
        account: {
          _id: item.lineItems.account,
          accountCode: item.accountCode,
          accountName: item.accountName,
          accountType: item.accountType,
        },
        debit,
        credit,
        description: item.lineItems.description,
        runningBalance: runningBalances[accId],
      });
    }

    // Compute summary totals
    const totalDebits = result.reduce((s, r) => s + r.debit, 0);
    const totalCredits = result.reduce((s, r) => s + r.credit, 0);

    return {
      entries: result,
      summary: {
        totalEntries: result.length,
        totalDebits,
        totalCredits,
      },
    };
  }

  // =========================================================================
  // 2. Trial Balance
  // =========================================================================

  async getTrialBalance(params = {}) {
    const { startDate, endDate } = params;

    const balances = await this._computeAccountBalances({ startDate, endDate });

    // Also fetch all accounts (including groups without transactions)
    const allAccounts = await Account.find({ status: "ACTIVE" })
      .sort({ accountCode: 1 })
      .lean();

    const tree = this._buildTree(balances, allAccounts);

    // Flatten tree for flat view
    const flatRows = [];
    const flatten = (nodes, depth = 0) => {
      for (const node of nodes) {
        flatRows.push({
          ...node,
          depth,
        });
        if (node.children && node.children.length > 0) {
          flatten(node.children, depth + 1);
        }
      }
    };
    flatten(tree);

    // Verify balance
    const totalDebits = flatRows.reduce(
      (s, r) => s + (r.accountType === "ASSET" || r.accountType === "EXPENSE" ? Math.abs(r.balance) : 0),
      0,
    );
    const totalCredits = flatRows.reduce(
      (s, r) => s + (r.accountType === "LIABILITY" || r.accountType === "EQUITY" || r.accountType === "INCOME" ? Math.abs(r.balance) : 0),
      0,
    );

    return {
      rows: flatRows,
      tree,
      totals: {
        totalDebit: balances.reduce((s, r) => s + r.totalDebit, 0),
        totalCredit: balances.reduce((s, r) => s + r.totalCredit, 0),
        totalDebitBalance: totalDebits,
        totalCreditBalance: totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      },
    };
  }

  // =========================================================================
  // 3. Profit & Loss Statement
  // =========================================================================

  async getProfitAndLoss(params = {}) {
    const { startDate, endDate } = params;

    const balances = await this._computeAccountBalances({ startDate, endDate });

    // Income accounts (credit balances)
    const incomeAccounts = balances.filter(
      (a) =>
        a.accountType === "INCOME" && !a.isGroup,
    );

    // Expense accounts (debit balances)
    const expenseAccounts = balances.filter(
      (a) =>
        a.accountType === "EXPENSE" && !a.isGroup,
    );

    // Revenue groups (parent of income accounts)
    const revenueGroup = balances.filter(
      (a) => a.accountType === "INCOME" && a.isGroup,
    );
    const expenseGroup = balances.filter(
      (a) => a.accountType === "EXPENSE" && a.isGroup,
    );

    const totalIncome = incomeAccounts.reduce(
      (sum, a) => sum + a.balance,
      0,
    );
    const totalExpenses = expenseAccounts.reduce(
      (sum, a) => sum + a.balance,
      0,
    );
    const netProfit = totalIncome - totalExpenses;

    return {
      income: {
        label: "Income",
        accounts: incomeAccounts.map((a) => ({
          accountCode: a.accountCode,
          accountName: a.accountName,
          balance: a.balance,
        })),
        total: totalIncome,
      },
      expenses: {
        label: "Expenses",
        accounts: expenseAccounts.map((a) => ({
          accountCode: a.accountCode,
          accountName: a.accountName,
          balance: a.balance,
        })),
        total: totalExpenses,
      },
      netProfit,
      netProfitLabel: netProfit >= 0 ? "Net Profit" : "Net Loss",
    };
  }

  // =========================================================================
  // 4. Balance Sheet
  // =========================================================================

  async getBalanceSheet(params = {}) {
    const { startDate, endDate } = params;

    // Get P&L for net profit inclusion in equity
    const pnl = await this.getProfitAndLoss({ startDate, endDate });

    const balances = await this._computeAccountBalances({ startDate, endDate });

    // Asset accounts (debit balances)
    const assetAccounts = balances.filter(
      (a) => a.accountType === "ASSET" && !a.isGroup,
    );

    // Liability accounts (credit balances)
    const liabilityAccounts = balances.filter(
      (a) => a.accountType === "LIABILITY" && !a.isGroup,
    );

    // Equity accounts (credit balances)
    const equityAccounts = balances.filter(
      (a) => a.accountType === "EQUITY" && !a.isGroup,
    );

    const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilityAccounts.reduce(
      (sum, a) => sum + a.balance,
      0,
    );
    const totalEquity =
      equityAccounts.reduce((sum, a) => sum + a.balance, 0) +
      (pnl.netProfit >= 0 ? pnl.netProfit : pnl.netProfit); // net profit/loss flows to equity

    return {
      assets: {
        label: "Assets",
        accounts: assetAccounts.map((a) => ({
          accountCode: a.accountCode,
          accountName: a.accountName,
          balance: a.balance,
        })),
        total: totalAssets,
      },
      liabilities: {
        label: "Liabilities",
        accounts: liabilityAccounts.map((a) => ({
          accountCode: a.accountCode,
          accountName: a.accountName,
          balance: a.balance,
        })),
        total: totalLiabilities,
      },
      equity: {
        label: "Equity",
        accounts: [
          ...equityAccounts.map((a) => ({
            accountCode: a.accountCode,
            accountName: a.accountName,
            balance: a.balance,
          })),
          {
            accountCode: "PNL",
            accountName: `Current ${pnl.netProfit >= 0 ? "Profit" : "Loss"}`,
            balance: pnl.netProfit,
          },
        ],
        total: totalEquity,
      },
      totals: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced:
          Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    };
  }

  // =========================================================================
  // 5. Cash Flow Statement (Indirect Method)
  // =========================================================================

  async getCashFlow(params = {}) {
    const { startDate, endDate } = params;

    const pnl = await this.getProfitAndLoss({ startDate, endDate });
    const netProfit = pnl.netProfit;

    // Get current period balances
    const currentBalances = await this._computeAccountBalances({
      startDate,
      endDate,
    });

    // Helper: get balance for an account code
    const getBalance = (code, list) => {
      const found = list.find((a) => a.accountCode === code);
      return found ? found.balance : 0;
    };

    // Cash & Bank accounts
    const cashAccountCodes = ["1201", "1202"];
    const cashIncrease = cashAccountCodes.reduce(
      (sum, code) => sum + getBalance(code, currentBalances),
      0,
    );

    // Working capital accounts
    const accountsReceivable = getBalance("1101", currentBalances);
    const accountsPayable = getBalance("2001", currentBalances);

    // Fixed assets
    const fixedAssetCodes = ["1301", "1302"];
    const fixedAssetChange = fixedAssetCodes.reduce(
      (sum, code) => sum + getBalance(code, currentBalances),
      0,
    );

    // Equity (excluding current year profit)
    const equityCodes = ["3001", "3002", "3100"];
    const equityChange = equityCodes.reduce(
      (sum, code) => sum + getBalance(code, currentBalances),
      0,
    );

    // --- Cash Flow Computation ---
    // Operating: Net Profit - Increase in Receivables + Increase in Payables
    const operatingCashFlow = netProfit - accountsReceivable + accountsPayable;

    // Investing: Purchase/Sale of Fixed Assets (negative = outflow)
    const investingCashFlow = -fixedAssetChange;

    // Financing: Changes in Equity (positive = inflow)
    const financingCashFlow = equityChange;

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    return {
      netProfit,
      operatingActivities: {
        label: "Cash Flow from Operating Activities",
        items: [
          {
            label: "Net Profit / (Loss)",
            amount: netProfit,
          },
          {
            label: "Adjustments for Working Capital Changes",
            isHeader: true,
            amount: 0,
          },
          {
            label: "Decrease / (Increase) in Accounts Receivable",
            amount: -accountsReceivable,
          },
          {
            label: "Increase / (Decrease) in Accounts Payable",
            amount: accountsPayable,
          },
        ],
        total: operatingCashFlow,
      },
      investingActivities: {
        label: "Cash Flow from Investing Activities",
        items: [
          {
            label: "Purchase of Fixed Assets",
            amount: -fixedAssetChange,
          },
        ],
        total: investingCashFlow,
      },
      financingActivities: {
        label: "Cash Flow from Financing Activities",
        items: [
          {
            label: "Change in Equity",
            amount: equityChange,
          },
        ],
        total: financingCashFlow,
      },
      netCashFlow,
      openingCashBalance: 0,
      closingCashBalance: cashIncrease,
    };
  }

  // =========================================================================
  // 6. Excel Export
  // =========================================================================

  async exportExcel(reportType, params = {}) {
    const XLSX = (await import("xlsx")).default;

    let data;
    let sheetName;
    let headers;
    let rows;

    switch (reportType) {
      case "trial-balance": {
        data = await this.getTrialBalance(params);
        sheetName = "Trial Balance";
        headers = [
          "Account Code",
          "Account Name",
          "Account Type",
          "Total Debit",
          "Total Credit",
          "Balance",
        ];
        rows = data.rows
          .filter((r) => !r.isGroup)
          .map((r) => [
            r.accountCode,
            r.accountName,
            r.accountType,
            r.totalDebit,
            r.totalCredit,
            r.balance,
          ]);
        break;
      }
      case "profit-loss": {
        data = await this.getProfitAndLoss(params);
        sheetName = "Profit & Loss";
        headers = ["Category", "Account Code", "Account Name", "Amount"];
        rows = [
          ...data.income.accounts.map((a) => ["Income", a.accountCode, a.accountName, a.balance]),
          [],
          ["Total Income", "", "", data.income.total],
          [],
          ...data.expenses.accounts.map((a) => ["Expense", a.accountCode, a.accountName, a.balance]),
          [],
          ["Total Expenses", "", "", data.expenses.total],
          [],
          [data.netProfitLabel, "", "", data.netProfit],
        ];
        break;
      }
      case "balance-sheet": {
        data = await this.getBalanceSheet(params);
        sheetName = "Balance Sheet";
        headers = ["Category", "Account Code", "Account Name", "Amount"];
        rows = [
          ...data.assets.accounts.map((a) => ["Assets", a.accountCode, a.accountName, a.balance]),
          [],
          ["Total Assets", "", "", data.assets.total],
          [],
          ...data.liabilities.accounts.map((a) => [
            "Liabilities",
            a.accountCode,
            a.accountName,
            a.balance,
          ]),
          [],
          ["Total Liabilities", "", "", data.liabilities.total],
          [],
          ...data.equity.accounts.map((a) => ["Equity", a.accountCode, a.accountName, a.balance]),
          [],
          ["Total Equity", "", "", data.equity.total],
        ];
        break;
      }
      case "general-ledger": {
        data = await this.getGeneralLedger(params);
        sheetName = "General Ledger";
        headers = [
          "Date",
          "Voucher",
          "Account Code",
          "Account Name",
          "Debit",
          "Credit",
          "Description",
          "Running Balance",
        ];
        rows = data.entries.map((r) => [
          r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
          r.voucherNumber,
          r.account.accountCode,
          r.account.accountName,
          r.debit,
          r.credit,
          r.description || "",
          r.runningBalance,
        ]);
        break;
      }
      case "cash-flow": {
        data = await this.getCashFlow(params);
        sheetName = "Cash Flow";
        headers = ["Section", "Item", "Amount"];
        rows = [
          [data.operatingActivities.label],
          ...data.operatingActivities.items.map((i) => [
            "Operating",
            i.label,
            i.amount,
          ]),
          ["", "Net Cash from Operating Activities", data.operatingActivities.total],
          [],
          [data.investingActivities.label],
          ...data.investingActivities.items.map((i) => [
            "Investing",
            i.label,
            i.amount,
          ]),
          ["", "Net Cash from Investing Activities", data.investingActivities.total],
          [],
          [data.financingActivities.label],
          ...data.financingActivities.items.map((i) => [
            "Financing",
            i.label,
            i.amount,
          ]),
          ["", "Net Cash from Financing Activities", data.financingActivities.total],
          [],
          ["", "Net Cash Flow", data.netCashFlow],
        ];
        break;
      }
      default:
        throw new ApiError(400, `Unknown report type: ${reportType}`);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  // =========================================================================
  // 7. PDF Export
  // =========================================================================

  async exportPdf(reportType, params = {}) {
    const PDFDocument = (await import("pdfkit")).default;

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: `Financial Report - ${reportType}`,
        Author: "ERP Accounting System",
      },
    });

    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("ERP Accounting System", { align: "center" });
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(
          `Financial Report: ${reportType
            .replace(/-/g, " ")
            .toUpperCase()}`,
          { align: "center" },
        );
      doc.moveDown(0.5);

      if (params.startDate || params.endDate) {
        doc
          .fontSize(9)
          .fillColor("#666")
          .text(
            `Period: ${params.startDate || "Earliest"} to ${params.endDate || "Latest"}`,
            { align: "center" },
          )
          .fillColor("#000");
      }

      doc.moveDown(1);
      doc
        .strokeColor("#ccc")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(0.5);

      // Content
      this._renderPdfContent(doc, reportType, params)
        .then(() => {
          doc.end();
        })
        .catch(reject);
    });
  }

  async _renderPdfContent(doc, reportType, params) {
    switch (reportType) {
      case "trial-balance":
        return this._renderTrialBalancePdf(doc, params);
      case "profit-loss":
        return this._renderProfitLossPdf(doc, params);
      case "balance-sheet":
        return this._renderBalanceSheetPdf(doc, params);
      case "general-ledger":
        return this._renderGeneralLedgerPdf(doc, params);
      case "cash-flow":
        return this._renderCashFlowPdf(doc, params);
      default:
        doc.text(`Unknown report type: ${reportType}`);
    }
  }

  async _renderTrialBalancePdf(doc, params) {
    const data = await this.getTrialBalance(params);
    const leafRows = data.rows.filter((r) => !r.isGroup);

    doc.fontSize(10).font("Helvetica-Bold").text("Trial Balance", { align: "center" });
    doc.moveDown(1);

    // Table header
    const col1 = 50;
    const col2 = 130;
    const col3 = 280;
    const col4 = 370;
    const col5 = 460;

    const drawHeader = (y) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("Code", col1, y, { width: 70 })
        .text("Account Name", col2, y, { width: 140 })
        .text("Type", col3, y, { width: 80 })
        .text("Debit", col4, y, { width: 75, align: "right" })
        .text("Credit", col5, y, { width: 75, align: "right" });
      doc
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .moveTo(col1, y + 14)
        .lineTo(540, y + 14)
        .stroke();
      return y + 18;
    };

    let y = drawHeader(doc.y);

    doc.font("Helvetica").fontSize(8);

    for (const row of leafRows) {
      if (y > 720) {
        doc.addPage();
        y = drawHeader(40);
      }

      const debit = row.accountType === "ASSET" || row.accountType === "EXPENSE" ? Math.abs(row.balance) : 0;
      const credit = row.accountType === "LIABILITY" || row.accountType === "EQUITY" || row.accountType === "INCOME" ? Math.abs(row.balance) : 0;

      doc
        .text(row.accountCode || "", col1, y, { width: 70 })
        .text(row.accountName || "", col2, y, { width: 140 })
        .text(row.accountType || "", col3, y, { width: 80 })
        .text(debit ? debit.toFixed(2) : "", col4, y, { width: 75, align: "right" })
        .text(credit ? credit.toFixed(2) : "", col5, y, { width: 75, align: "right" });
      y += 14;
    }

    // Totals
    doc.moveDown(1);
    doc
      .strokeColor("#000")
      .lineWidth(0.5)
      .moveTo(col1, doc.y)
      .lineTo(540, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(9);
    doc
      .text("Total", col1, doc.y, { width: 220 })
      .text(
        data.totals.totalDebit.toFixed(2),
        col4,
        doc.y - 12,
        { width: 75, align: "right" },
      )
      .text(
        data.totals.totalCredit.toFixed(2),
        col5,
        doc.y - 12,
        { width: 75, align: "right" },
      );
  }

  async _renderProfitLossPdf(doc, params) {
    const data = await this.getProfitAndLoss(params);

    doc.fontSize(10).font("Helvetica-Bold").text("Profit & Loss Statement", { align: "center" });
    doc.moveDown(1);

    const col1 = 50;
    const col3 = 460;

    const renderSection = (label, accounts, total) => {
      doc.fontSize(9).font("Helvetica-Bold").text(label, col1, doc.y);
      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(8);

      for (const acc of accounts) {
        doc.text(`${acc.accountCode} - ${acc.accountName}`, col1, doc.y, {
          width: 400,
        });
        doc.text(acc.balance.toFixed(2), col3, doc.y - 12, {
          width: 75,
          align: "right",
        });
        doc.moveDown(0.3);
      }

      doc.moveDown(0.3);
      doc
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .moveTo(col1, doc.y)
        .lineTo(540, doc.y)
        .stroke();
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(9);
      doc
        .text(`Total ${label}`, col1, doc.y, { width: 300 })
        .text(total.toFixed(2), col3, doc.y - 12, {
          width: 75,
          align: "right",
        });
      doc.moveDown(1);
    };

    renderSection("Income", data.income.accounts, data.income.total);
    renderSection("Expenses", data.expenses.accounts, data.expenses.total);

    doc.moveDown(0.5);
    doc
      .strokeColor("#000")
      .lineWidth(1)
      .moveTo(col1, doc.y)
      .lineTo(540, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica-Bold");
    doc
      .text(data.netProfitLabel, col1, doc.y, { width: 300 })
      .text(data.netProfit.toFixed(2), col3, doc.y - 14, {
        width: 75,
        align: "right",
      });
  }

  async _renderBalanceSheetPdf(doc, params) {
    const data = await this.getBalanceSheet(params);

    doc.fontSize(10).font("Helvetica-Bold").text("Balance Sheet", { align: "center" });
    doc.moveDown(1);

    const col1 = 50;
    const col3 = 460;

    const renderSection = (label, accounts, total) => {
      doc.fontSize(9).font("Helvetica-Bold").text(label, col1, doc.y);
      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(8);

      for (const acc of accounts) {
        doc.text(`${acc.accountCode} - ${acc.accountName}`, col1, doc.y, {
          width: 400,
        });
        doc.text(Math.abs(acc.balance).toFixed(2), col3, doc.y - 12, {
          width: 75,
          align: "right",
        });
        doc.moveDown(0.3);
      }

      doc.moveDown(0.3);
      doc
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .moveTo(col1, doc.y)
        .lineTo(540, doc.y)
        .stroke();
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(9);
      doc
        .text(`Total ${label}`, col1, doc.y, { width: 300 })
        .text(Math.abs(total).toFixed(2), col3, doc.y - 12, {
          width: 75,
          align: "right",
        });
      doc.moveDown(1);
    };

    renderSection("Assets", data.assets.accounts, data.assets.total);
    renderSection("Liabilities", data.liabilities.accounts, data.liabilities.total);
    renderSection("Equity", data.equity.accounts, data.equity.total);

    doc.moveDown(0.5);
    doc
      .strokeColor("#000")
      .lineWidth(1)
      .moveTo(col1, doc.y)
      .lineTo(540, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica-Bold");
    doc
      .text(
        `${data.totals.isBalanced ? "✓ Balanced" : "✗ Not Balanced"}  |  Assets: ${data.totals.totalAssets.toFixed(2)}  =  Liabilities: ${data.totals.totalLiabilities.toFixed(2)}  +  Equity: ${data.totals.totalEquity.toFixed(2)}`,
        col1,
        doc.y,
        { width: 500 },
      );
  }

  async _renderGeneralLedgerPdf(doc, params) {
    const data = await this.getGeneralLedger(params);

    doc.fontSize(10).font("Helvetica-Bold").text("General Ledger", { align: "center" });
    doc.moveDown(1);

    const col1 = 50;
    const col2 = 100;
    const col3 = 170;
    const col4 = 280;
    const col5 = 370;
    const col6 = 460;

    const drawHeader = (y) => {
      doc
        .fontSize(7)
        .font("Helvetica-Bold")
        .text("Date", col1, y, { width: 45 })
        .text("Voucher", col2, y, { width: 65 })
        .text("Account", col3, y, { width: 100 })
        .text("Debit", col4, y, { width: 65, align: "right" })
        .text("Credit", col5, y, { width: 65, align: "right" })
        .text("Balance", col6, y, { width: 65, align: "right" });
      doc
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .moveTo(col1, y + 12)
        .lineTo(540, y + 12)
        .stroke();
      return y + 16;
    };

    let y = drawHeader(doc.y);
    doc.font("Helvetica").fontSize(7);

    for (const entry of data.entries) {
      if (y > 730) {
        doc.addPage();
        y = drawHeader(40);
      }

      const dateStr = entry.date
        ? new Date(entry.date).toISOString().slice(0, 10)
        : "";

      doc
        .text(dateStr, col1, y, { width: 45 })
        .text(entry.voucherNumber || "", col2, y, { width: 65 })
        .text(entry.account.accountName || "", col3, y, { width: 100 })
        .text(entry.debit ? entry.debit.toFixed(2) : "", col4, y, {
          width: 65,
          align: "right",
        })
        .text(entry.credit ? entry.credit.toFixed(2) : "", col5, y, {
          width: 65,
          align: "right",
        })
        .text(entry.runningBalance.toFixed(2), col6, y, {
          width: 65,
          align: "right",
        });
      y += 12;
    }
  }

  async _renderCashFlowPdf(doc, params) {
    const data = await this.getCashFlow(params);

    doc.fontSize(10).font("Helvetica-Bold").text("Cash Flow Statement", { align: "center" });
    doc.moveDown(1);

    const col1 = 50;
    const col3 = 460;

    const renderSection = (section, indent = 0) => {
      if (doc.y > 720) doc.addPage();

      doc.fontSize(9).font("Helvetica-Bold").text(section.label, col1 + indent, doc.y);
      doc.moveDown(0.5);

      for (const item of section.items) {
        if (doc.y > 740) doc.addPage();
        doc.fontSize(8);
        if (item.isHeader) {
          doc.font("Helvetica-Bold").text(item.label, col1 + indent + 10, doc.y);
          doc.moveDown(0.3);
        } else {
          doc.font("Helvetica").text(item.label, col1 + indent + 10, doc.y, {
            width: 370,
          });
          doc.text(
            (item.amount >= 0 ? "" : "-") +
              Math.abs(item.amount).toFixed(2),
            col3,
            doc.y - 12,
            { width: 75, align: "right" },
          );
          doc.moveDown(0.3);
        }
      }

      doc.moveDown(0.3);
      doc
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .moveTo(col1, doc.y)
        .lineTo(540, doc.y)
        .stroke();
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(9);
      doc
        .text("Net Cash from this Activity", col1 + indent, doc.y, { width: 350 })
        .text(
          (section.total >= 0 ? "" : "-") + Math.abs(section.total).toFixed(2),
          col3,
          doc.y - 12,
          { width: 75, align: "right" },
        );
      doc.moveDown(1);
    };

    renderSection(data.operatingActivities);
    renderSection(data.investingActivities);
    renderSection(data.financingActivities);

    doc
      .strokeColor("#000")
      .lineWidth(1)
      .moveTo(col1, doc.y)
      .lineTo(540, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica-Bold");
    doc
      .text("Net Cash Flow", col1, doc.y, { width: 350 })
      .text(
        (data.netCashFlow >= 0 ? "" : "-") +
          Math.abs(data.netCashFlow).toFixed(2),
        col3,
        doc.y - 14,
        { width: 75, align: "right" },
      );
  }
}

export default new FinancialReportService();
