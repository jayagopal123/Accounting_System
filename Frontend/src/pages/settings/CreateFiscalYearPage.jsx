import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createFiscalYear } from "../../services/fiscalYearApi";

function CreateFiscalYearPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    yearName: "",
    startDate: "",
    endDate: "",
    isDefault: false,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await createFiscalYear({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
      navigate("/settings/fiscal-years");
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Create Fiscal Year</h5>
            <p className="page-header-subtitle">Define a new accounting period</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/settings/fiscal-years">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Fiscal Year Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Year Name</label>
              <input
                className="form-control"
                name="yearName"
                value={formData.yearName}
                onChange={handleChange}
                required
                placeholder="e.g. FY 2026-27"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
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
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  id="isDefault"
                />
                <label className="form-check-label" htmlFor="isDefault">Set as default fiscal year</label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Save Fiscal Year"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/fiscal-years">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateFiscalYearPage;
