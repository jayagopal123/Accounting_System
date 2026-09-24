// Route configuration module — defines the router, lazy page registry and metadata.
// It is not a component file, so the fast-refresh "only export components" rule does not apply here.
// oxlint-disable react/only-export-components
import React, { Suspense } from "react";
import { createBrowserRouter, Navigate, useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AuthGuard, GuestOnly, RouteFallback } from "./guards";
import { AppShell } from "./layouts/AppShell";
import { AuthLayout } from "./layouts/AuthLayout";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

// ---- Lazy page imports (route-level code splitting) ----
const LoginPage = React.lazy(() => import("@/features/auth/pages/LoginPage"));
const ForgotPasswordPage = React.lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("@/features/auth/pages/ResetPasswordPage"));

const DashboardPage = React.lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const NotificationsPage = React.lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const SystemLogsPage = React.lazy(() => import("@/features/system-logs/pages/SystemLogsPage"));

const AccountsPage = React.lazy(() => import("@/features/accounts/pages/AccountsPage"));
const AccountFormPage = React.lazy(() => import("@/features/accounts/pages/AccountFormPage"));

const CustomersPage = React.lazy(() => import("@/features/customers/pages/CustomersPage"));
const CustomerFormPage = React.lazy(() => import("@/features/customers/pages/CustomerFormPage"));
const CustomerDetailPage = React.lazy(() => import("@/features/customers/pages/CustomerDetailPage"));
const SuppliersPage = React.lazy(() => import("@/features/suppliers/pages/SuppliersPage"));
const SupplierFormPage = React.lazy(() => import("@/features/suppliers/pages/SupplierFormPage"));
const SupplierDetailPage = React.lazy(() => import("@/features/suppliers/pages/SupplierDetailPage"));

const TaxRatesPage = React.lazy(() => import("@/features/tax/pages/TaxRatesPage"));
const TaxRateFormPage = React.lazy(() => import("@/features/tax/pages/TaxRateFormPage"));
const TaxGroupsPage = React.lazy(() => import("@/features/tax/pages/TaxGroupsPage"));
const TaxGroupFormPage = React.lazy(() => import("@/features/tax/pages/TaxGroupFormPage"));

const DocumentListPage = React.lazy(() => import("@/components/document/DocumentListPage"));
const DocumentFormPage = React.lazy(() => import("@/components/document/DocumentFormPage"));
const DocumentDetailPage = React.lazy(() => import("@/components/document/DocumentDetailPage"));

const JournalEntriesPage = React.lazy(() => import("@/features/journal-entries/pages/JournalEntriesPage"));
const JournalEntryFormPage = React.lazy(() => import("@/features/journal-entries/pages/JournalEntryFormPage"));
const JournalEntryDetailPage = React.lazy(() => import("@/features/journal-entries/pages/JournalEntryDetailPage"));

const PaymentsPage = React.lazy(() => import("@/features/payments/pages/PaymentsPage"));
const PaymentFormPage = React.lazy(() => import("@/features/payments/pages/PaymentFormPage"));
const PaymentDetailPage = React.lazy(() => import("@/features/payments/pages/PaymentDetailPage"));

const BankAccountsPage = React.lazy(() => import("@/features/banking/pages/BankAccountsPage"));
const BankAccountFormPage = React.lazy(() => import("@/features/banking/pages/BankAccountFormPage"));
const BankTransactionsPage = React.lazy(() => import("@/features/banking/pages/BankTransactionsPage"));
const BankTransactionFormPage = React.lazy(() => import("@/features/banking/pages/BankTransactionFormPage"));
const BankReconciliationPage = React.lazy(() => import("@/features/banking/pages/BankReconciliationPage"));
const ReconciliationWorkspacePage = React.lazy(() => import("@/features/banking/pages/ReconciliationWorkspacePage"));

const AssetsPage = React.lazy(() => import("@/features/assets/pages/AssetsPage"));
const AssetFormPage = React.lazy(() => import("@/features/assets/pages/AssetFormPage"));
const AssetDetailPage = React.lazy(() => import("@/features/assets/pages/AssetDetailPage"));

