import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getTaxRateById, updateTaxRate } from "../../services/taxRateApi";

function EditTaxRatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTaxRateById(id);
        const tr = res.data.data;
        setFormData({
          taxName: tr.taxName,
          taxCode: tr.taxCode,
          rate: tr.rate,
          taxType: tr.taxType,
          effectiveFrom: tr.effectiveFrom ? new Date(tr.effectiveFrom).toISOString().slice(0, 10) : "",
          description: tr.description || "",
          isActive: tr.isActive,
        });
      } catch (err) {
        const msg = String(err);
        if (!msg.includes("Access denied")) setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateTaxRate(id, { ...formData, rate: Number(formData.rate) });
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
            <h5 className="page-header-title mb-1">Edit Tax Rate</h5>
            <p className="page-header-subtitle">Modify tax rate configuration</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/tax-rates">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}>
            <span>Tax rate updated successfully. Redirecting...</span>
          </div>
        )}
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Loading...</span>
          </div>
        ) : formData && (
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Tax Rate Details</div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Tax Code *</label>
                <input className="form-control" value={formData.taxCode} onChange={(e) => setFormData((c) => ({ ...c, taxCode: e.target.value }))} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tax Name *</label>
                <input className="form-control" value={formData.taxName} onChange={(e) => setFormData((c) => ({ ...c, taxName: e.target.value }))} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Rate (%) *</label>
                <input className="form-control" type="number" min="0" max="100" step="0.01" value={formData.rate} onChange={(e) => setFormData((c) => ({ ...c, rate: e.target.value }))} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Tax Type</label>
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
                <input className="form-control" value={formData.description} onChange={(e) => setFormData((c) => ({ ...c, description: e.target.value }))} />
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
                {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Tax Rate"}
              </button>
              <Link className="btn btn-outline-secondary" to="/tax-rates">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditTaxRatePage;
