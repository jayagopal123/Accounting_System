import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { cancelSalesInvoice, getSalesInvoices, submitSalesInvoice } from "../../services/salesInvoiceApi";

function SalesInvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const loadInvoices = async () => {
    try {
      const response = await getSalesInvoices();
      setInvoices(response.data.data);
      setError("");
    } catch (err) {
      setError(String(err));
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
          <h2>Sales Invoices</h2>
          <Link className="btn btn-primary" to="/sales-invoices/new">+ New Sales Invoice</Link>
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
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No sales invoices found.</td></tr>
              ) : filteredInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td>{invoice.customer?.customerName || invoice.customer}</td>
                  <td>{invoice.grandTotal}</td>
                  <td><span className="badge bg-info">{invoice.status}</span></td>
                  <td className="text-end">
                    {invoice.status === "Draft" ? <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleAction(() => submitSalesInvoice(invoice._id))}>Submit</button> : null}
                    {invoice.status !== "Cancelled" ? <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(() => cancelSalesInvoice(invoice._id))}>Cancel</button> : null}
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

export default SalesInvoiceListPage;
