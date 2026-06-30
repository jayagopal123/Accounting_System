import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getFiscalYearById, updateFiscalYear } from "../../services/fiscalYearApi";

function EditFiscalYearPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    yearName: "",
    startDate: "",
    endDate: "",
    isDefault: false,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getFiscalYearById(id);
        const fy = response.data.data;
        setFormData({
          yearName: fy.yearName,
          startDate: fy.startDate ? fy.startDate.slice(0, 10) : "",
          endDate: fy.endDate ? fy.endDate.slice(0, 10) : "",
          isDefault: fy.isDefault,
          description: fy.description || "",
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateFiscalYear(id, {
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

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Fiscal Year</h5>
            <p className="page-header-subtitle">Update accounting period details</p>
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
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Fiscal Year"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/fiscal-years">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditFiscalYearPage;
