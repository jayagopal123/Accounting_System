import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getTaxGroupById, updateTaxGroup } from "../../services/taxGroupApi";
import { getActiveTaxRates } from "../../services/taxRateApi";

function EditTaxGroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, ratesRes] = await Promise.all([
          getTaxGroupById(id),
          getActiveTaxRates(),
        ]);
        const g = groupRes.data.data;
        setTaxRates(ratesRes.data.data || []);
        setFormData({
          groupName: g.groupName,
          groupCode: g.groupCode,
          selectedTaxes: (g.taxes || []).map((t) => t.taxRate?._id || t.taxRate).filter(Boolean),
          description: g.description || "",
          isActive: g.isActive,
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

  const toggleTax = (rateId) => {
    setFormData((c) => ({
      ...c,
      selectedTaxes: c.selectedTaxes.includes(rateId)
        ? c.selectedTaxes.filter((tid) => tid !== rateId)
        : [...c.selectedTaxes, rateId],
    }));
  };

  const totalRate = () => {
    return taxRates
      .filter((tr) => formData?.selectedTaxes?.includes(tr._id))
      .reduce((sum, tr) => sum + tr.rate, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateTaxGroup(id, {
        groupName: formData.groupName,
        groupCode: formData.groupCode,
        taxes: formData.selectedTaxes.map((tid) => ({ taxRate: tid })),
        description: formData.description,
        isActive: formData.isActive,
      });
      setSuccess(true);
      setTimeout(() => navigate("/tax-groups"), 800);
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
            <h5 className="page-header-title mb-1">Edit Tax Group</h5>
            <p className="page-header-subtitle">Modify tax group composition</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/tax-groups">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}>
            <span>Tax group updated successfully. Redirecting...</span>
          </div>
        )}
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Loading...</span>
          </div>
        ) : formData && (
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Group Details</div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Group Code *</label>
                <input className="form-control" value={formData.groupCode} onChange={(e) => setFormData((c) => ({ ...c, groupCode: e.target.value }))} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Group Name *</label>
                <input className="form-control" value={formData.groupName} onChange={(e) => setFormData((c) => ({ ...c, groupName: e.target.value }))} required />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <input className="form-control" value={formData.description} onChange={(e) => setFormData((c) => ({ ...c, description: e.target.value }))} />
              </div>
            </div>

            <div className="form-section-title">Select Tax Rates</div>
            <div className="mb-3">
              {taxRates.length === 0 ? (
                <div className="text-muted small py-2">No active tax rates available.</div>
              ) : (
                <div className="row g-2">
                  {taxRates.map((tr) => (
                    <div className="col-md-4 col-lg-3" key={tr._id}>
                      <div
                        className={`d-flex align-items-center gap-2 p-2 border rounded ${formData.selectedTaxes.includes(tr._id) ? "border-primary bg-light" : ""}`}
                        style={{ cursor: "pointer", fontSize: "0.8rem" }}
                        onClick={() => toggleTax(tr._id)}
                      >
                        <input type="checkbox" checked={formData.selectedTaxes.includes(tr._id)} onChange={() => {}} className="form-check-input" />
                        <div>
                          <div className="fw-semibold">{tr.taxCode}</div>
                          <div className="text-muted">{tr.taxName} — {tr.rate}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end mb-3">
              <div style={{ minWidth: "200px" }}>
                <div className="summary-row total">
                  <span className="summary-label">Combined Rate</span>
                  <span className="summary-value">{totalRate()}%</span>
                </div>
              </div>
            </div>

            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData((c) => ({ ...c, isActive: e.target.checked }))} />
              <label className="form-check-label" htmlFor="isActive">Active</label>
            </div>

            <div className="d-flex gap-2 pt-3 border-top">
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : "Update Tax Group"}
              </button>
              <Link className="btn btn-outline-secondary" to="/tax-groups">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditTaxGroupPage;
