/**
 * Backend → Frontend shape adapters
 * =================================
 * The Express/Mongo backend returns documents whose field names differ from the
 * frontend's interfaces (customerName vs name, lineItems vs items, nested
 * report objects vs flat totals, …). This module normalizes each payload into
 * the shape the frontend expects, so pages/components need no changes.
 *
 * Every adapter is defensive (optional chaining + ?? fallbacks) so partial
 * data never crashes a page.
 */
import { normalizePaged, type Paged } from "./normalize";
import { type AxiosResponse } from "axios";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** normalizePaged + run adapter over the items in one call. */
function normalizeAs<T>(res: AxiosResponse<any>, map: (item: any) => T): Paged<T> {
  const page = normalizePaged<any>(res);
  return { ...page, items: (page.items ?? []).map(map) };
}

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

/* ------------------------------------------------------------------ */
/* Parties (customers & suppliers)                                     */
/* ------------------------------------------------------------------ */

/** Backend address {addressLine1,...} → frontend {line1,...} */
const mapAddress = (a: any) =>
  a
    ? {
        line1: a.addressLine1 ?? a.line1,
        city: a.city,
        state: a.state,
        country: a.country,
        postalCode: a.postalCode,
      }
    : undefined;

export const adaptCustomer = (c: any) => {
  if (!c) return c;
  const billing = (c.addresses ?? []).find((a: any) => a.addressType === "Billing");
  const contact = (c.contacts ?? [])[0] ?? {};
  return {
    ...c,
    name: c.customerName ?? c.name,
    companyName: c.company ?? c.companyName,
    gstin: c.gstNumber ?? c.gstin,
    pan: c.panNumber ?? c.pan,
    contactPerson: c.contactPerson ?? contact.contactPerson,
    phone: c.phone ?? contact.phone,
    mobile: c.mobile ?? contact.mobile,
    email: c.email ?? contact.email,
    billingAddress: mapAddress(billing),
  };
};

export const adaptSupplier = (s: any) => {
  if (!s) return s;
  const billing = (s.addresses ?? []).find((a: any) => a.addressType === "Billing");
  const contact = (s.contacts ?? [])[0] ?? {};
  return {
    ...s,
    name: s.supplierName ?? s.name,
    gstin: s.gstNumber ?? s.gstin,
    pan: s.panNumber ?? s.pan,
    contactPerson: s.contactPerson ?? contact.contactPerson,
    phone: s.phone ?? contact.phone,
    mobile: s.mobile ?? contact.mobile,
    email: s.email ?? contact.email,
    billingAddress: mapAddress(billing),
  };
};

/** Frontend party payload → backend schema (customerName/gstNumber/addresses/contacts). */
export function partyToBackend(p: any, kind: "customer" | "supplier") {
  const nameKey = kind === "customer" ? "customerName" : "supplierName";
  const out: any = { ...p };
  if (p.name !== undefined) {
    out[nameKey] = p.name;
    delete out.name;
  }
  if (p.gstin !== undefined) {
    out.gstNumber = p.gstin;
    delete out.gstin;
  }
  if (p.pan !== undefined) {
    out.panNumber = p.pan;
    delete out.pan;
  }

  // billingAddress → addresses[Billing]
  if (p.billingAddress) {
    out.addresses = [
      {
        addressType: "Billing",
        addressLine1: p.billingAddress.line1,
        city: p.billingAddress.city,
        state: p.billingAddress.state,
        country: p.billingAddress.country,
        postalCode: p.billingAddress.postalCode,
      },
    ];
    delete out.billingAddress;
  }

  // flat contact fields → contacts[]
  if (p.email || p.phone || p.mobile || p.contactPerson) {
    out.contacts = [
      {
        contactPerson: p.contactPerson,
        phone: p.phone,
        mobile: p.mobile,
        email: p.email,
      },
    ];
    delete out.contactPerson;
  }
  return out;
}

export const adaptCustomerList = (res: AxiosResponse<any>) =>
  normalizeAs(res, adaptCustomer);
export const adaptSupplierList = (res: AxiosResponse<any>) =>
  normalizeAs(res, adaptSupplier);

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export const adaptAccount = (a: any) =>
  a
    ? {
        ...a,
        status: a.status === "ACTIVE" ? "Active" : a.status === "INACTIVE" ? "Inactive" : a.status,
        balance: a.balance ?? a.amount ?? 0,
      }
    : a;

