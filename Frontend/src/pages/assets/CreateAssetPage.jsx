import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createAsset } from "../../services/assetApi";
import { getAssetCategories } from "../../services/assetCategoryApi";
import { getAccounts } from "../../services/accountApi";

function CreateAssetPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    assetCode: "",
    assetName: "",
    description: "",
    category: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseCost: "",
    usefulLife: "",
    depreciationMethod: "StraightLine",
    salvageValue: "",
    location: "",
    assignedTo: "",
    vendorName: "",
    invoiceNumber: "",
    serialNumber: "",
    glAccount: "",
    depreciationExpenseAccount: "",
    accumulatedDepreciationAccount: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, acctRes] = await Promise.all([
          getAssetCategories(),
          getAccounts(),
        ]);
        setCategories((catRes.data.data || []).filter((c) => c.isActive));
        setAccounts((acctRes.data.data || []).filter((a) => !a.isGroup && a.status === "ACTIVE"));
      } catch {
        setCategories([]);
        setAccounts([]);
      }
    };
    loadData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      usefulLife: cat ? cat.defaultUsefulLife?.toString() : "",
      depreciationMethod: cat ? cat.defaultDepreciationMethod : "StraightLine",
      salvageValue: cat && prev.purchaseCost ? ((Number(prev.purchaseCost) * cat.defaultSalvageValuePercent) / 100).toString() : "",
      glAccount: cat?.glAccount?._id || cat?.glAccount || "",
      depreciationExpenseAccount: cat?.depreciationExpenseAccount?._id || cat?.depreciationExpenseAccount || "",
      accumulatedDepreciationAccount: cat?.accumulatedDepreciationAccount?._id || cat?.accumulatedDepreciationAccount || "",
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        purchaseCost: Number(formData.purchaseCost),
        usefulLife: Number(formData.usefulLife) || undefined,
        salvageValue: Number(formData.salvageValue) || undefined,
        glAccount: formData.glAccount || undefined,
        depreciationExpenseAccount: formData.depreciationExpenseAccount || undefined,
        accumulatedDepreciationAccount: formData.accumulatedDepreciationAccount || undefined,
      };

      await createAsset(payload);
      setSuccess(true);
      setTimeout(() => navigate("/assets"), 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === formData.category);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Add Fixed Asset</h5>
            <p className="page-header-subtitle">Register a new fixed asset for tracking and depreciation</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/assets">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}
        {success && <div className="alert alert-success d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#065f46", border: "none" }}><span>Asset created successfully. Redirecting...</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Asset Identification</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Asset Code *</label>
              <input className="form-control font-mono" value={formData.assetCode} onChange={(e) => handleChange("assetCode", e.target.value)} required placeholder="e.g. AST-001" />
            </div>
            <div className="col-md-8">
              <label className="form-label">Asset Name *</label>
              <input className="form-control" value={formData.assetName} onChange={(e) => handleChange("assetName", e.target.value)} required placeholder="e.g. Office Desk" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Category *</label>
              <select className="form-select" value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)} required>
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
              <input className="form-control font-mono" type="number" step="0.01" min="0" value={formData.purchaseCost} onChange={(e) => handleChange("purchaseCost", e.target.value)} required placeholder="0.00" />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Optional description..." />
            </div>
          </div>

          <div className="form-section-title">Depreciation Settings</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Useful Life (Months) *</label>
              <input className="form-control" type="number" min="1" value={formData.usefulLife} onChange={(e) => handleChange("usefulLife", e.target.value)} required placeholder={selectedCategory ? `Default: ${selectedCategory.defaultUsefulLife}` : ""} />
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
              <input className="form-control font-mono" type="number" step="0.01" min="0" value={formData.salvageValue} onChange={(e) => handleChange("salvageValue", e.target.value)} placeholder={selectedCategory ? `Default: ${selectedCategory.defaultSalvageValuePercent}% of cost` : "0.00"} />
            </div>
          </div>

          <div className="form-section-title">Additional Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input className="form-control" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g. Head Office - Floor 3" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Assigned To</label>
              <input className="form-control" value={formData.assignedTo} onChange={(e) => handleChange("assignedTo", e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Serial Number</label>
              <input className="form-control" value={formData.serialNumber} onChange={(e) => handleChange("serialNumber", e.target.value)} placeholder="e.g. SN-12345" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Vendor Name</label>
              <input className="form-control" value={formData.vendorName} onChange={(e) => handleChange("vendorName", e.target.value)} placeholder="e.g. TechConnect IT" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Invoice Number</label>
              <input className="form-control" value={formData.invoiceNumber} onChange={(e) => handleChange("invoiceNumber", e.target.value)} placeholder="e.g. INV-001" />
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Save Asset"}
            </button>
            <Link className="btn btn-outline-secondary" to="/assets">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateAssetPage;