const BudgetsPage = React.lazy(() => import("@/features/budgets/pages/BudgetsPage"));
const BudgetFormPage = React.lazy(() => import("@/features/budgets/pages/BudgetFormPage"));
const BudgetVsActualPage = React.lazy(() => import("@/features/budgets/pages/BudgetVsActualPage"));

const FiscalYearsPage = React.lazy(() => import("@/features/settings/pages/FiscalYearsPage"));
const FiscalYearFormPage = React.lazy(() => import("@/features/settings/pages/FiscalYearFormPage"));
const NumberingSeriesPage = React.lazy(() => import("@/features/settings/pages/NumberingSeriesPage"));
const NumberingSeriesFormPage = React.lazy(() => import("@/features/settings/pages/NumberingSeriesFormPage"));
const CostCentersPage = React.lazy(() => import("@/features/settings/pages/CostCentersPage"));
const CostCenterFormPage = React.lazy(() => import("@/features/settings/pages/CostCenterFormPage"));
const AssetCategoriesPage = React.lazy(() => import("@/features/settings/pages/AssetCategoriesPage"));
const AssetCategoryFormPage = React.lazy(() => import("@/features/settings/pages/AssetCategoryFormPage"));

const ReportPage = React.lazy(() => import("@/features/reports/pages/ReportPage"));

// ---- Helpers ----
const auth = (node: React.ReactNode) => <GuestOnly>{node}</GuestOnly>;

const el = (C: React.LazyExoticComponent<React.ComponentType<any>>, props?: Record<string, unknown>) => (
  <Suspense fallback={<RouteFallback />}>
    <C {...props} />
  </Suspense>
);

/** Route metadata for breadcrumbs, nav filtering and titles. */
export const routeMeta: Record<string, { title: string; group: string }> = {
  "/": { title: "Dashboard", group: "Overview" },
  "/notifications": { title: "Notifications", group: "Overview" },
  "/system-logs": { title: "System Logs", group: "System" },
  "/accounts": { title: "Chart of Accounts", group: "Accounting" },
  "/accounts/new": { title: "New Account", group: "Accounting" },
  "/journal-entries": { title: "Journal Entries", group: "Accounting" },
  "/journal-entries/new": { title: "New Journal Entry", group: "Accounting" },
  "/customers": { title: "Customers", group: "Sales" },
  "/customers/new": { title: "New Customer", group: "Sales" },
  "/suppliers": { title: "Suppliers", group: "Purchases" },
  "/suppliers/new": { title: "New Supplier", group: "Purchases" },
  "/sales-invoices": { title: "Sales Invoices", group: "Sales" },
  "/credit-notes": { title: "Credit Notes", group: "Sales" },
  "/purchase-invoices": { title: "Purchase Invoices", group: "Purchases" },
  "/debit-notes": { title: "Debit Notes", group: "Purchases" },
  "/payments": { title: "Payments & Receipts", group: "Banking" },
  "/payments/new": { title: "Record Payment", group: "Banking" },
  "/bank-accounts": { title: "Bank Accounts", group: "Banking" },
  "/bank-transactions": { title: "Bank Transactions", group: "Banking" },
  "/bank-reconciliation": { title: "Reconciliation", group: "Banking" },
  "/assets": { title: "Fixed Assets", group: "Assets & Budgets" },
  "/budgets": { title: "Budgets", group: "Assets & Budgets" },
  "/tax-rates": { title: "Tax Rates", group: "Tax" },
  "/tax-groups": { title: "Tax Groups", group: "Tax" },
  "/settings/fiscal-years": { title: "Fiscal Years", group: "Settings" },
  "/settings/numbering-series": { title: "Numbering Series", group: "Settings" },
  "/settings/cost-centers": { title: "Cost Centers", group: "Settings" },
  "/settings/asset-categories": { title: "Asset Categories", group: "Settings" },
  "/reports": { title: "Reports", group: "Reports" },
};

// ---- Error boundaries ----
export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
    <motion.div
      animate={{ rotate: [0, 12, -12, 0], y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center"
    >
      <Compass className="h-9 w-9 text-white" />
    </motion.div>
    <h1 className="text-3xl font-bold font-display">404 — Page not found</h1>
    <p className="text-sm text-muted-foreground max-w-sm text-center">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link to="/" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
      Back to Dashboard
    </Link>
  </div>
);

const NoAccessPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
    <h1 className="text-2xl font-bold font-display">No access</h1>
    <p className="text-sm text-muted-foreground">
      Your role does not have permission to view this module.
    </p>
    <Link to="/" className="text-primary hover:underline text-sm font-medium">
      Back to Dashboard
    </Link>
  </div>
);

function RootErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
      <h1 className="text-2xl font-bold font-display">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        An unexpected error occurred. {(error as Error)?.message}
      </p>
      <Link to="/" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
        Back to Dashboard
      </Link>
    </div>
  );
}

// ---- Router ----
export const router = createBrowserRouter([
  // Public auth routes
  {
    element: auth(
      <AuthLayout />
    ),
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "/login", element: el(LoginPage) },
      { path: "/forgot-password", element: el(ForgotPasswordPage) },
      { path: "/reset-password", element: el(ResetPasswordPage) },
    ],
  },
  // Authenticated app routes
  {
    element: <AuthGuard><AppShell /></AuthGuard>,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "/", element: el(DashboardPage) },
      { path: "/notifications", element: el(NotificationsPage) },
      { path: "/system-logs", element: el(SystemLogsPage) },
      { path: "/no-access", element: <NoAccessPage /> },

      { path: "/accounts", element: el(AccountsPage) },
      { path: "/accounts/new", element: el(AccountFormPage) },
      { path: "/accounts/:id/edit", element: el(AccountFormPage) },

      { path: "/customers", element: el(CustomersPage) },
      { path: "/customers/new", element: el(CustomerFormPage) },
      { path: "/customers/:id", element: el(CustomerDetailPage) },
      { path: "/customers/:id/edit", element: el(CustomerFormPage) },

      { path: "/suppliers", element: el(SuppliersPage) },
      { path: "/suppliers/new", element: el(SupplierFormPage) },
      { path: "/suppliers/:id", element: el(SupplierDetailPage) },
      { path: "/suppliers/:id/edit", element: el(SupplierFormPage) },

      { path: "/sales-invoices", element: el(DocumentListPage, { docTypeKey: "sales-invoices" }) },
      { path: "/sales-invoices/new", element: el(DocumentFormPage, { docTypeKey: "sales-invoices" }) },
      { path: "/sales-invoices/:id", element: el(DocumentDetailPage, { docTypeKey: "sales-invoices" }) },
      { path: "/sales-invoices/:id/edit", element: el(DocumentFormPage, { docTypeKey: "sales-invoices" }) },
      { path: "/purchase-invoices", element: el(DocumentListPage, { docTypeKey: "purchase-invoices" }) },
      { path: "/purchase-invoices/new", element: el(DocumentFormPage, { docTypeKey: "purchase-invoices" }) },
      { path: "/purchase-invoices/:id", element: el(DocumentDetailPage, { docTypeKey: "purchase-invoices" }) },
      { path: "/purchase-invoices/:id/edit", element: el(DocumentFormPage, { docTypeKey: "purchase-invoices" }) },
      { path: "/credit-notes", element: el(DocumentListPage, { docTypeKey: "credit-notes" }) },
      { path: "/credit-notes/new", element: el(DocumentFormPage, { docTypeKey: "credit-notes" }) },
      { path: "/credit-notes/:id", element: el(DocumentDetailPage, { docTypeKey: "credit-notes" }) },
      { path: "/credit-notes/:id/edit", element: el(DocumentFormPage, { docTypeKey: "credit-notes" }) },
      { path: "/debit-notes", element: el(DocumentListPage, { docTypeKey: "debit-notes" }) },
      { path: "/debit-notes/new", element: el(DocumentFormPage, { docTypeKey: "debit-notes" }) },
      { path: "/debit-notes/:id", element: el(DocumentDetailPage, { docTypeKey: "debit-notes" }) },
      { path: "/debit-notes/:id/edit", element: el(DocumentFormPage, { docTypeKey: "debit-notes" }) },

      { path: "/journal-entries", element: el(JournalEntriesPage) },
      { path: "/journal-entries/new", element: el(JournalEntryFormPage) },
      { path: "/journal-entries/:id", element: el(JournalEntryDetailPage) },
      { path: "/journal-entries/:id/edit", element: el(JournalEntryFormPage) },

      { path: "/payments", element: el(PaymentsPage) },
      { path: "/payments/new", element: el(PaymentFormPage) },
      { path: "/payments/:id", element: el(PaymentDetailPage) },

      { path: "/bank-accounts", element: el(BankAccountsPage) },
      { path: "/bank-accounts/new", element: el(BankAccountFormPage) },
      { path: "/bank-accounts/:id/edit", element: el(BankAccountFormPage) },
      { path: "/bank-transactions", element: el(BankTransactionsPage) },
      { path: "/bank-transactions/new", element: el(BankTransactionFormPage) },
      { path: "/bank-reconciliation", element: el(BankReconciliationPage) },
      { path: "/bank-reconciliation/:id", element: el(ReconciliationWorkspacePage) },

      { path: "/assets", element: el(AssetsPage) },
      { path: "/assets/new", element: el(AssetFormPage) },
      { path: "/assets/:id", element: el(AssetDetailPage) },
      { path: "/assets/:id/edit", element: el(AssetFormPage) },

      { path: "/budgets", element: el(BudgetsPage) },
      { path: "/budgets/new", element: el(BudgetFormPage) },
      { path: "/budgets/:id/edit", element: el(BudgetFormPage) },
      { path: "/budgets/:id/vs-actual", element: el(BudgetVsActualPage) },

      { path: "/tax-rates", element: el(TaxRatesPage) },
      { path: "/tax-rates/new", element: el(TaxRateFormPage) },
      { path: "/tax-rates/:id/edit", element: el(TaxRateFormPage) },
      { path: "/tax-groups", element: el(TaxGroupsPage) },
      { path: "/tax-groups/new", element: el(TaxGroupFormPage) },
      { path: "/tax-groups/:id/edit", element: el(TaxGroupFormPage) },

      { path: "/settings/fiscal-years", element: el(FiscalYearsPage) },
      { path: "/settings/fiscal-years/new", element: el(FiscalYearFormPage) },
      { path: "/settings/fiscal-years/:id/edit", element: el(FiscalYearFormPage) },
      { path: "/settings/numbering-series", element: el(NumberingSeriesPage) },
      { path: "/settings/numbering-series/new", element: el(NumberingSeriesFormPage) },
      { path: "/settings/numbering-series/:id/edit", element: el(NumberingSeriesFormPage) },
      { path: "/settings/cost-centers", element: el(CostCentersPage) },
      { path: "/settings/cost-centers/new", element: el(CostCenterFormPage) },
      { path: "/settings/cost-centers/:id/edit", element: el(CostCenterFormPage) },
      { path: "/settings/asset-categories", element: el(AssetCategoriesPage) },
      { path: "/settings/asset-categories/new", element: el(AssetCategoryFormPage) },
      { path: "/settings/asset-categories/:id/edit", element: el(AssetCategoryFormPage) },

      { path: "/reports/general-ledger", element: el(ReportPage, { report: "general-ledger" }) },
      { path: "/reports/trial-balance", element: el(ReportPage, { report: "trial-balance" }) },
      { path: "/reports/profit-loss", element: el(ReportPage, { report: "profit-loss" }) },
      { path: "/reports/balance-sheet", element: el(ReportPage, { report: "balance-sheet" }) },
      { path: "/reports/cash-flow", element: el(ReportPage, { report: "cash-flow" }) },
      { path: "/reports/sales-register", element: el(ReportPage, { report: "sales-register" }) },
      { path: "/reports/purchase-register", element: el(ReportPage, { report: "purchase-register" }) },
      { path: "/reports/customer-statement", element: el(ReportPage, { report: "customer-statement" }) },
      { path: "/reports/vendor-statement", element: el(ReportPage, { report: "vendor-statement" }) },
      { path: "/reports/ar-aging", element: el(ReportPage, { report: "ar-aging" }) },
      { path: "/reports/ap-aging", element: el(ReportPage, { report: "ap-aging" }) },
      { path: "/reports/gstr-1", element: el(ReportPage, { report: "gstr-1" }) },
      { path: "/reports/gstr-3b", element: el(ReportPage, { report: "gstr-3b" }) },

      // Fallback (authenticated → animated 404)
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
