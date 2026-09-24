import { type AxiosRequestConfig } from "axios";
import { mockStore } from "./mockStore";
import { mockUser } from "./fixtures";

export function handleMockRequest(config: AxiosRequestConfig): Promise<any> | null {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();
  const baseURL = config.baseURL || "";
  const fullPath = (baseURL.includes("/auth") ? "/api/v1/auth" : "") + (url.startsWith("/") ? url : `/${url}`);

  // Simulates standard backend envelope: { success: true, data: ..., message: ... }
  const wrap = (data: any, message?: string) => {
    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { success: true, data, message },
    });
  };

  const wrapPaged = (items: any[], total = items.length, page = 1, totalPages = 1) => {
    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: {
        success: true,
        data: {
          items,
          total,
          page,
          totalPages,
        },
      },
    });
  };

  // Applies axios query params (search/q/status/pagination/deep-link filters) to a mock list,
  // so search, status filters and pagination behave like the real backend in mock mode.
  const listWithParams = (items: any[]) => {
    const p = (config.params || {}) as Record<string, any>;
    let out = items;
    const q = String(p.search ?? p.q ?? "").toLowerCase();
    if (q) {
      out = out.filter((x) =>
        [x.name, x.invoiceNumber, x.noteNumber, x.entryNumber, x.paymentNumber, x.accountName, x.accountCode, x.title, x.message, x.description, x.categoryName].some(
          (v: any) => typeof v === "string" && v.toLowerCase().includes(q)
        )
      );
    }
    if (p.status && p.status !== "ALL") out = out.filter((x) => x.status === p.status);
    if (p.paymentType) out = out.filter((x) => x.paymentType === p.paymentType);
    if (p.customer) out = out.filter((x) => (typeof x.customer === "object" ? x.customer?._id : x.customer) === p.customer);
    if (p.supplier) out = out.filter((x) => (typeof x.supplier === "object" ? x.supplier?._id : x.supplier) === p.supplier);
    if (p.categoryId) out = out.filter((x) => (typeof x.category === "object" ? x.category?._id : x.category) === p.categoryId);
    if (p.bankAccountId) out = out.filter((x) => (typeof x.bankAccount === "object" ? x.bankAccount?._id : x.bankAccount) === p.bankAccountId);
    const page = Number(p.page || 1);
    const limit = Number(p.limit || 10);
    const total = out.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { items: out.slice((page - 1) * limit, page * limit), total, page, totalPages };
  };
  const wrapPagedFiltered = (items: any[]) => {
    const r = listWithParams(items);
    return wrapPaged(r.items, r.total, r.page, r.totalPages);
  };

  // --- Auth ---
  if (fullPath.includes("/auth/login") && method === "post") {
    return wrap({
      token: "mock-jwt-token-isaii-2026",
      user: mockUser,
    }, "Login successful");
  }

  if (fullPath.includes("/auth/logout") && method === "post") {
    return wrap(null, "Logged out successfully");
  }

  // --- Dashboard ---
  if (url === "/dashboard/cash-flow-series") {
    return wrap(mockStore.cashFlowSeries);
  }
  if (url === "/dashboard/summary") {
    return wrap({
      totalActiveLedgerAccounts: mockStore.accounts.filter((a: any) => !a.isGroup && a.status === "Active").length,
      totalActiveReceivableAccounts: mockStore.customers.filter((c: any) => c.status === "Active").length,
      totalActivePayableAccounts: mockStore.suppliers.filter((s: any) => s.status === "Active").length,
      totalUnpostedJournalEntries: mockStore.journalEntries.filter((j: any) => j.status === "Draft").length,
    });
  }

  if (url.startsWith("/dashboard/recent-activities")) {
    return wrap([
      {
        _id: "act_1",
        action: "Submitted",
        entity: "SalesInvoice",
        entityName: "INV-2026-0001",
        description: "Sales invoice posted to General Ledger",
        performedByName: "Arun Sharma",
        createdAt: "2026-09-01T10:00:00.000Z",
      },
      {
        _id: "act_2",
        action: "Submitted",
        entity: "Payment",
        entityName: "PAY-2026-0001",
        description: "Receipt of ₹2,12,400.00 recorded against INV-2026-0002",
        performedByName: "Arun Sharma",
        createdAt: "2026-09-08T15:00:00.000Z",
      },
      {
        _id: "act_3",
        action: "Created",
        entity: "JournalEntry",
        entityName: "JE-2026-0002",
        description: "Draft contra cash withdrawal voucher",
        performedByName: "Arun Sharma",
        createdAt: "2026-09-15T14:30:00.000Z",
      },
    ]);
  }

  // --- Accounts ---
  if (url === "/accounts/tree") {
    return wrap(mockStore.accounts);
  }
  if (url === "/accounts/next-code") {
    return wrap({ accountCode: "5400" });
  }
  if (url === "/accounts" && method === "get") {
    return wrap(mockStore.accounts);
  }
  if (url.startsWith("/accounts/") && method === "get") {
    const id = url.replace("/accounts/", "");
    const acc = mockStore.accounts.find((a: any) => a._id === id);
    return wrap(acc || mockStore.accounts[0]);
  }
  if (url === "/accounts" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newAcc = { _id: `acc_${Date.now()}`, ...body, status: "Active" };
    mockStore.accounts.push(newAcc);
    return wrap(newAcc, "Account created successfully.");
  }
  if (url.includes("/accounts/") && url.includes("/status") && method === "patch") {
    const id = url.split("/")[2];
    const acc = mockStore.accounts.find((a: any) => a._id === id);
    if (acc) {
      acc.status = acc.status === "Active" ? "Inactive" : "Active";
    }
    return wrap(acc, "Account status updated.");
  }

  // --- Customers ---
  if (url.startsWith("/customers") && method === "get") {
    if (url.match(/\/customers\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const cus = mockStore.customers.find((c: any) => c._id === id);
      return wrap(cus || mockStore.customers[0]);
    }
    return wrapPagedFiltered(mockStore.customers);
  }
  if (url === "/customers" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newCus = { _id: `cus_${Date.now()}`, ...body, status: "Active" };
    mockStore.customers.push(newCus);
    return wrap(newCus, "Customer created successfully.");
  }
  if (url.includes("/customers/") && method === "put") {
    const id = url.split("/")[2];
    const body = JSON.parse(config.data || "{}");
    const idx = mockStore.customers.findIndex((c: any) => c._id === id);
    if (idx !== -1) {
      mockStore.customers[idx] = { ...mockStore.customers[idx], ...body };
      return wrap(mockStore.customers[idx], "Customer updated successfully.");
    }
    // TODO(verify-with-backend): not-found shape. Isolated here per ⚠ VERIFY note.
    return Promise.resolve({
      status: 404,
      statusText: "Not Found",
      headers: {},
      config,
      data: { success: false, error: { message: `Customer ${id} not found.` } },
    });
  }
  if (url.includes("/customers/") && url.includes("/block") && method === "patch") {
    const id = url.split("/")[2];
    const cus = mockStore.customers.find((c: any) => c._id === id);
    if (cus) cus.status = "Blocked";
    return wrap(cus, "Customer blocked.");
  }
  if (url.includes("/customers/") && url.includes("/activate") && method === "patch") {
    const id = url.split("/")[2];
    const cus = mockStore.customers.find((c: any) => c._id === id);
    if (cus) cus.status = "Active";
    return wrap(cus, "Customer activated.");
  }

  // --- Suppliers ---
  if (url.startsWith("/suppliers") && method === "get") {
    if (url.match(/\/suppliers\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const sup = mockStore.suppliers.find((s: any) => s._id === id);
      return wrap(sup || mockStore.suppliers[0]);
    }
    return wrapPagedFiltered(mockStore.suppliers);
  }
  if (url === "/suppliers" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newSup = { _id: `sup_${Date.now()}`, ...body, status: "Active" };
    mockStore.suppliers.push(newSup);
    return wrap(newSup, "Supplier created successfully.");
  }

  // --- Sales Invoices ---
  if (url.startsWith("/sales-invoices") && method === "get") {
    if (url.match(/\/sales-invoices\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const inv = mockStore.salesInvoices.find((i: any) => i._id === id);
      return wrap(inv || mockStore.salesInvoices[0]);
    }
    return wrapPagedFiltered(mockStore.salesInvoices);
  }
  if (url === "/sales-invoices" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newInv = {
      _id: `inv_s_${Date.now()}`,
      invoiceNumber: `INV-2026-000${mockStore.salesInvoices.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      ...body,
    };
    mockStore.salesInvoices.unshift(newInv);
    return wrap(newInv, "Sales invoice created as Draft.");
  }
  if (url.includes("/sales-invoices/") && url.includes("/submit") && method === "patch") {
    const id = url.split("/")[2];
    const inv = mockStore.salesInvoices.find((i: any) => i._id === id);
    if (inv) inv.status = "Submitted";
    return wrap(inv, "Sales invoice submitted successfully.");
  }
  if (url.includes("/sales-invoices/") && url.includes("/cancel") && method === "patch") {
    const id = url.split("/")[2];
    const inv = mockStore.salesInvoices.find((i: any) => i._id === id);
    if (inv) inv.status = "Cancelled";
    return wrap(inv, "Sales invoice cancelled.");
  }

  // --- Purchase Invoices ---
  if (url.startsWith("/purchase-invoices") && method === "get") {
    if (url.match(/\/purchase-invoices\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const inv = mockStore.purchaseInvoices.find((i: any) => i._id === id);
      return wrap(inv || mockStore.purchaseInvoices[0]);
    }
    return wrapPagedFiltered(mockStore.purchaseInvoices);
  }
  if (url === "/purchase-invoices" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newInv = {
      _id: `inv_p_${Date.now()}`,
      invoiceNumber: `BILL-2026-000${mockStore.purchaseInvoices.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      ...body,
    };
    mockStore.purchaseInvoices.unshift(newInv);
    return wrap(newInv, "Purchase invoice created.");
  }
  if (url.includes("/purchase-invoices/") && url.includes("/submit") && method === "patch") {
    const id = url.split("/")[2];
    const inv = mockStore.purchaseInvoices.find((i: any) => i._id === id);
    if (inv) inv.status = "Submitted";
    return wrap(inv, "Purchase invoice submitted.");
  }
  if (url.includes("/purchase-invoices/") && url.includes("/cancel") && method === "patch") {
    const id = url.split("/")[2];
    const inv = mockStore.purchaseInvoices.find((i: any) => i._id === id);
    if (inv) inv.status = "Cancelled";
    return wrap(inv, "Purchase invoice cancelled.");
  }

  // --- Credit & Debit Notes (list only; detail + mutations handled by generic store fallback) ---
  if (url === "/credit-notes" && method === "get") {
    return wrapPagedFiltered(mockStore.creditNotes);
  }
  if (url === "/debit-notes" && method === "get") {
    return wrapPagedFiltered(mockStore.debitNotes);
  }

  // --- Journal Entries ---
  if (url.startsWith("/journal-entries") && method === "get") {
    if (url.match(/\/journal-entries\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const je = mockStore.journalEntries.find((j: any) => j._id === id);
      return wrap(je || mockStore.journalEntries[0]);
    }
    return wrapPagedFiltered(mockStore.journalEntries);
  }
  if (url === "/journal-entries" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newJe = {
      _id: `je_${Date.now()}`,
      entryNumber: `JE-2026-000${mockStore.journalEntries.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      ...body,
    };
    mockStore.journalEntries.unshift(newJe);
    return wrap(newJe, "Journal entry saved as Draft.");
  }
  if (url.includes("/journal-entries/") && url.includes("/submit") && method === "patch") {
    const id = url.split("/")[2];
    const je = mockStore.journalEntries.find((j: any) => j._id === id);
    if (je) je.status = "Submitted";
    return wrap(je, "Journal entry posted to General Ledger.");
  }
  if (url.includes("/journal-entries/") && url.includes("/cancel") && method === "patch") {
    const id = url.split("/")[2];
    const je = mockStore.journalEntries.find((j: any) => j._id === id);
    if (je) je.status = "Cancelled";
    return wrap(je, "Journal entry cancelled.");
  }

  // --- Payments ---
  if (url.startsWith("/payments") && method === "get") {
    if (url.match(/\/payments\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const pay = mockStore.payments.find((p: any) => p._id === id);
      return wrap(pay || mockStore.payments[0]);
    }
    return wrapPagedFiltered(mockStore.payments);
  }
  if (url === "/payments" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newPay = {
      _id: `pay_${Date.now()}`,
      paymentNumber: `PAY-2026-000${mockStore.payments.length + 1}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
      ...body,
    };
    mockStore.payments.unshift(newPay);

    // Update invoice balance
    if (body.invoice) {
      const invId = typeof body.invoice === "object" ? body.invoice._id : body.invoice;
      const targetInvoice =
        mockStore.salesInvoices.find((i: any) => i._id === invId) ||
        mockStore.purchaseInvoices.find((i: any) => i._id === invId);
      if (targetInvoice) {
        targetInvoice.amountPaid = (targetInvoice.amountPaid || 0) + Number(body.amount || 0);
      }
    }

    return wrap(newPay, "Payment submitted successfully.");
  }

  // --- Banking ---
  if (url === "/bank-accounts" && method === "get") {
    return wrap(mockStore.bankAccounts);
  }
  if (url.startsWith("/bank-transactions/unreconciled")) {
    // Endpoint contract: GET /bank-transactions/unreconciled/:bankAccountId (⚠ VERIFY).
    const accountId = url.split("/")[3];
    const filtered = mockStore.bankTransactions.filter(
      (t: any) => t.status === "Unreconciled" && (!accountId || t.bankAccount?._id === accountId || t.bankAccount === accountId)
    );
    return wrap(filtered.length > 0 || accountId ? filtered : mockStore.bankTransactions.filter((t: any) => t.status === "Unreconciled"));
  }
  if (url.startsWith("/bank-transactions/by-account/") && method === "get") {
    const accountId = url.split("/")[3];
    const filtered = mockStore.bankTransactions.filter(
      (t: any) => t.bankAccount?._id === accountId || t.bankAccount === accountId
    );
    return wrapPagedFiltered(filtered);
  }
  if (url.startsWith("/bank-transactions/") && method === "get") {
    const id = url.split("/")[2];
    const tx = mockStore.bankTransactions.find((t: any) => t._id === id);
    return wrap(tx || mockStore.bankTransactions[0]);
  }
  if (url === "/bank-transactions" && method === "get") {
    return wrapPagedFiltered(mockStore.bankTransactions);
  }
  if (url.startsWith("/bank-reconciliation") && method === "get") {
    if (url.match(/\/bank-reconciliation\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const rec = mockStore.bankReconciliations.find((r: any) => r._id === id);
      return wrap(rec || mockStore.bankReconciliations[0]);
    }
    return wrapPagedFiltered(mockStore.bankReconciliations);
  }
  if (url.includes("/bank-reconciliation/") && url.includes("/match") && method === "patch") {
    const id = url.split("/")[2];
    const rec = mockStore.bankReconciliations.find((r: any) => r._id === id);
    if (rec) {
      rec.clearedBalance = rec.closingBalance;
      rec.difference = 0;
    }
    return wrap(rec, "Transactions matched.");
  }
  if (url.includes("/bank-reconciliation/") && url.includes("/complete") && method === "patch") {
    const id = url.split("/")[2];
    const rec = mockStore.bankReconciliations.find((r: any) => r._id === id);
    if (rec) rec.status = "Completed";
    return wrap(rec, "Reconciliation completed.");
  }
  if (url.includes("/bank-reconciliation/") && url.includes("/verify") && method === "patch") {
    const id = url.split("/")[2];
    const rec = mockStore.bankReconciliations.find((r: any) => r._id === id);
    if (rec) rec.status = "Verified";
    return wrap(rec, "Reconciliation verified.");
  }

  // --- Assets & Categories ---
  if (url === "/assets/summary") {
    return wrap({
      totalAssets: mockStore.assets.length,
      totalCost: mockStore.assets.reduce((sum: number, a: any) => sum + (a.purchaseCost || 0), 0),
      totalAccumulatedDepreciation: mockStore.assets.reduce((sum: number, a: any) => sum + (a.accumulatedDepreciation || 0), 0),
      netBookValue: mockStore.assets.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0),
    });
  }
  if (url === "/assets/depreciation/summary") {
    return wrap({
      lastRunDate: "2026-08-31T00:00:00.000Z",
      nextRunDate: "2026-09-30T00:00:00.000Z",
      estimatedMonthlyDepreciation: 53000,
    });
  }
  if (url.startsWith("/assets") && method === "get") {
    if (url.match(/\/assets\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const ast = mockStore.assets.find((a: any) => a._id === id);
      return wrap(ast || mockStore.assets[0]);
    }
    return wrapPagedFiltered(mockStore.assets);
  }
  if (url === "/asset-categories" && method === "get") {
    return wrap(mockStore.assetCategories);
  }

  // --- Budgets ---
  if (url.startsWith("/budgets") && method === "get") {
    if (url.includes("/vs-actual")) {
      const id = url.split("/")[2];
      const bud = mockStore.budgets.find((b: any) => b._id === id) || mockStore.budgets[0];
      return wrap({
        budget: bud,
        actual: bud.actualAmount,
        variance: bud.budgetAmount - bud.actualAmount,
        utilizationPercentage: Math.round((bud.actualAmount / bud.budgetAmount) * 100),
        breakdown: [
          { month: "Apr 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 0.9 },
          { month: "May 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 1.1 },
          { month: "Jun 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 0.95 },
          { month: "Jul 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 1.05 },
          { month: "Aug 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 1.0 },
          { month: "Sep 2026", budget: bud.budgetAmount / 12, actual: (bud.actualAmount / 6) * 1.0 },
        ],
      });
    }
    if (url.match(/\/budgets\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("/")[2];
      const bud = mockStore.budgets.find((b: any) => b._id === id);
      return wrap(bud || mockStore.budgets[0]);
    }
    return wrapPagedFiltered(mockStore.budgets);
  }

  // --- Tax Rates & Groups ---
  if (url === "/tax-rates/active" || (url === "/tax-rates" && method === "get")) {
    return wrap(mockStore.taxRates);
  }
  if (url === "/tax-groups/active" || (url === "/tax-groups" && method === "get")) {
    return wrap(mockStore.taxGroups);
  }
  if (url === "/tax-groups/calculate" && method === "post") {
    const { groupId, subtotal } = JSON.parse(config.data || "{}");
    const group = mockStore.taxGroups.find((g: any) => g._id === groupId) || mockStore.taxGroups[0];
    const taxAmount = (subtotal * (group.totalRate || 0)) / 100;
    return wrap({
      subtotal,
      taxAmount,
      grandTotal: subtotal + taxAmount,
      group,
    });
  }

  // --- Settings: Fiscal Years, Numbering Series, Cost Centers ---
  if (url === "/settings/fiscal-years" && method === "get") {
    return wrap(mockStore.fiscalYears);
  }
  if (url.startsWith("/settings/numbering-series/next/")) {
    const docType = url.split("/").pop();
    const series = mockStore.numberingSeries.find((s: any) => s.documentType === docType);
    const prefix = series?.prefix || "DOC-";
    const padding = series?.padding || 4;
    const num = series?.nextNumber || 1;
    const formatted = `${prefix}${String(num).padStart(padding, "0")}`;
    return wrap({ nextNumber: formatted });
  }
  if (url === "/settings/numbering-series" && method === "get") {
    return wrap(mockStore.numberingSeries);
  }
  if (url === "/cost-centers" && method === "get") {
    return wrap(mockStore.costCenters);
  }

  // --- Notifications ---
  if (url === "/notifications/unread-count") {
    const unread = mockStore.notifications.filter((n: any) => !n.isRead).length;
    return wrap({ count: unread });
  }
  if (url === "/notifications/unread") {
    return wrap(mockStore.notifications.filter((n: any) => !n.isRead));
  }
  if (url === "/notifications" && method === "get") {
    return wrapPagedFiltered(mockStore.notifications);
  }
  if (url.includes("/notifications/") && url.includes("/read") && method === "patch") {
    const id = url.split("/")[2];
    const n = mockStore.notifications.find((item: any) => item._id === id);
    if (n) n.isRead = true;
    return wrap(n);
  }
  if (url === "/notifications/read-all" && method === "patch") {
    mockStore.notifications.forEach((n: any) => (n.isRead = true));
    return wrap(null, "All marked as read");
  }

  // --- System Logs ---
  if (url === "/system-logs") {
    return wrapPagedFiltered(mockStore.systemLogs);
  }

  // --- Reports ---
  if (url.startsWith("/reports/trial-balance")) {
    return wrap({
      totalDebits: 9750000,
      totalCredits: 9750000,
      isBalanced: true,
      difference: 0,
      accounts: mockStore.accounts.map((a: any) => ({
        ...a,
        debit: a.accountType === "ASSET" || a.accountType === "EXPENSE" ? a.balance : 0,
        credit: a.accountType === "LIABILITY" || a.accountType === "EQUITY" || a.accountType === "INCOME" ? a.balance : 0,
      })),
    });
  }

  if (url.startsWith("/reports/profit-loss")) {
    return wrap({
      totalIncome: 4800000,
      totalExpense: 2430000,
      netProfit: 2370000,
      incomeAccounts: mockStore.accounts.filter((a: any) => a.accountType === "INCOME" && !a.isGroup),
      expenseAccounts: mockStore.accounts.filter((a: any) => a.accountType === "EXPENSE" && !a.isGroup),
    });
  }

  if (url.startsWith("/reports/balance-sheet")) {
    return wrap({
      totalAssets: 4950000,
      totalLiabilities: 1180000,
      totalEquity: 3770000,
      assetAccounts: mockStore.accounts.filter((a: any) => a.accountType === "ASSET" && !a.isGroup),
      liabilityAccounts: mockStore.accounts.filter((a: any) => a.accountType === "LIABILITY" && !a.isGroup),
      equityAccounts: mockStore.accounts.filter((a: any) => a.accountType === "EQUITY" && !a.isGroup),
    });
  }

  if (url.startsWith("/reports/general-ledger")) {
    return wrap({
      account: mockStore.accounts[3],
      openingBalance: 450000,
      closingBalance: 580000,
      entries: [
        {
          date: "2026-09-01T00:00:00.000Z",
          voucherType: "Opening",
          voucherNumber: "OP-001",
          description: "Opening Balance",
          debit: 450000,
          credit: 0,
          runningBalance: 450000,
        },
        {
          date: "2026-09-08T15:00:00.000Z",
          voucherType: "Receipt",
          voucherNumber: "PAY-2026-0001",
          description: "Receipt from Infosys BPM (INV-2026-0002)",
          debit: 212400,
          credit: 0,
          runningBalance: 662400,
        },
        {
          date: "2026-09-15T14:30:00.000Z",
          voucherType: "Journal Entry",
          voucherNumber: "JE-2026-0002",
          description: "Cash withdrawal for petty cash",
          debit: 0,
          credit: 25000,
          runningBalance: 637400,
        },
      ],
    });
  }

  if (url.startsWith("/reports/cash-flow")) {
    return wrap({
      operatingActivities: 1850000,
      investingActivities: -350000,
      financingActivities: 0,
      netCashFlow: 1500000,
    });
  }

  if (url.startsWith("/reports/gst/gstr-1") || url.startsWith("/reports/gst/gstr-3b")) {
    return wrap({
      totalTaxableValue: 430000,
      totalTax: 77400,
      invoiceCount: 2,
      rateWise: [
        { rate: 18, taxableValue: 430000, taxAmount: 77400, invoiceCount: 2, taxType: "IGST / CGST+SGST" },
      ],
    });
  }

  if (url.startsWith("/reports/ar-aging") || url.startsWith("/reports/ap-aging")) {
    // Derive aging buckets from the actual open invoice fixtures so the numbers stay
    // internally consistent with the document lists (Submitted & part-unpaid only).
    const isAR = url.includes("ar-aging");
    const src = isAR ? mockStore.salesInvoices : mockStore.purchaseInvoices;
    const open = src.filter((i: any) => i.status === "Submitted" && i.grandTotal - (i.amountPaid || 0) > 0);
    const byParty = new Map<string, { partyName: string; current: number; days30: number; days60: number; days90: number; total: number }>();
    const today = Date.now();
    for (const inv of open) {
      const partyObj = isAR ? inv.customer : inv.supplier;
      const partyName = typeof partyObj === "object" ? partyObj?.name ?? "Unknown" : String(partyObj ?? "Unknown");
      const row = byParty.get(partyName) ?? { partyName, current: 0, days30: 0, days60: 0, days90: 0, total: 0 };
      const outstanding = inv.grandTotal - (inv.amountPaid || 0);
      const due = inv.dueDate ? new Date(inv.dueDate).getTime() : today;
      const overdueDays = Math.floor((today - due) / 86400000);
      if (overdueDays <= 0) row.current += outstanding;
      else if (overdueDays <= 30) row.days30 += outstanding;
      else if (overdueDays <= 60) row.days60 += outstanding;
      else row.days90 += outstanding;
      row.total += outstanding;
      byParty.set(partyName, row);
    }
    return wrap(Array.from(byParty.values()).sort((a, b) => b.total - a.total));
  }

  if (url.startsWith("/reports/export")) {
    // Return empty blob for export
    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: {
        "content-disposition": "attachment; filename=report_export.xlsx",
      },
      config,
      data: new Blob(["mock-export-content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    });
  }

  // --- Generic store-backed fallback ---
  // Covers detail GETs, PUT/PATCH updates, DELETEs and lifecycle transitions for any
  // collection not handled above, so every UI flow is demonstrable in mock mode.
  const COLLECTIONS: Record<string, any[]> = {
    customers: mockStore.customers,
    suppliers: mockStore.suppliers,
    "sales-invoices": mockStore.salesInvoices,
    "purchase-invoices": mockStore.purchaseInvoices,
    "credit-notes": mockStore.creditNotes,
    "debit-notes": mockStore.debitNotes,
    "journal-entries": mockStore.journalEntries,
    payments: mockStore.payments,
    "bank-accounts": mockStore.bankAccounts,
    "bank-transactions": mockStore.bankTransactions,
    "bank-reconciliation": mockStore.bankReconciliations,
    assets: mockStore.assets,
    "asset-categories": mockStore.assetCategories,
    budgets: mockStore.budgets,
    "settings/fiscal-years": mockStore.fiscalYears,
    "settings/numbering-series": mockStore.numberingSeries,
    "cost-centers": mockStore.costCenters,
    "tax-rates": mockStore.taxRates,
    "tax-groups": mockStore.taxGroups,
    notifications: mockStore.notifications,
  };

  const matchCollection = (u: string) =>
    Object.keys(COLLECTIONS).find((key) => u === `/${key}` || u.startsWith(`/${key}/`));

  const collectionKey = matchCollection(url);
  if (collectionKey) {
    const store = COLLECTIONS[collectionKey];
    const rest = url.slice(`/${collectionKey}`.length); // "", "/:id", "/:id/submit" …
    const segs = rest.split("/").filter(Boolean);
    const id = segs[0];
    const action = segs[1];

    // Detail read
    if (method === "get" && id && !action) {
      const item = store.find((x: any) => x._id === id);
      if (item) return wrap(item);
      return Promise.resolve({
        status: 404,
        statusText: "Not Found",
        headers: {},
        config,
        data: { success: false, error: { message: `Record ${id} not found.` } },
      });
    }

    // Create
    if (method === "post" && !id) {
      const body = JSON.parse(config.data || "{}");
      const numField =
        collectionKey.includes("invoice") ? "invoiceNumber" :
        collectionKey.includes("note") ? "noteNumber" :
        collectionKey === "journal-entries" ? "entryNumber" :
        collectionKey === "payments" ? "paymentNumber" : undefined;
      const newId = `${collectionKey.replace(/-/g, "_")}_${Date.now()}`;
      const created: any = {
        _id: newId,
        status: "Draft",
        createdAt: new Date().toISOString(),
        ...body,
      };
      if (numField) {
        created[numField] = `${collectionKey.toUpperCase().replace(/-/g, "")}-${String(store.length + 1).padStart(4, "0")}`;
      }
      if (collectionKey === "payments") created.status = "Submitted";
      store.unshift(created);
      return wrap(created, "Record created successfully.");
    }

    // Lifecycle transitions
    if (method === "patch" && id && action) {
      const item = store.find((x: any) => x._id === id);
      if (!item) {
        return Promise.resolve({
          status: 404,
          statusText: "Not Found",
          headers: {},
          config,
          data: { success: false, error: { message: `Record ${id} not found.` } },
        });
      }
      const statusByAction: Record<string, string> = {
        submit: "Submitted",
        cancel: "Cancelled",
        block: "Blocked",
        activate: "Active",
        "toggle-status": item.status === "Active" ? "Inactive" : "Active",
        approve: "Approved",
        close: "Closed",
        complete: "Completed",
        verify: "Verified",
        depreciate: "Depreciated",
        dispose: "Disposed",
        read: "", // notification read handled below
      };
      if (action === "read") item.isRead = true;
      else if (action === "read-all") store.forEach((x: any) => (x.isRead = true));
      else if (action === "dispose") {
        const body = JSON.parse(config.data || "{}");
        item.status = "Disposed";
        item.disposalDate = body.disposalDate ?? new Date().toISOString().slice(0, 10);
        item.disposalValue = body.disposalValue ?? 0;
      } else if (statusByAction[action]) {
        item.status = statusByAction[action];
      } else if (action === "match") {
        // Reconciliation match: body carries ticked transaction ids (⚠ VERIFY payload shape).
        item.difference = 0;
      }
      return wrap(item, "Action applied successfully.");
    }

    // Update (PUT or PATCH)
    if ((method === "put" || method === "patch") && id && !action) {
      const idx = store.findIndex((x: any) => x._id === id);
      if (idx !== -1) {
        const body = JSON.parse(config.data || "{}");
        store[idx] = { ...store[idx], ...body };
        return wrap(store[idx], "Record updated successfully.");
      }
    }

    // Delete
    if (method === "delete" && id && !action) {
      const idx = store.findIndex((x: any) => x._id === id);
      if (idx !== -1) {
        store.splice(idx, 1);
        return wrap(null, "Record deleted successfully.");
      }
    }
  }

  // Default fallback for any unmatched GET endpoint
  if (method === "get") {
    return wrap([], "Mock empty response");
  }

  return wrap({}, "Mock action executed successfully.");
}
