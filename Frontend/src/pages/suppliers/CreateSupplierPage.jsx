import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createSupplier } from "../../services/supplierApi";

const initialForm = {
  supplierCode: "",
  supplierName: "",
  supplierGroup: "General",
  supplierType: "Individual",
  territory: "",
  defaultCurrency: "INR",
  company: "",
  gstNumber: "",
  panNumber: "",
  taxCategory: "",
  creditLimit: 0,
  openingBalance: 0,
  paymentTerms: "",
  creditDays: 0,
  allowCreditPurchase: true,
  remarks: "",
  tags: [],
  addresses: [{ addressType: "Billing", addressLine1: "", city: "", state: "", country: "", postalCode: "" }],
  contacts: [{ contactPerson: "", phone: "", mobile: "", email: "" }],
};

function CreateSupplierPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createSupplier({ ...formData, tags: formData.tags.filter(Boolean) });
      navigate("/suppliers");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Create Supplier</h2>
          <Link className="btn btn-outline-secondary" to="/suppliers">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Supplier Code</label><input className="form-control" value={formData.supplierCode} onChange={(e) => updateField("supplierCode", e.target.value)} required /></div>
            <div className="col-md-6"><label className="form-label">Supplier Name</label><input className="form-control" value={formData.supplierName} onChange={(e) => updateField("supplierName", e.target.value)} required /></div>
            <div className="col-md-4"><label className="form-label">Supplier Group</label><input className="form-control" value={formData.supplierGroup} onChange={(e) => updateField("supplierGroup", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Supplier Type</label><input className="form-control" value={formData.supplierType} onChange={(e) => updateField("supplierType", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Currency</label><input className="form-control" value={formData.defaultCurrency} onChange={(e) => updateField("defaultCurrency", e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" value={formData.company} onChange={(e) => updateField("company", e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label">Territory</label><input className="form-control" value={formData.territory} onChange={(e) => updateField("territory", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">GST Number</label><input className="form-control" value={formData.gstNumber} onChange={(e) => updateField("gstNumber", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">PAN Number</label><input className="form-control" value={formData.panNumber} onChange={(e) => updateField("panNumber", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Tax Category</label><input className="form-control" value={formData.taxCategory} onChange={(e) => updateField("taxCategory", e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Credit Limit</label><input className="form-control" type="number" value={formData.creditLimit} onChange={(e) => updateField("creditLimit", Number(e.target.value))} /></div>
            <div className="col-md-4"><label className="form-label">Opening Balance</label><input className="form-control" type="number" value={formData.openingBalance} onChange={(e) => updateField("openingBalance", Number(e.target.value))} /></div>
            <div className="col-md-4"><label className="form-label">Credit Days</label><input className="form-control" type="number" value={formData.creditDays} onChange={(e) => updateField("creditDays", Number(e.target.value))} /></div>
            <div className="col-md-6"><label className="form-label">Payment Terms</label><input className="form-control" value={formData.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label">Primary Contact Email</label><input className="form-control" value={formData.contacts[0].email} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], email: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">Contact Person</label><input className="form-control" value={formData.contacts[0].contactPerson} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], contactPerson: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">Phone</label><input className="form-control" value={formData.contacts[0].phone} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], phone: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">Mobile</label><input className="form-control" value={formData.contacts[0].mobile} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], mobile: e.target.value }])} /></div>
            <div className="col-md-8"><label className="form-label">Address Line 1</label><input className="form-control" value={formData.addresses[0].addressLine1} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], addressLine1: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">Postal Code</label><input className="form-control" value={formData.addresses[0].postalCode} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], postalCode: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">City</label><input className="form-control" value={formData.addresses[0].city} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], city: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">State</label><input className="form-control" value={formData.addresses[0].state} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], state: e.target.value }])} /></div>
            <div className="col-md-4"><label className="form-label">Country</label><input className="form-control" value={formData.addresses[0].country} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], country: e.target.value }])} /></div>
            <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => updateField("remarks", e.target.value)} /></div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary">Save Supplier</button>
            <Link className="btn btn-outline-secondary" to="/suppliers">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateSupplierPage;
