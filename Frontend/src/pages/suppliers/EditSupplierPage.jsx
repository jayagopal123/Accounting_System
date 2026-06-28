import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getSupplierById, updateSupplier } from "../../services/supplierApi";

function EditSupplierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const response = await getSupplierById(id);
        const supplier = response.data.data;
        setFormData({
          ...supplier,
          addresses: supplier.addresses?.length ? supplier.addresses : [{ addressType: "Billing" }],
          contacts: supplier.contacts?.length ? supplier.contacts : [{}],
        });
      } catch (err) {
        setError(String(err));
      }
    };
    loadSupplier();
  }, [id]);

  const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateSupplier(id, formData);
      navigate("/suppliers");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Supplier</h5>
            <p className="page-header-subtitle">Modify supplier master record</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/suppliers">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!formData ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Loading supplier...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Basic Information</div>
            <div className="row g-3 mb-4">
              <div className="col-md-6"><label className="form-label">Supplier Code</label><input className="form-control font-mono" value={formData.supplierCode || ""} onChange={(e) => updateField("supplierCode", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Supplier Name</label><input className="form-control" value={formData.supplierName || ""} onChange={(e) => updateField("supplierName", e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Supplier Group</label><select className="form-select" value={formData.supplierGroup || "General"} onChange={(e) => updateField("supplierGroup", e.target.value)}><option value="General">General</option><option value="Retail">Retail</option><option value="Wholesale">Wholesale</option><option value="Government">Government</option></select></div>
              <div className="col-md-4"><label className="form-label">Supplier Type</label><select className="form-select" value={formData.supplierType || "Individual"} onChange={(e) => updateField("supplierType", e.target.value)}><option value="Individual">Individual</option><option value="Company">Company</option><option value="Partnership">Partnership</option></select></div>
              <div className="col-md-4"><label className="form-label">Currency</label><select className="form-select" value={formData.defaultCurrency || "INR"} onChange={(e) => updateField("defaultCurrency", e.target.value)}><option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="AED">AED (د.إ)</option><option value="GBP">GBP (£)</option></select></div>
              <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" value={formData.company || ""} onChange={(e) => updateField("company", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Territory</label><input className="form-control" value={formData.territory || ""} onChange={(e) => updateField("territory", e.target.value)} /></div>
            </div>

            <div className="form-section-title">Tax Information</div>
            <div className="row g-3 mb-4">
              <div className="col-md-4"><label className="form-label">GST Number</label><input className="form-control font-mono" value={formData.gstNumber || ""} onChange={(e) => updateField("gstNumber", e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">PAN Number</label><input className="form-control font-mono" value={formData.panNumber || ""} onChange={(e) => updateField("panNumber", e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Tax Category</label><input className="form-control" value={formData.taxCategory || ""} onChange={(e) => updateField("taxCategory", e.target.value)} /></div>
            </div>

            <div className="form-section-title">Credit & Payment</div>
            <div className="row g-3 mb-4">
              <div className="col-md-3"><label className="form-label">Credit Limit</label><input className="form-control" type="number" value={formData.creditLimit || 0} onChange={(e) => updateField("creditLimit", Number(e.target.value))} /></div>
              <div className="col-md-3"><label className="form-label">Opening Balance</label><input className="form-control" type="number" value={formData.openingBalance || 0} onChange={(e) => updateField("openingBalance", Number(e.target.value))} /></div>
              <div className="col-md-3"><label className="form-label">Credit Days</label><input className="form-control" type="number" value={formData.creditDays || 0} onChange={(e) => updateField("creditDays", Number(e.target.value))} /></div>
              <div className="col-md-3"><label className="form-label">Payment Terms</label><input className="form-control" value={formData.paymentTerms || ""} onChange={(e) => updateField("paymentTerms", e.target.value)} /></div>
            </div>

            <div className="form-section-title">Contact Details</div>
            <div className="row g-3 mb-4">
              <div className="col-md-4"><label className="form-label">Contact Person</label><input className="form-control" value={formData.contacts?.[0]?.contactPerson || ""} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], contactPerson: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">Phone</label><input className="form-control" value={formData.contacts?.[0]?.phone || ""} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], phone: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">Mobile</label><input className="form-control" value={formData.contacts?.[0]?.mobile || ""} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], mobile: e.target.value }])} /></div>
              <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={formData.contacts?.[0]?.email || ""} onChange={(e) => updateField("contacts", [{ ...formData.contacts[0], email: e.target.value }])} /></div>
            </div>

            <div className="form-section-title">Address (Billing)</div>
            <div className="row g-3 mb-4">
              <div className="col-md-8"><label className="form-label">Address Line 1</label><input className="form-control" value={formData.addresses?.[0]?.addressLine1 || ""} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], addressLine1: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">Postal Code</label><input className="form-control font-mono" value={formData.addresses?.[0]?.postalCode || ""} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], postalCode: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">City</label><input className="form-control" value={formData.addresses?.[0]?.city || ""} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], city: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">State</label><input className="form-control" value={formData.addresses?.[0]?.state || ""} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], state: e.target.value }])} /></div>
              <div className="col-md-4"><label className="form-label">Country</label><input className="form-control" value={formData.addresses?.[0]?.country || ""} onChange={(e) => updateField("addresses", [{ ...formData.addresses[0], country: e.target.value }])} /></div>
            </div>

            <div className="form-section-title">Additional Notes</div>
            <div className="row g-3 mb-4">
              <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="2" value={formData.remarks || ""} onChange={(e) => updateField("remarks", e.target.value)} /></div>
            </div>

            <div className="d-flex gap-2 pt-3 border-top">
              <button className="btn btn-primary">Update Supplier</button>
              <Link className="btn btn-outline-secondary" to="/suppliers">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditSupplierPage;
