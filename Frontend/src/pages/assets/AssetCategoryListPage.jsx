import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAssetCategories, toggleAssetCategoryStatus } from "../../services/assetCategoryApi";
import { BsBox, BsPlusLg, BsToggleOn, BsToggleOff } from "react-icons/bs";

function AssetCategoryListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getAssetCategories();
      setCategories(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await toggleAssetCategoryStatus(id);
      await loadCategories();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Asset Categories</h5>
            <p className="page-header-subtitle">
              Manage asset categories with depreciation rules
            </p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/settings/asset-categories/new">
            <BsPlusLg size={13} /> New Category
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Category Name</th>
                <th>Useful Life (Months)</th>
                <th>Depreciation Method</th>
                <th>Salvage Value %</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsBox size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No asset categories found</div>
                      <div className="text-muted small">Create a new asset category to define depreciation rules.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td className="font-mono fw-semibold">{cat.categoryCode}</td>
                    <td>{cat.categoryName}</td>
                    <td>{cat.defaultUsefulLife}</td>
                    <td>
                      <span className="badge-premium badge-premium-active">
                        {cat.defaultDepreciationMethod === "StraightLine" ? "Straight Line" :
                         cat.defaultDepreciationMethod === "WrittenDownValue" ? "WDV" :
                         cat.defaultDepreciationMethod === "SumOfYearsDigits" ? "Sum of Years" : "None"}
                      </span>
                    </td>
                    <td>{cat.defaultSalvageValuePercent}%</td>
                    <td>
                      <span className={`badge-premium ${cat.isActive ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/settings/asset-categories/${cat._id}/edit`)} title="Edit">
                          <BsBox size={13} />
                        </button>
                        <button className={`btn btn-sm ${cat.isActive ? "btn-outline-warning" : "btn-outline-success"}`} onClick={() => handleToggleStatus(cat._id)} title={cat.isActive ? "Deactivate" : "Activate"}>
                          {cat.isActive ? <BsToggleOn size={13} /> : <BsToggleOff size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default AssetCategoryListPage;
