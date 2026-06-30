import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { createTaxRate } from "../../services/taxRateApi";

function CreateTaxRatePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    taxName: "",
    taxCode: "",
    rate: "",
    taxType: "CGST",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    description: "",
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await createTaxRate({
        ...formData,
        rate: Number(formData.rate),
      });
      setSuccess(true);
      setTimeout(() => navigate("/tax-rates"), 800);
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
            <h5 className="page-header-title mb-1">Create Tax Rate</h5>
            <p className="page-header-subtitle">Add a new GST or tax rate</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/tax-rates">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}>
            <span>Tax rate created successfully. Redirecting...</span>
          </div>
        )}
        {hasPermission("tax_rates:create") && (
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Tax Rate Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Tax Code *</label>
              <input className="form-control" placeholder="e.g., CGST-9" value={formData.taxCode} onChange={(e) => setFormData((c) => ({ ...c, taxCode: e.target.value }))} required />
              <div className="text-muted small mt-1">Unique identifier, e.g., CGST-9, SGST-9, IGST-18</div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Tax Name *</label>
              <input className="form-control" placeholder="e.g., Central GST 9%" value={formData.taxName} onChange={(e) => setFormData((c) => ({ ...c, taxName: e.target.value }))} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Rate (%) *</label>
              <input className="form-control" type="number" min="0" max="100" step="0.01" value={formData.rate} onChange={(e) => setFormData((c) => ({ ...c, rate: e.target.value }))} required placeholder="9" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Tax Type *</label>
              <select className="form-select" value={formData.taxType} onChange={(e) => setFormData((c) => ({ ...c, taxType: e.target.value }))} required>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
                <option value="CESS">CESS</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Effective From</label>
              <input className="form-control" type="date" value={formData.effectiveFrom} onChange={(e) => setFormData((c) => ({ ...c, effectiveFrom: e.target.value }))} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Description</label>
              <input className="form-control" placeholder="Optional description" value={formData.description} onChange={(e) => setFormData((c) => ({ ...c, description: e.target.value }))} />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData((c) => ({ ...c, isActive: e.target.checked }))} />
                <label className="form-check-label" htmlFor="isActive">Active</label>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Create Tax Rate"}
            </button>
            <Link className="btn btn-outline-secondary" to="/tax-rates">Cancel</Link>
          </div>
        </form>
        )}
      </div>
    </MainLayout>
  );
}

export default CreateTaxRatePage;
