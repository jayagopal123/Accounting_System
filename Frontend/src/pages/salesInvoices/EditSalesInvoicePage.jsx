import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getSalesInvoiceById, updateSalesInvoice } from "../../services/salesInvoiceApi";
import { getCustomers } from "../../services/customerApi";

function EditSalesInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission("sales_invoices:update")) {
      navigate("/sales-invoices", { replace: true });
    }
  }, [hasPermission, navigate]);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoiceResponse, customersResponse] = await Promise.all([
          getSalesInvoiceById(id),
          getCustomers({ limit: 100 }),
        ]);
        const invoice = invoiceResponse.data.data;
        setCustomers(customersResponse.data.data.customers || customersResponse.data.data || []);
        setFormData({
          customer: invoice.customer?._id || invoice.customer || "",
          invoiceDate: invoice.invoiceDate
            ? new Date(invoice.invoiceDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          remarks: invoice.remarks || "",
          items: invoice.items?.length
            ? invoice.items.map((item) => ({
                itemName: item.itemName,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
              }))
            : [{ itemName: "", quantity: 1, rate: 0, amount: 0 }],
        });
      } catch (err) {
        const msg = String(err);
        if (!msg.includes("Access denied")) setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const totals = useMemo(() => {
    if (!formData) return { subtotal: 0, taxAmount: 0, grandTotal: 0 };
    const subtotal = formData.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
    const taxAmount = subtotal * 0.18;
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  }, [formData?.items]);

  const updateItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextItem = { ...item, [field]: field === "itemName" ? value : Number(value) };
        return { ...nextItem, amount: Number(nextItem.quantity) * Number(nextItem.rate) };
      }),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateSalesInvoice(id, formData);
      setSuccess(true);
      setTimeout(() => navigate("/sales-invoices"), 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Sales Invoice</h5>
            <p className="page-header-subtitle">Modify customer sales transaction</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/sales-invoices">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}>
            <span>Sales invoice updated successfully. Redirecting...</span>
          </div>
        )}
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Loading invoice...</span>
          </div>
        ) : formData && (
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Invoice Details</div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Customer</label>
                <select className="form-select" value={formData.customer} onChange={(e) => setFormData((c) => ({ ...c, customer: e.target.value }))} required>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerCode} - {customer.customerName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Invoice Date</label>
                <input className="form-control" type="date" value={formData.invoiceDate} onChange={(e) => setFormData((c) => ({ ...c, invoiceDate: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">Remarks</label>
                <textarea className="form-control" rows="2" value={formData.remarks} onChange={(e) => setFormData((c) => ({ ...c, remarks: e.target.value }))} placeholder="Optional notes..." />
              </div>
            </div>

            <div className="form-section-title">Line Items</div>
            <div className="table-responsive border-0 mb-3">
              <table className="table table-premium align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{width: '35%'}}>Item Name</th>
                    <th style={{width: '15%'}} className="text-end">Quantity</th>
                    <th style={{width: '15%'}} className="text-end">Rate</th>
                    <th style={{width: '15%'}} className="text-end">Amount</th>
                    <th style={{width: '20%'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td><input className="form-control form-control-sm" placeholder="Item name" value={item.itemName} onChange={(e) => updateItem(index, "itemName", e.target.value)} required /></td>
                      <td><input className="form-control form-control-sm text-end" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required /></td>
                      <td><input className="form-control form-control-sm text-end font-mono" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} required placeholder="0.00" /></td>
                      <td className="font-mono fw-semibold text-end">{Number(item.amount).toFixed(2)}</td>
                      <td>
                        {formData.items.length > 1 && (
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setFormData((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))}>
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="btn btn-sm btn-outline-primary mb-4" onClick={() => setFormData((c) => ({ ...c, items: [...c.items, { itemName: "", quantity: 1, rate: 0, amount: 0 }] }))}>+ Add Item</button>

            <div className="d-flex justify-content-end">
              <div style={{ minWidth: "220px" }}>
                <div className="summary-row"><span className="summary-label">Subtotal</span><span className="summary-value">{totals.subtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span className="summary-label">Tax (18%)</span><span className="summary-value">{totals.taxAmount.toFixed(2)}</span></div>
                <div className="summary-row total"><span className="summary-label">Grand Total</span><span className="summary-value">{totals.grandTotal.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="d-flex gap-2 pt-3 border-top mt-3">
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Sales Invoice"}
              </button>
              <Link className="btn btn-outline-secondary" to="/sales-invoices">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditSalesInvoicePage;
