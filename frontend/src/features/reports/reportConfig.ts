export type ReportKey =
  | "general-ledger" | "trial-balance" | "profit-loss" | "balance-sheet" | "cash-flow"
  | "sales-register" | "purchase-register" | "customer-statement" | "vendor-statement"
  | "ar-aging" | "ap-aging" | "gstr-1" | "gstr-3b";

export interface ReportConfig {
  key: ReportKey;
  title: string;
  description: string;
  /** Filter kinds rendered by ReportFilters */
  needsRange?: boolean;
  needsAsOf?: boolean;
  needsAccount?: boolean;
  needsCustomer?: boolean;
  needsSupplier?: boolean;
  /** Fetcher is wired in ReportPage via reportService */
}

export const REPORTS: Record<ReportKey, ReportConfig> = {
  "general-ledger": { key: "general-ledger", title: "General Ledger", description: "Account-wise entries with running balance.", needsRange: true, needsAccount: true },
  "trial-balance": { key: "trial-balance", title: "Trial Balance", description: "All accounts — debits vs credits with balance check.", needsRange: true },
  "profit-loss": { key: "profit-loss", title: "Profit & Loss", description: "Income vs expenses over a period.", needsRange: true },
  "balance-sheet": { key: "balance-sheet", title: "Balance Sheet", description: "Assets, liabilities and equity position.", needsRange: true },
  "cash-flow": { key: "cash-flow", title: "Cash Flow", description: "Operating, investing and financing movements.", needsRange: true },
  "sales-register": { key: "sales-register", title: "Sales Register", description: "All sales invoices in a period.", needsRange: true, needsCustomer: true },
  "purchase-register": { key: "purchase-register", title: "Purchase Register", description: "All purchase bills in a period.", needsRange: true, needsSupplier: true },
  "customer-statement": { key: "customer-statement", title: "Customer Statement", description: "Party-wise receivable ledger.", needsRange: true, needsCustomer: true },
  "vendor-statement": { key: "vendor-statement", title: "Vendor Statement", description: "Party-wise payable ledger.", needsRange: true, needsSupplier: true },
  "ar-aging": { key: "ar-aging", title: "AR Aging", description: "Receivables bucketed by overdue age.", needsAsOf: true },
  "ap-aging": { key: "ap-aging", title: "AP Aging", description: "Payables bucketed by overdue age.", needsAsOf: true },
  "gstr-1": { key: "gstr-1", title: "GSTR-1", description: "Outward supplies return.", needsRange: true },
  "gstr-3b": { key: "gstr-3b", title: "GSTR-3B", description: "Summary return with tax computation.", needsRange: true },
};

/** Summary chip definitions per report, from the fetched payload. */
export function chipsFor(key: ReportKey, data: any): { label: string; value: number | string; isCurrency?: boolean; variant?: "default" | "success" | "warning" | "destructive" }[] {
  if (!data) return [];
  switch (key) {
    case "trial-balance":
      return [
        { label: "Total Debits", value: data.totalDebits ?? 0, isCurrency: true },
        { label: "Total Credits", value: data.totalCredits ?? 0, isCurrency: true },
        { label: "Difference", value: data.difference ?? 0, isCurrency: true, variant: data.isBalanced ? "success" : "destructive" },
        { label: "Status", value: data.isBalanced ? "✓ Balanced" : "✗ Not balanced", variant: data.isBalanced ? "success" : "destructive" },
      ];
    case "profit-loss":
      return [
        { label: "Total Income", value: data.totalIncome ?? 0, isCurrency: true },
        { label: "Total Expense", value: data.totalExpense ?? 0, isCurrency: true },
        { label: "Net Profit", value: data.netProfit ?? 0, isCurrency: true, variant: (data.netProfit ?? 0) >= 0 ? "success" : "destructive" },
      ];
    case "balance-sheet":
      return [
        { label: "Total Assets", value: data.totalAssets ?? 0, isCurrency: true },
        { label: "Total Liabilities", value: data.totalLiabilities ?? 0, isCurrency: true },
        { label: "Total Equity", value: data.totalEquity ?? 0, isCurrency: true },
      ];
    case "cash-flow":
      return [
        { label: "Operating", value: data.operatingActivities ?? 0, isCurrency: true },
        { label: "Investing", value: data.investingActivities ?? 0, isCurrency: true },
        { label: "Financing", value: data.financingActivities ?? 0, isCurrency: true },
        { label: "Net Cash Flow", value: data.netCashFlow ?? 0, isCurrency: true, variant: (data.netCashFlow ?? 0) >= 0 ? "success" : "destructive" },
      ];
    case "gstr-1":
    case "gstr-3b":
      return [
        { label: "Taxable Value", value: data.totalTaxableValue ?? 0, isCurrency: true },
        { label: "Total Tax", value: data.totalTax ?? 0, isCurrency: true },
        { label: "Invoices", value: data.invoiceCount ?? 0 },
      ];
    case "general-ledger":
      return [
        { label: "Opening Balance", value: data.openingBalance ?? 0, isCurrency: true },
        { label: "Closing Balance", value: data.closingBalance ?? 0, isCurrency: true },
        { label: "Entries", value: (data.entries ?? []).length },
      ];

    default:
      return [];
  }
}
