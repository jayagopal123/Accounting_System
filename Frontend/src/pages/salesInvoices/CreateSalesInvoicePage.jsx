import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { createSalesInvoice } from "../../services/salesInvoiceApi";
import { getCustomers } from "../../services/customerApi";
import { getActiveTaxGroups } from "../../services/taxGroupApi";

function CreateSalesInvoicePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission("sales_invoices:create")) {
      navigate("/sales-invoices", { replace: true });
    }
  }, [hasPermission, navigate]);

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [taxGroups, setTaxGroups] = useState([]);

  const [formData, setFormData] = useState({
    customer: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    taxGroup: "",
    items: [{ itemName: "", quantity: 1, rate: 0, amount: 0 }],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, taxRes] = await Promise.all([
          getCustomers({ limit: 100 }),
          getActiveTaxGroups(),
        ]);
        setCustomers(custRes.data.data.customers || custRes.data.data || []);
        setTaxGroups(taxRes.data.data || []);
      } catch {
        setCustomers([]);
        setTaxGroups([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadData();
  }, []);

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
    // When tax group is selected, use the combined rate for display; otherwise 0
    const selectedGroup = taxGroups.find((g) => g._id === formData.taxGroup);
    const combinedRate = selectedGroup
      ? (selectedGroup.taxes || []).reduce((sum, t) => sum + (t.taxRate?.rate || 0), 0)
      : 0;
    const taxAmount = formData.taxGroup ? (subtotal * combinedRate) / 100 : 0;
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  }, [formData.items, formData.taxGroup, taxGroups]);

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
      await createSalesInvoice(formData);
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
            <h5 className="page-header-title mb-1">Create Sales Invoice</h5>
            <p className="page-header-subtitle">Generate a new customer sales invoice</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/sales-invoices">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}>
            <span>Sales invoice created successfully. Redirecting...</span>
          </div>
        )}
        {hasPermission("sales_invoices:create") && (
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Invoice Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Customer</label>
              <select className="form-select" value={formData.customer} onChange={(e) => setFormData((c) => ({ ...c, customer: e.target.value }))} required>
                <option value="">{loadingCustomers ? "Loading customers..." : "Select customer"}</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerCode} - {customer.customerName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6"><label className="form-label">Invoice Date</label><input className="form-control" type="date" value={formData.invoiceDate} onChange={(e) => setFormData((c) => ({ ...c, invoiceDate: e.target.value }))} /></div>              <div className="col-md-6">
                <label className="form-label">Tax Group</label>
                <select className="form-select" value={formData.taxGroup} onChange={(e) => setFormData((c) => ({ ...c, taxGroup: e.target.value }))}>
                  <option value="">No Tax (Nil Rated)</option>
                  {taxGroups.map((g) => (
                    <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                  ))}
                </select>
              </div>
              <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="2" value={formData.remarks} onChange={(e) => setFormData((c) => ({ ...c, remarks: e.target.value }))} placeholder="Optional notes..." /></div>
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
              <div className="summary-row"><span className="summary-label">Tax {formData.taxGroup ? `(${totals.subtotal > 0 ? ((totals.taxAmount / totals.subtotal) * 100).toFixed(1) : 0}%)` : ""}</span><span className="summary-value">{totals.taxAmount.toFixed(2)}</span></div>
              <div className="summary-row total"><span className="summary-label">Grand Total</span><span className="summary-value">{totals.grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top mt-3">
            <button className="btn btn-primary" disabled={submitting}>{submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Save Sales Invoice"}</button>
            <Link className="btn btn-outline-secondary" to="/sales-invoices">Cancel</Link>
          </div>
        </form>
        )}
      </div>
    </MainLayout>
  );
}

export default CreateSalesInvoicePage;