export const adaptAccountTree = (nodes: any): any[] =>
  asArray(nodes).map((n) => ({ ...adaptAccount(n), children: adaptAccountTree(n.children) }));

/** Frontend status ("Active"/"Inactive") → backend enum. */
export const accountStatusToBackend = (s: string) =>
  s === "Active" ? "ACTIVE" : s === "Inactive" ? "INACTIVE" : s;

/* ------------------------------------------------------------------ */
/* Documents (sales/purchase invoices, credit/debit notes)             */
/* ------------------------------------------------------------------ */

export const adaptDocument = (d: any) => {
  if (!d) return d;
  const party = d.customer ?? d.supplier;
  const mappedParty =
    party && typeof party === "object"
      ? { ...party, name: party.customerName ?? party.supplierName ?? party.name }
      : party;

  return {
    ...d,
    invoiceNumber: d.invoiceNumber ?? d.creditNoteNumber ?? d.debitNoteNumber,
    noteNumber: d.noteNumber ?? d.creditNoteNumber ?? d.debitNoteNumber,
    noteDate: d.noteDate ?? d.creditNoteDate ?? d.debitNoteDate,
    originalInvoice: d.originalInvoice ?? d.invoice,
    customer: d.customer !== undefined ? (typeof d.customer === "object" ? adaptCustomer(d.customer) : d.customer) : undefined,
    supplier: d.supplier !== undefined ? (typeof d.supplier === "object" ? adaptSupplier(d.supplier) : d.supplier) : undefined,
    party: mappedParty,
    amountPaid: d.amountPaid ?? d.totalPaid ?? 0,
    remarks: d.remarks ?? d.reason,
  };
};

export const adaptDocumentList = (res: AxiosResponse<any>) =>
  normalizeAs(res, adaptDocument);

