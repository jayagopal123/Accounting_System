import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import AccountListPage from "./pages/accounts/AccountListPage";
import CreateAccountPage from "./pages/accounts/CreateAccountPage";
import EditAccountPage from "./pages/accounts/EditAccountPage";
import CustomerListPage from "./pages/customers/CustomerListPage";
import CreateCustomerPage from "./pages/customers/CreateCustomerPage";
import EditCustomerPage from "./pages/customers/EditCustomerPage";
import SupplierListPage from "./pages/suppliers/SupplierListPage";
import CreateSupplierPage from "./pages/suppliers/CreateSupplierPage";
import EditSupplierPage from "./pages/suppliers/EditSupplierPage";
import JournalEntryListPage from "./pages/journalEntries/JournalEntryListPage";
import CreateJournalEntryPage from "./pages/journalEntries/CreateJournalEntryPage";
import SalesInvoiceListPage from "./pages/salesInvoices/SalesInvoiceListPage";
import CreateSalesInvoicePage from "./pages/salesInvoices/CreateSalesInvoicePage";
import PurchaseInvoiceListPage from "./pages/purchaseInvoices/PurchaseInvoiceListPage";
import CreatePurchaseInvoicePage from "./pages/purchaseInvoices/CreatePurchaseInvoicePage";
import EditPurchaseInvoicePage from "./pages/purchaseInvoices/EditPurchaseInvoicePage";

// ==========================================================================
// PREMIUM AUTHENTICATION PAGES IMPORTS
// ==========================================================================
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// ==========================================================================
// EDIT PAGES IMPORTS
// ==========================================================================
import EditSalesInvoicePage from "./pages/salesInvoices/EditSalesInvoicePage";
import EditJournalEntryPage from "./pages/journalEntries/EditJournalEntryPage";
import SystemLogsPage from "./pages/system-logs/SystemLogsPage";

// ==========================================================================
// FINANCIAL REPORTS IMPORTS
// ==========================================================================
import GeneralLedgerPage from "./pages/reports/GeneralLedgerPage";
import TrialBalancePage from "./pages/reports/TrialBalancePage";
import ProfitLossPage from "./pages/reports/ProfitLossPage";
import BalanceSheetPage from "./pages/reports/BalanceSheetPage";
import CashFlowPage from "./pages/reports/CashFlowPage";

// ==========================================================================
// PAYMENTS IMPORTS
// ==========================================================================
import PaymentListPage from "./pages/payments/PaymentListPage";
import CreatePaymentPage from "./pages/payments/CreatePaymentPage";

// ==========================================================================
// SETTINGS IMPORTS
// ==========================================================================
import FiscalYearListPage from "./pages/settings/FiscalYearListPage";
import CreateFiscalYearPage from "./pages/settings/CreateFiscalYearPage";
import EditFiscalYearPage from "./pages/settings/EditFiscalYearPage";
import NumberingSeriesListPage from "./pages/settings/NumberingSeriesListPage";
import CreateNumberingSeriesPage from "./pages/settings/CreateNumberingSeriesPage";
import EditNumberingSeriesPage from "./pages/settings/EditNumberingSeriesPage";
import CurrencyExchangeRateListPage from "./pages/settings/CurrencyExchangeRateListPage";
import CreateCurrencyExchangeRatePage from "./pages/settings/CreateCurrencyExchangeRatePage";
import EditCurrencyExchangeRatePage from "./pages/settings/EditCurrencyExchangeRatePage";

// ==========================================================================
// BUDGET & COST CENTER IMPORTS
// ==========================================================================
import CostCenterListPage from "./pages/settings/CostCenterListPage";
import CreateCostCenterPage from "./pages/settings/CreateCostCenterPage";
import EditCostCenterPage from "./pages/settings/EditCostCenterPage";
import BudgetListPage from "./pages/budgets/BudgetListPage";
import CreateBudgetPage from "./pages/budgets/CreateBudgetPage";
import EditBudgetPage from "./pages/budgets/EditBudgetPage";
import BudgetVsActualPage from "./pages/budgets/BudgetVsActualPage";

// ==========================================================================
// TAX / GST IMPORTS
// ==========================================================================
import TaxRateListPage from "./pages/tax/TaxRateListPage";
import CreateTaxRatePage from "./pages/tax/CreateTaxRatePage";
import EditTaxRatePage from "./pages/tax/EditTaxRatePage";
import TaxGroupListPage from "./pages/tax/TaxGroupListPage";
import CreateTaxGroupPage from "./pages/tax/CreateTaxGroupPage";
import EditTaxGroupPage from "./pages/tax/EditTaxGroupPage";
import GSTR1Page from "./pages/reports/GSTR1Page";
import GSTR3BPage from "./pages/reports/GSTR3BPage";

