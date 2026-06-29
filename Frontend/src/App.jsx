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
        
        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;