/** Frontend document payload → backend (creditNoteNumber→generated, reason→remarks handled server-side). */
export function documentToBackend(d: any, kind: string) {
  const out: any = { ...d };
  if (kind === "credit-notes" && d.remarks !== undefined) {
    out.reason = d.remarks;
    delete out.remarks;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Journal entries                                                     */
/* ------------------------------------------------------------------ */

export const adaptJournalEntry = (j: any) =>
  j
    ? {
        ...j,
        entryNumber: j.entryNumber ?? j.voucherNumber,
        entryDate: j.entryDate ?? j.date,
        items: (j.items ?? j.lineItems ?? []).map((li: any) => ({
          ...li,
          debit: li.debit ?? li.debitAmount ?? 0,
          credit: li.credit ?? li.creditAmount ?? 0,
        })),
        remarks: j.remarks ?? j.description,
      }
    : j;

export const adaptJournalEntryList = (res: AxiosResponse<any>) =>
  normalizeAs(res, adaptJournalEntry);

export function journalEntryToBackend(j: any) {
  const out: any = { ...j };
  out.date = j.entryDate ?? j.date;
  if (j.items) {
    out.lineItems = j.items.map((li: any) => ({
      account: li.account,
      debitAmount: li.debit ?? li.debitAmount ?? 0,
      creditAmount: li.credit ?? li.creditAmount ?? 0,
      description: li.description,
    }));
    delete out.items;
  }
  delete out.entryNumber;
  delete out.entryDate;
  return out;
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export const adaptPayment = (p: any) => (p ? { ...p, invoice: adaptDocument(p.invoice) } : p);
export const adaptPaymentList = (res: AxiosResponse<any>) => normalizeAs(res, adaptPayment);

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const adaptTrialBalance = (data: any) => {
  const rows = asArray(data?.rows);
  const accounts = rows.map((r: any) => ({
    _id: r._id,
    accountCode: r.accountCode,
    accountName: r.accountName,
    accountType: r.accountType,
    isGroup: r.isGroup,
    balance: r.balance ?? 0,
    debit: r.totalDebit ?? 0,
    credit: r.totalCredit ?? 0,
  }));
  return {
    accounts,
    totalDebits: data?.totals?.totalDebit ?? 0,
    totalCredits: data?.totals?.totalCredit ?? 0,
    isBalanced: data?.totals?.isBalanced ?? false,
    difference: (data?.totals?.totalDebit ?? 0) - (data?.totals?.totalCredit ?? 0),
  };
};

export const adaptProfitLoss = (data: any) => ({
  totalIncome: data?.income?.total ?? 0,
  totalExpense: data?.expenses?.total ?? 0,
  netProfit: data?.netProfit ?? 0,
  incomeAccounts: asArray(data?.income?.accounts).map((a: any) => ({ ...a, _id: a._id ?? a.accountCode })),
  expenseAccounts: asArray(data?.expenses?.accounts).map((a: any) => ({ ...a, _id: a._id ?? a.accountCode })),
});

export const adaptBalanceSheet = (data: any) => ({
  totalAssets: data?.totals?.totalAssets ?? 0,
  totalLiabilities: data?.totals?.totalLiabilities ?? 0,
  totalEquity: data?.totals?.totalEquity ?? 0,
  isBalanced: data?.totals?.isBalanced,
  assetAccounts: asArray(data?.assets?.accounts).map((a: any) => ({ ...a, _id: a._id ?? a.accountCode })),
  liabilityAccounts: asArray(data?.liabilities?.accounts).map((a: any) => ({ ...a, _id: a._id ?? a.accountCode })),
  equityAccounts: asArray(data?.equity?.accounts).map((a: any) => ({ ...a, _id: a._id ?? a.accountCode })),
});

export const adaptCashFlow = (data: any) => ({
  operatingActivities: data?.operatingActivities?.total ?? 0,
  investingActivities: data?.investingActivities?.total ?? 0,
  financingActivities: data?.financingActivities?.total ?? 0,
  netCashFlow: data?.netCashFlow ?? 0,
});

export const adaptGeneralLedger = (data: any) => {
  const entries = asArray(data?.entries).map((e: any) => ({
    ...e,
    voucherType: e.voucherType ?? e.referenceType,
  }));
  return {
    entries,
    totalDebits: data?.summary?.totalDebits ?? 0,
    totalCredits: data?.summary?.totalCredits ?? 0,
    closingBalance: entries.length ? entries[entries.length - 1].runningBalance : 0,
    account: entries[0]?.account,
  };
};

export const adaptAging = (data: any) => {
  const buckets = data?.buckets ?? {};
  const byParty = new Map<string, any>();
  const bucketKeys: Array<[string, string]> = [
    ["0-30", "current"],
    ["31-60", "days30"],
    ["61-90", "days60"],
    ["91-plus", "days90"],
  ];
  for (const [key, field] of bucketKeys) {
    for (const inv of asArray(buckets[key]?.invoices)) {
      const partyName = inv.customerName ?? inv.supplierName ?? "Unknown";
      const row = byParty.get(partyName) ?? { partyName, current: 0, days30: 0, days60: 0, days90: 0, total: 0 };
      row[field] += inv.outstanding ?? 0;
      row.total += inv.outstanding ?? 0;
      byParty.set(partyName, row);
    }
  }
  return Array.from(byParty.values()).sort((a, b) => b.total - a.total);
};

export const adaptGstr = (data: any) => ({
  rateWise: asArray(data?.summary).map((s: any) => ({
    taxType: s.taxName ?? s.taxType,
    rate: s.rate,
    taxableValue: s.taxableValue,
    taxAmount: s.taxAmount,
    invoiceCount: s.invoiceCount,
  })),
  totalTaxableValue: data?.totals?.totalTaxableValue ?? 0,
  totalTax: data?.totals?.totalTaxAmount ?? 0,
  invoiceCount: data?.totals?.totalInvoices ?? 0,
});

export const adaptRegister = (data: any) => {
  const invoices = asArray(data?.invoices ?? data);
  return invoices.map((inv: any) => {
    const party = inv.customer ?? inv.supplier;
    return {
      ...inv,
      partyName:
        inv.partyName ??
        (typeof party === "object" ? party?.customerName ?? party?.supplierName ?? party?.name : undefined) ??
        "",
    };
  });
};

export const adaptStatement = (data: any) =>
  asArray(data?.transactions).map((t: any) => ({
    invoiceNumber: t.reference,
    partyName: t.partyName ?? t.customerName ?? t.supplierName ?? t.name ?? "",
    invoiceDate: t.date,
    subtotal: t.type === "Invoice" ? t.debit ?? 0 : 0,
    taxAmount: 0,
    grandTotal: t.type === "Invoice" ? t.debit ?? 0 : -(t.credit ?? 0),
  }));

/* ------------------------------------------------------------------ */
/* GST return detail (GstBody table rows)                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Budgets                                                             */
/* ------------------------------------------------------------------ */

export const adaptBudget = (b: any) =>
  b
    ? {
        ...b,
        fiscalYear: typeof b.fiscalYear === "object" ? b.fiscalYear?.yearName ?? b.fiscalYear?.name : b.fiscalYear,
        budgetAmount: b.budgetAmount ?? b.totalAmount ?? 0,
        account: b.account ?? b.lineItems?.[0]?.account,
        remarks: b.remarks ?? b.description,
      }
    : b;

export const adaptBudgetList = (res: AxiosResponse<any>) => normalizeAs(res, adaptBudget);

export const adaptBudgetVsActual = (data: any) => {
  const lines = asArray(data?.lines);
  const totalBudget = data?.totals?.budgeted ?? 0;
  const actual = data?.totals?.actual ?? 0;
  const variance = data?.totals?.variance ?? totalBudget - actual;
  return {
    budget: adaptBudget(data?.budget),
    actual,
    variance,
    utilizationPercentage: totalBudget > 0 ? (actual / totalBudget) * 100 : 0,
    breakdown: lines.map((l: any) => ({
      month: l.account?.accountName ?? "Line item",
      budget: l.budgetedAmount ?? 0,
      actual: l.actualAmount ?? 0,
    })),
    lines,
  };
};

/** Frontend budget payload → backend (name/lineItems/totalAmount). */
export function budgetToBackend(b: any) {
  const out: any = { ...b };
  if (b.budgetAmount !== undefined) {
    out.totalAmount = b.budgetAmount;
    delete out.budgetAmount;
  }
  if (b.account && !b.lineItems) {
    out.lineItems = [{ account: b.account, amount: b.budgetAmount ?? b.totalAmount ?? 0 }];
    delete out.account;
  }
  if (b.remarks !== undefined) {
    out.description = b.remarks;
    delete out.remarks;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const adaptFiscalYear = (f: any) =>
  f
    ? {
        ...f,
        name: f.name ?? f.yearName,
        isClosed: f.isClosed ?? f.status === "Closed",
      }
    : f;

export function fiscalYearToBackend(f: any) {
  const out: any = { ...f };
  if (f.name !== undefined) out.yearName = f.name;
  delete out.name;
  if (f.isClosed !== undefined) out.status = f.isClosed ? "Closed" : "Active";
  delete out.isClosed;
  return out;
}

export const adaptNumberingSeries = (s: any) =>
  s
    ? {
        ...s,
        padding: s.padding ?? s.padLength ?? 5,
        nextNumber: s.nextNumber ?? (s.currentNumber ?? 0) + 1,
        suffix: s.suffix ?? "",
      }
    : s;

export function numberingSeriesToBackend(s: any) {
  const out: any = { ...s };
  if (s.padding !== undefined) out.padLength = s.padding;
  delete out.padding;
  delete out.nextNumber;
  delete out.suffix;
  return out;
}

export const adaptCostCenter = (c: any) =>
  c ? { ...c, isActive: c.isActive ?? c.status === "Active" } : c;

export function costCenterToBackend(c: any) {
  const out: any = { ...c };
  if (c.isActive !== undefined) out.status = c.isActive ? "Active" : "Inactive";
  delete out.isActive;
  return out;
}

/* ------------------------------------------------------------------ */
/* Taxes                                                               */
/* ------------------------------------------------------------------ */

export const adaptTaxRate = (t: any) =>
  t ? { ...t, name: t.name ?? t.taxName, code: t.code ?? t.taxCode } : t;

export function taxRateToBackend(t: any) {
  const out: any = { ...t };
  if (t.name !== undefined) out.taxName = t.name;
  if (t.code !== undefined) out.taxCode = t.code;
  delete out.name;
  delete out.code;
  return out;
}

export const adaptTaxGroup = (g: any) => {
  if (!g) return g;
  const taxes = asArray(g.taxes).map((line: any) => {
    const rate = line.taxRate;
    const rateNum = typeof rate === "object" ? rate?.rate ?? line.rate : line.rate ?? 0;
    return { ...line, rate: rateNum };
  });
  return {
    ...g,
    name: g.name ?? g.groupName,
    code: g.code ?? g.groupCode,
    taxes,
    totalRate: g.totalRate ?? taxes.reduce((s: number, t: any) => s + (t.rate || 0), 0),
  };
};

export function taxGroupToBackend(g: any) {
  const out: any = { ...g };
  if (g.name !== undefined) out.groupName = g.name;
  if (g.code !== undefined) out.groupCode = g.code;
  delete out.name;
  delete out.code;
  delete out.totalRate;
  return out;
}

/** Backend calculate returns {taxBreakdown,totalTax}; frontend wants totals. */
export const adaptTaxCalculation = (subtotal: number) => (data: any) => ({
  subtotal,
  taxAmount: data?.totalTax ?? 0,
  grandTotal: subtotal + (data?.totalTax ?? 0),
  taxBreakdown: data?.taxBreakdown,
});

/* ------------------------------------------------------------------ */
/* Banking                                                             */
/* ------------------------------------------------------------------ */

export const adaptBankAccount = (b: any) =>
  b ? { ...b, branch: b.branch ?? b.branchName, ifscCode: b.ifscCode ?? b.ifsc } : b;

export function bankAccountToBackend(b: any) {
  const out: any = { ...b };
  if (b.branch !== undefined) out.branchName = b.branch;
  delete out.branch;
  return out;
}

export const adaptBankTransaction = (t: any) =>
  t
    ? {
        ...t,
        type: t.type ?? t.transactionType,
        status: t.status ?? t.reconciliationStatus,
      }
    : t;

export function bankTransactionToBackend(t: any) {
  const out: any = { ...t };
  if (t.type !== undefined) out.transactionType = t.type;
  delete out.type;
  return out;
}

export const adaptBankReconciliation = (r: any) =>
  r
    ? {
        ...r,
        clearedBalance: r.clearedBalance ?? r.systemBalance ?? 0,
        reconciledTransactions: r.reconciledTransactions ?? r.matchedTransactions ?? [],
      }
    : r;

export function bankReconciliationToBackend(r: any) {
  const out: any = { ...r };
  if (r.reconciledTransactions !== undefined) out.matchedTransactions = r.reconciledTransactions;
  delete out.reconciledTransactions;
  return out;
}

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

export const adaptAssetCategory = (c: any) =>
  c
    ? {
        ...c,
        categoryName: c.categoryName ?? c.name,
        depreciationMethod: c.depreciationMethod ?? c.defaultDepreciationMethod ?? "StraightLine",
        usefulLifeMonths: c.usefulLifeMonths ?? c.defaultUsefulLife ?? 60,
      }
    : c;

export function assetCategoryToBackend(c: any) {
  const out: any = { ...c };
  if (c.depreciationMethod !== undefined) out.defaultDepreciationMethod = c.depreciationMethod;
  if (c.usefulLifeMonths !== undefined) out.defaultUsefulLife = c.usefulLifeMonths;
  delete out.depreciationMethod;
  delete out.usefulLifeMonths;
  return out;
}

export const adaptAssetSummary = (data: any) => ({
  totalAssets: data?.count ?? data?.totalAssets ?? 0,
  totalCost: data?.totalCost ?? 0,
  totalAccumulatedDepreciation: data?.totalAccumulatedDepreciation ?? data?.totalDepreciation ?? 0,
  netBookValue: data?.netBookValue ?? data?.totalCurrentValue ?? 0,
});

/** Backend returns per-category aggregates; frontend expects run-date summary. */
export const adaptDepreciationSummary = (data: any) => {
  const rows = asArray(data);
  const totalCost = rows.reduce((s, r) => s + (r.totalCost ?? 0), 0);
  const totalDep = rows.reduce((s, r) => s + (r.totalDepreciation ?? 0), 0);
  return {
    lastRunDate: null,
    nextRunDate: null,
    estimatedMonthlyDepreciation: Math.max(totalCost - totalDep, 0) / 60, // rough glide-path estimate
    _rows: rows,
  };
};

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

/** Backend /unread-count returns { unreadCount }; older mock returned { count }. */
export const adaptUnreadCount = (data: any) => data?.unreadCount ?? data?.count ?? 0;