// ==========================================================================
// BANKING MODULE IMPORTS
// ==========================================================================
import BankAccountListPage from "./pages/banking/BankAccountListPage";
import CreateBankAccountPage from "./pages/banking/CreateBankAccountPage";
import EditBankAccountPage from "./pages/banking/EditBankAccountPage";
import BankTransactionListPage from "./pages/banking/BankTransactionListPage";
import CreateManualTransactionPage from "./pages/banking/CreateManualTransactionPage";
import BankReconciliationPage from "./pages/banking/BankReconciliationPage";

// ==========================================================================
// ASSET MANAGEMENT IMPORTS
// ==========================================================================
import AssetCategoryListPage from "./pages/assets/AssetCategoryListPage";
import CreateAssetCategoryPage from "./pages/assets/CreateAssetCategoryPage";
import EditAssetCategoryPage from "./pages/assets/EditAssetCategoryPage";
import AssetListPage from "./pages/assets/AssetListPage";
import CreateAssetPage from "./pages/assets/CreateAssetPage";
import EditAssetPage from "./pages/assets/EditAssetPage";
import AssetDetailPage from "./pages/assets/AssetDetailPage";

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes SYSTEM */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Core Ledger Workspace Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><AccountListPage /></ProtectedRoute>} />
        <Route path="/accounts/new" element={<ProtectedRoute><CreateAccountPage /></ProtectedRoute>} />
        <Route path="/accounts/:id/edit" element={<ProtectedRoute><EditAccountPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomerListPage /></ProtectedRoute>} />
        <Route path="/customers/new" element={<ProtectedRoute><CreateCustomerPage /></ProtectedRoute>} />
        <Route path="/customers/:id/edit" element={<ProtectedRoute><EditCustomerPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SupplierListPage /></ProtectedRoute>} />
        <Route path="/suppliers/new" element={<ProtectedRoute><CreateSupplierPage /></ProtectedRoute>} />
        <Route path="/suppliers/:id/edit" element={<ProtectedRoute><EditSupplierPage /></ProtectedRoute>} />
        <Route path="/journal-entries" element={<ProtectedRoute><JournalEntryListPage /></ProtectedRoute>} />
        <Route path="/journal-entries/new" element={<ProtectedRoute><CreateJournalEntryPage /></ProtectedRoute>} />
        <Route path="/sales-invoices" element={<ProtectedRoute><SalesInvoiceListPage /></ProtectedRoute>} />
        <Route path="/sales-invoices/new" element={<ProtectedRoute><CreateSalesInvoicePage /></ProtectedRoute>} />
        <Route path="/purchase-invoices" element={<ProtectedRoute><PurchaseInvoiceListPage /></ProtectedRoute>} />
        <Route path="/purchase-invoices/new" element={<ProtectedRoute><CreatePurchaseInvoicePage /></ProtectedRoute>} />
        <Route path="/purchase-invoices/:id/edit" element={<ProtectedRoute><EditPurchaseInvoicePage /></ProtectedRoute>} />
        <Route path="/sales-invoices/:id/edit" element={<ProtectedRoute><EditSalesInvoicePage /></ProtectedRoute>} />
        <Route path="/journal-entries/:id/edit" element={<ProtectedRoute><EditJournalEntryPage /></ProtectedRoute>} />
        <Route path="/system-logs" element={<ProtectedRoute><SystemLogsPage /></ProtectedRoute>} />
        
        {/* Financial Reports Routes */}
        <Route path="/reports/general-ledger" element={<ProtectedRoute><GeneralLedgerPage /></ProtectedRoute>} />
        <Route path="/reports/trial-balance" element={<ProtectedRoute><TrialBalancePage /></ProtectedRoute>} />
        <Route path="/reports/profit-loss" element={<ProtectedRoute><ProfitLossPage /></ProtectedRoute>} />
        <Route path="/reports/balance-sheet" element={<ProtectedRoute><BalanceSheetPage /></ProtectedRoute>} />
        <Route path="/reports/cash-flow" element={<ProtectedRoute><CashFlowPage /></ProtectedRoute>} />
        
        {/* Payment Routes */}
        <Route path="/payments" element={<ProtectedRoute><PaymentListPage /></ProtectedRoute>} />
        <Route path="/payments/new" element={<ProtectedRoute><CreatePaymentPage /></ProtectedRoute>} />

        {/* Settings Routes */}
        <Route path="/settings/fiscal-years" element={<ProtectedRoute><FiscalYearListPage /></ProtectedRoute>} />
        <Route path="/settings/fiscal-years/new" element={<ProtectedRoute><CreateFiscalYearPage /></ProtectedRoute>} />
        <Route path="/settings/fiscal-years/:id/edit" element={<ProtectedRoute><EditFiscalYearPage /></ProtectedRoute>} />
        <Route path="/settings/numbering-series" element={<ProtectedRoute><NumberingSeriesListPage /></ProtectedRoute>} />
        <Route path="/settings/numbering-series/new" element={<ProtectedRoute><CreateNumberingSeriesPage /></ProtectedRoute>} />
        <Route path="/settings/numbering-series/:id/edit" element={<ProtectedRoute><EditNumberingSeriesPage /></ProtectedRoute>} />
        <Route path="/settings/exchange-rates" element={<ProtectedRoute><CurrencyExchangeRateListPage /></ProtectedRoute>} />
        <Route path="/settings/exchange-rates/new" element={<ProtectedRoute><CreateCurrencyExchangeRatePage /></ProtectedRoute>} />
        <Route path="/settings/exchange-rates/:id/edit" element={<ProtectedRoute><EditCurrencyExchangeRatePage /></ProtectedRoute>} />
        
        {/* Cost Center Routes */}
        <Route path="/settings/cost-centers" element={<ProtectedRoute><CostCenterListPage /></ProtectedRoute>} />
        <Route path="/settings/cost-centers/new" element={<ProtectedRoute><CreateCostCenterPage /></ProtectedRoute>} />
        <Route path="/settings/cost-centers/:id/edit" element={<ProtectedRoute><EditCostCenterPage /></ProtectedRoute>} />
        
        {/* Budget Routes */}
        <Route path="/budgets" element={<ProtectedRoute><BudgetListPage /></ProtectedRoute>} />
        <Route path="/budgets/new" element={<ProtectedRoute><CreateBudgetPage /></ProtectedRoute>} />
        <Route path="/budgets/:id/edit" element={<ProtectedRoute><EditBudgetPage /></ProtectedRoute>} />
        <Route path="/budgets/:id/vs-actual" element={<ProtectedRoute><BudgetVsActualPage /></ProtectedRoute>} />
        
        {/* Tax / GST Routes */}
        <Route path="/tax-rates" element={<ProtectedRoute><TaxRateListPage /></ProtectedRoute>} />
        <Route path="/tax-rates/new" element={<ProtectedRoute><CreateTaxRatePage /></ProtectedRoute>} />
        <Route path="/tax-rates/:id/edit" element={<ProtectedRoute><EditTaxRatePage /></ProtectedRoute>} />
        <Route path="/tax-groups" element={<ProtectedRoute><TaxGroupListPage /></ProtectedRoute>} />
        <Route path="/tax-groups/new" element={<ProtectedRoute><CreateTaxGroupPage /></ProtectedRoute>} />
        <Route path="/tax-groups/:id/edit" element={<ProtectedRoute><EditTaxGroupPage /></ProtectedRoute>} />
        <Route path="/reports/gstr-1" element={<ProtectedRoute><GSTR1Page /></ProtectedRoute>} />
        <Route path="/reports/gstr-3b" element={<ProtectedRoute><GSTR3BPage /></ProtectedRoute>} />
        
        {/* Banking Module Routes */}
        <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountListPage /></ProtectedRoute>} />
        <Route path="/bank-accounts/new" element={<ProtectedRoute><CreateBankAccountPage /></ProtectedRoute>} />
        <Route path="/bank-accounts/:id/edit" element={<ProtectedRoute><EditBankAccountPage /></ProtectedRoute>} />
        <Route path="/bank-transactions" element={<ProtectedRoute><BankTransactionListPage /></ProtectedRoute>} />
        <Route path="/bank-transactions/new" element={<ProtectedRoute><CreateManualTransactionPage /></ProtectedRoute>} />
        <Route path="/bank-reconciliation" element={<ProtectedRoute><BankReconciliationPage /></ProtectedRoute>} />
        
        {/* Asset Management Routes */}
        <Route path="/assets" element={<ProtectedRoute><AssetListPage /></ProtectedRoute>} />
        <Route path="/assets/new" element={<ProtectedRoute><CreateAssetPage /></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />
        <Route path="/assets/:id/edit" element={<ProtectedRoute><EditAssetPage /></ProtectedRoute>} />
        <Route path="/settings/asset-categories" element={<ProtectedRoute><AssetCategoryListPage /></ProtectedRoute>} />
        <Route path="/settings/asset-categories/new" element={<ProtectedRoute><CreateAssetCategoryPage /></ProtectedRoute>} />
        <Route path="/settings/asset-categories/:id/edit" element={<ProtectedRoute><EditAssetCategoryPage /></ProtectedRoute>} />
        
        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;