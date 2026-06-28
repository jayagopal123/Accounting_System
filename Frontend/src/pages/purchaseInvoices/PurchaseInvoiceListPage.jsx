import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { cancelPurchaseInvoice, getPurchaseInvoices, submitPurchaseInvoice } from "../../services/purchaseInvoiceApi";
import { BsFileText, BsCheckLg, BsXLg } from "react-icons/bs";

function PurchaseInvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseInvoices();
      setInvoices(response.data.data);
      setError("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => (statusFilter ? invoice.status === statusFilter : true)),
    [invoices, statusFilter]
  );

  const handleAction = async (action) => {
    try {
      await action();
      await loadInvoices();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Purchase Invoices</h5>
            <p className="page-header-subtitle">Manage supplier purchase transactions</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/purchase-invoices/new">
            <span>+</span> New Invoice
          </Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Supplier</th>
                <th className="text-end">Grand Total</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span className="text-muted small">Loading invoices...</span>
                  </div>
                </td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsFileText size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No purchase invoices found</div>
                    <div className="text-muted small">Create a new purchase invoice to get started.</div>
                  </div>
                </td></tr>
              ) : filteredInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="fw-semibold font-mono">{invoice.invoiceNumber}</td>
                  <td className="text-muted">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="fw-medium">{invoice.supplier?.supplierName || invoice.supplier}</td>
                  <td className="font-mono fw-semibold text-end">{Number(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge-premium ${invoice.status === "Draft" ? "badge-premium-draft" : invoice.status === "Submitted" ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>{invoice.status}</span></td>
                  <td className="text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      {invoice.status === "Draft" ? (
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleAction(() => submitPurchaseInvoice(invoice._id))} title="Submit">
                          <BsCheckLg size={13} />
                        </button>
                      ) : null}
                      {invoice.status !== "Cancelled" ? (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(() => cancelPurchaseInvoice(invoice._id))} title="Cancel">
                          <BsXLg size={13} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default PurchaseInvoiceListPage;
