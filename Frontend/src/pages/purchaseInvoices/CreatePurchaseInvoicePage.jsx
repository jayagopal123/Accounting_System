import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createPurchaseInvoice } from "../../services/purchaseInvoiceApi";

function CreatePurchaseInvoicePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    supplier: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    items: [{ itemName: "", quantity: 1, rate: 0, amount: 0 }],
  });

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
    const taxAmount = subtotal * 0.18;
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  }, [formData.items]);

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
      await createPurchaseInvoice(formData);
      navigate("/purchase-invoices");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Create Purchase Invoice</h2>
          <Link className="btn btn-outline-secondary" to="/purchase-invoices">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-4">
            <div className="col-md-6"><label className="form-label">Supplier Id</label><input className="form-control" value={formData.supplier} onChange={(e) => setFormData((c) => ({ ...c, supplier: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Invoice Date</label><input className="form-control" type="date" value={formData.invoiceDate} onChange={(e) => setFormData((c) => ({ ...c, invoiceDate: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => setFormData((c) => ({ ...c, remarks: e.target.value }))} /></div>
          </div>
          <div className="form-section-title">Items</div>
          {formData.items.map((item, index) => (
            <div className="row g-3 mb-3" key={index}>
              <div className="col-md-5"><input className="form-control" placeholder="Item Name" value={item.itemName} onChange={(e) => updateItem(index, "itemName", e.target.value)} required /></div>
              <div className="col-md-2"><input className="form-control" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required /></div>
              <div className="col-md-2"><input className="form-control" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} required /></div>
              <div className="col-md-3"><input className="form-control" value={item.amount} readOnly /></div>
            </div>
          ))}
          <button type="button" className="btn btn-outline-primary mb-3" onClick={() => setFormData((c) => ({ ...c, items: [...c.items, { itemName: "", quantity: 1, rate: 0, amount: 0 }] }))}>+ Add Item</button>
          <div className="text-end">
            <div>Subtotal: {totals.subtotal.toFixed(2)}</div>
            <div>Tax: {totals.taxAmount.toFixed(2)}</div>
            <div className="fw-bold">Grand Total: {totals.grandTotal.toFixed(2)}</div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary">Save Purchase Invoice</button>
            <Link className="btn btn-outline-secondary" to="/purchase-invoices">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreatePurchaseInvoicePage;
