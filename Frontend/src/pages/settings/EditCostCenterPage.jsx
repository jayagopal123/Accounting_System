import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCostCenterById, updateCostCenter } from "../../services/costCenterApi";

function EditCostCenterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getCostCenterById(id);
        const cc = response.data.data;
        setFormData({
          code: cc.code,
          name: cc.name,
          description: cc.description || "",
          status: cc.status,
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateCostCenter(id, formData);
      navigate("/settings/cost-centers");
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
            <h5 className="page-header-title mb-1">Edit Cost Center</h5>
            <p className="page-header-subtitle">Update cost allocation center details</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/settings/cost-centers">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Cost Center Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Code</label>
              <input className="form-control font-mono" name="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" name="description" value={formData.description} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Cost Center"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/cost-centers">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditCostCenterPage;
