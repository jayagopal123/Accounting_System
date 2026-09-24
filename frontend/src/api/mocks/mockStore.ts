import {
  mockAccounts,
  mockCustomers,
  mockSuppliers,
  mockSalesInvoices,
  mockPurchaseInvoices,
  mockJournalEntries,
  mockPayments,
  mockBankAccounts,
  mockBankTransactions,
  mockBankReconciliations,
  mockAssetCategories,
  mockAssets,
  mockBudgets,
  mockFiscalYears,
  mockNumberingSeries,
  mockCostCenters,
  mockTaxRates,
  mockTaxGroups,
  mockNotifications,
  mockCashFlowSeries,
} from "./fixtures";

class MockDataStore {
  accounts = JSON.parse(JSON.stringify(mockAccounts));
  customers = JSON.parse(JSON.stringify(mockCustomers));
  suppliers = JSON.parse(JSON.stringify(mockSuppliers));
  salesInvoices = JSON.parse(JSON.stringify(mockSalesInvoices));
  purchaseInvoices = JSON.parse(JSON.stringify(mockPurchaseInvoices));
  creditNotes: any[] = [];
  debitNotes: any[] = [];
  journalEntries = JSON.parse(JSON.stringify(mockJournalEntries));
  payments = JSON.parse(JSON.stringify(mockPayments));
  bankAccounts = JSON.parse(JSON.stringify(mockBankAccounts));
  bankTransactions = JSON.parse(JSON.stringify(mockBankTransactions));
  bankReconciliations = JSON.parse(JSON.stringify(mockBankReconciliations));
  assetCategories = JSON.parse(JSON.stringify(mockAssetCategories));
  assets = JSON.parse(JSON.stringify(mockAssets));
  budgets = JSON.parse(JSON.stringify(mockBudgets));
  fiscalYears = JSON.parse(JSON.stringify(mockFiscalYears));
  numberingSeries = JSON.parse(JSON.stringify(mockNumberingSeries));
  costCenters = JSON.parse(JSON.stringify(mockCostCenters));
  taxRates = JSON.parse(JSON.stringify(mockTaxRates));
  taxGroups = JSON.parse(JSON.stringify(mockTaxGroups));
  notifications = JSON.parse(JSON.stringify(mockNotifications));
  cashFlowSeries = JSON.parse(JSON.stringify(mockCashFlowSeries));

  systemLogs: any[] = [
    {
      _id: "log_01",
      action: "Submitted",
      entity: "SalesInvoice",
      entityName: "INV-2026-0001",
      performedByName: "Arun Sharma",
      description: "Sales invoice INV-2026-0001 submitted to General Ledger",
      createdAt: "2026-09-01T10:01:00.000Z",
    },
    {
      _id: "log_02",
      action: "Created",
      entity: "Payment",
      entityName: "PAY-2026-0001",
      performedByName: "Arun Sharma",
      description: "Receipt of ₹2,12,400.00 posted against INV-2026-0002",
      createdAt: "2026-09-08T15:02:00.000Z",
    },
    {
      _id: "log_03",
      action: "Activated",
      entity: "Asset",
      entityName: "AST-IT-001",
      performedByName: "Arun Sharma",
      description: "Asset capitalized and placed in service",
      createdAt: "2026-01-15T11:00:00.000Z",
    },
  ];

  reset() {
    this.accounts = JSON.parse(JSON.stringify(mockAccounts));
    this.customers = JSON.parse(JSON.stringify(mockCustomers));
    this.suppliers = JSON.parse(JSON.stringify(mockSuppliers));
    this.salesInvoices = JSON.parse(JSON.stringify(mockSalesInvoices));
    this.purchaseInvoices = JSON.parse(JSON.stringify(mockPurchaseInvoices));
    this.creditNotes = [];
    this.debitNotes = [];
    this.journalEntries = JSON.parse(JSON.stringify(mockJournalEntries));
    this.payments = JSON.parse(JSON.stringify(mockPayments));
    this.bankAccounts = JSON.parse(JSON.stringify(mockBankAccounts));
    this.bankTransactions = JSON.parse(JSON.stringify(mockBankTransactions));
    this.bankReconciliations = JSON.parse(JSON.stringify(mockBankReconciliations));
    this.assetCategories = JSON.parse(JSON.stringify(mockAssetCategories));
    this.assets = JSON.parse(JSON.stringify(mockAssets));
    this.budgets = JSON.parse(JSON.stringify(mockBudgets));
    this.fiscalYears = JSON.parse(JSON.stringify(mockFiscalYears));
    this.numberingSeries = JSON.parse(JSON.stringify(mockNumberingSeries));
    this.costCenters = JSON.parse(JSON.stringify(mockCostCenters));
    this.taxRates = JSON.parse(JSON.stringify(mockTaxRates));
    this.taxGroups = JSON.parse(JSON.stringify(mockTaxGroups));
    this.notifications = JSON.parse(JSON.stringify(mockNotifications));
    this.cashFlowSeries = JSON.parse(JSON.stringify(mockCashFlowSeries));
  }
}

export const mockStore = new MockDataStore();
