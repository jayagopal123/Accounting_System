import { type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

export function createInvalidator(queryClient: QueryClient) {
  return {
    onDocumentChange: (docType: "salesInvoice" | "purchaseInvoice" | "creditNote" | "debitNote", id?: string) => {
      if (docType === "salesInvoice") {
        queryClient.invalidateQueries({ queryKey: queryKeys.salesInvoices.all });
        if (id) queryClient.invalidateQueries({ queryKey: queryKeys.salesInvoices.detail(id) });
      } else if (docType === "purchaseInvoice") {
        queryClient.invalidateQueries({ queryKey: queryKeys.purchaseInvoices.all });
        if (id) queryClient.invalidateQueries({ queryKey: queryKeys.purchaseInvoices.detail(id) });
      } else if (docType === "creditNote") {
        queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all });
        if (id) queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.detail(id) });
      } else if (docType === "debitNote") {
        queryClient.invalidateQueries({ queryKey: queryKeys.debitNotes.all });
        if (id) queryClient.invalidateQueries({ queryKey: queryKeys.debitNotes.detail(id) });
      }

      // Ledger & dashboard side-effects
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "activities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },

    onPaymentChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesInvoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseInvoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },

    onJournalEntryChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },

    onCustomerChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
    },

    onSupplierChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(id) });
    },

    onAccountChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.tree });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) });
    },

    onTaxChange: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxRates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.taxGroups.all });
    },

    onBankTransactionChange: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });
    },

    onReconciliationChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankReconciliations.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.bankReconciliations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });
    },

    onAssetChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      if (id) queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.depreciationSummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },

    onBudgetChange: (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets.vsActual(id) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },

    onFiscalYearChange: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalYears.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalYears.active });
    },

    onNumberingSeriesChange: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.numberingSeries.all });
    },
  };
}
