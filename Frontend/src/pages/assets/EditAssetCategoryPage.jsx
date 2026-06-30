import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAssetCategoryById, updateAssetCategory } from "../../services/assetCategoryApi";
import { getAccounts } from "../../services/accountApi";

function EditAssetCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catRes, acctRes] = await Promise.all([
          getAssetCategoryById(id),
          getAccounts(),
        ]);
        const cat = catRes.data.data;
        const allAccounts = acctRes.data.data || [];
        setAccounts(allAccounts.filter((a) => !a.isGroup && a.status === "ACTIVE"));
        setFormData({
          categoryCode: cat.categoryCode || "",
          categoryName: cat.categoryName || "",
          description: cat.description || "",
          defaultUsefulLife: cat.defaultUsefulLife?.toString() || "60",
          defaultDepreciationMethod: cat.defaultDepreciationMethod || "StraightLine",
          defaultSalvageValuePercent: cat.defaultSalvageValuePercent?.toString() || "5",
          glAccount: cat.glAccount?._id || cat.glAccount || "",
          depreciationExpenseAccount: cat.depreciationExpenseAccount?._id || cat.depreciationExpenseAccount || "",
          accumulatedDepreciationAccount: cat.accumulatedDepreciationAccount?._id || cat.accumulatedDepreciationAccount || "",
        });
        setError("");
      } catch (err) {
        const msg = String(err);
        if (!msg.includes("Access denied")) setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateAssetCategory(id, {
        ...formData,
        defaultUsefulLife: Number(formData.defaultUsefulLife),
        defaultSalvageValuePercent: Number(formData.defaultSalvageValuePercent),
      });
      setSuccess(true);
      setTimeout(() => navigate("/settings/asset-categories"), 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="page-card p-4"><div className="text-center py-5"><div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} /></div></div>
      </MainLayout>
    );
  }

  if (!formData) {
    return (
      <MainLayout>
        <div className="page-card p-4">
          <div className="alert alert-danger">Asset category not found.</div>
          <Link className="btn btn-outline-secondary" to="/settings/asset-categories">← Back</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Asset Category</h5>
            <p className="page-header-subtitle">Update asset category details</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/settings/asset-categories">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}
        {success && <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}><span>Category updated successfully. Redirecting...</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Category Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Category Code *</label>
              <input className="form-control" value={formData.categoryCode} onChange={(e) => handleChange("categoryCode", e.target.value)} required />
            </div>
            <div className="col-md-8">
              <label className="form-label">Category Name *</label>
              <input className="form-control" value={formData.categoryName} onChange={(e) => handleChange("categoryName", e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">Depreciation Defaults</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Useful Life (Months) *</label>
              <input className="form-control" type="number" min="1" value={formData.defaultUsefulLife} onChange={(e) => handleChange("defaultUsefulLife", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Depreciation Method</label>
              <select className="form-select" value={formData.defaultDepreciationMethod} onChange={(e) => handleChange("defaultDepreciationMethod", e.target.value)}>
                <option value="StraightLine">Straight Line</option>
                <option value="WrittenDownValue">Written Down Value (WDV)</option>
                <option value="SumOfYearsDigits">Sum of Years Digits</option>
                <option value="None">No Depreciation</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Salvage Value (%)</label>
              <input className="form-control" type="number" min="0" max="100" value={formData.defaultSalvageValuePercent} onChange={(e) => handleChange("defaultSalvageValuePercent", e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">GL Account Mapping (Optional)</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Asset GL Account</label>
              <select className="form-select" value={formData.glAccount} onChange={(e) => handleChange("glAccount", e.target.value)}>
                <option value="">Select account</option>
                {accounts.map((a) => (<option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Depreciation Expense Account</label>
              <select className="form-select" value={formData.depreciationExpenseAccount} onChange={(e) => handleChange("depreciationExpenseAccount", e.target.value)}>
                <option value="">Select account</option>
                {accounts.map((a) => (<option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Accumulated Depreciation Account</label>
              <select className="form-select" value={formData.accumulatedDepreciationAccount} onChange={(e) => handleChange("accumulatedDepreciationAccount", e.target.value)}>
                <option value="">Select account</option>
                {accounts.map((a) => (<option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>))}
              </select>
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Category"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/asset-categories">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditAssetCategoryPage;
