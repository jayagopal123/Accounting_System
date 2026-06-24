import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<AccountListPage />} />
        <Route path="/accounts/new" element={<CreateAccountPage />} />
        <Route path="/accounts/:id/edit" element={<EditAccountPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CreateCustomerPage />} />
        <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/suppliers/new" element={<CreateSupplierPage />} />
        <Route path="/suppliers/:id/edit" element={<EditSupplierPage />} />
        <Route path="/journal-entries" element={<JournalEntryListPage />} />
        <Route path="/journal-entries/new" element={<CreateJournalEntryPage />} />
        <Route path="/sales-invoices" element={<SalesInvoiceListPage />} />
        <Route path="/sales-invoices/new" element={<CreateSalesInvoicePage />} />
        <Route path="/purchase-invoices" element={<PurchaseInvoiceListPage />} />
        <Route path="/purchase-invoices/new" element={<CreatePurchaseInvoicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
