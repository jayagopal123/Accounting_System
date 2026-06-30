import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAssetById, updateAsset } from "../../services/assetApi";
import { getAssetCategories } from "../../services/assetCategoryApi";
import { getAccounts } from "../../services/accountApi";

function EditAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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
        const [assetRes, catRes, acctRes] = await Promise.all([
          getAssetById(id),
          getAssetCategories(),
          getAccounts(),
        ]);
        const asset = assetRes.data.data;
        setCategories((catRes.data.data || []).filter((c) => c.isActive));
        setAccounts((acctRes.data.data || []).filter((a) => !a.isGroup && a.status === "ACTIVE"));
        setFormData({
          assetCode: asset.assetCode || "",
          assetName: asset.assetName || "",
          description: asset.description || "",
          category: asset.category?._id || asset.category || "",
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().slice(0, 10) : "",
          purchaseCost: asset.purchaseCost?.toString() || "",
          usefulLife: asset.usefulLife?.toString() || "",
          depreciationMethod: asset.depreciationMethod || "StraightLine",
          salvageValue: asset.salvageValue?.toString() || "0",
          location: asset.location || "",
          assignedTo: asset.assignedTo || "",
          vendorName: asset.vendorName || "",
          invoiceNumber: asset.invoiceNumber || "",
          serialNumber: asset.serialNumber || "",
          glAccount: asset.glAccount?._id || asset.glAccount || "",
          depreciationExpenseAccount: asset.depreciationExpenseAccount?._id || asset.depreciationExpenseAccount || "",
          accumulatedDepreciationAccount: asset.accumulatedDepreciationAccount?._id || asset.accumulatedDepreciationAccount || "",
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
      await updateAsset(id, {
        ...formData,
        purchaseCost: Number(formData.purchaseCost),
        usefulLife: Number(formData.usefulLife) || undefined,
        salvageValue: Number(formData.salvageValue) || 0,
      });
      setSuccess(true);
      setTimeout(() => navigate("/assets"), 800);
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
          <div className="alert alert-danger">Asset not found.</div>
          <Link className="btn btn-outline-secondary" to="/assets">← Back</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Asset</h5>
            <p className="page-header-subtitle">Update asset details (only draft assets can be edited)</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/assets">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}
        {success && <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}><span>Asset updated successfully. Redirecting...</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Asset Identification</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Asset Code *</label>
              <input className="form-control font-mono" value={formData.assetCode} onChange={(e) => handleChange("assetCode", e.target.value)} required />
            </div>
            <div className="col-md-8">
              <label className="form-label">Asset Name *</label>
              <input className="form-control" value={formData.assetName} onChange={(e) => handleChange("assetName", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Category *</label>
              <select className="form-select" value={formData.category} onChange={(e) => handleChange("category", e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => (<option key={c._id} value={c._id}>{c.categoryName} ({c.categoryCode})</option>))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Purchase Date *</label>
              <input className="form-control" type="date" value={formData.purchaseDate} onChange={(e) => handleChange("purchaseDate", e.target.value)} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Purchase Cost *</label>
              <input className="form-control font-mono" type="number" step="0.01" min="0" value={formData.purchaseCost} onChange={(e) => handleChange("purchaseCost", e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">Depreciation Settings</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Useful Life (Months) *</label>
              <input className="form-control" type="number" min="1" value={formData.usefulLife} onChange={(e) => handleChange("usefulLife", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Depreciation Method</label>
              <select className="form-select" value={formData.depreciationMethod} onChange={(e) => handleChange("depreciationMethod", e.target.value)}>
                <option value="StraightLine">Straight Line</option>
                <option value="WrittenDownValue">Written Down Value (WDV)</option>
                <option value="SumOfYearsDigits">Sum of Years Digits</option>
                <option value="None">No Depreciation</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Salvage Value</label>
              <input className="form-control font-mono" type="number" step="0.01" min="0" value={formData.salvageValue} onChange={(e) => handleChange("salvageValue", e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">Additional Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input className="form-control" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Assigned To</label>
              <input className="form-control" value={formData.assignedTo} onChange={(e) => handleChange("assignedTo", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Serial Number</label>
              <input className="form-control" value={formData.serialNumber} onChange={(e) => handleChange("serialNumber", e.target.value)} />
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Asset"}
            </button>
            <Link className="btn btn-outline-secondary" to="/assets">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditAssetPage;
