import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createNumberingSeries } from "../../services/numberingSeriesApi";

const DOCUMENT_TYPES = [
  "Account",
  "Customer",
  "Supplier",
  "JournalEntry",
  "SalesInvoice",
  "PurchaseInvoice",
  "Payment",
];

function CreateNumberingSeriesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    documentType: "Account",
    prefix: "",
    startingNumber: 1,
    padLength: 5,
    isActive: true,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await createNumberingSeries(formData);
      navigate("/settings/numbering-series");
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const sampleNumber = `${formData.prefix || "{prefix}"}-${String(formData.startingNumber).padStart(formData.padLength, "0")}`;

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Create Numbering Series</h5>
            <p className="page-header-subtitle">Configure auto-numbering for a document type</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/settings/numbering-series">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Series Configuration</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Document Type</label>
              <select
                className="form-select"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                required
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Prefix</label>
              <input
                className="form-control font-mono"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                required
                placeholder="e.g. INV"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Pad Length</label>
              <input
                type="number"
                className="form-control"
                name="padLength"
                value={formData.padLength}
                onChange={handleChange}
                min={1}
                max={10}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Starting Number</label>
              <input
                type="number"
                className="form-control"
                name="startingNumber"
                value={formData.startingNumber}
                onChange={handleChange}
                min={1}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Description</label>
              <input
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                />
                <label className="form-check-label" htmlFor="isActive">Active</label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-light rounded p-3 mb-4 border">
            <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Sample Output</small>
            <div className="font-mono fw-bold mt-1" style={{ fontSize: "1rem", color: "#0f172a" }}>
              {sampleNumber}
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Save Series"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/numbering-series">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateNumberingSeriesPage;
