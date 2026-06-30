import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAssets, activateAsset, disposeAsset, runDepreciation, runBulkDepreciation } from "../../services/assetApi";
import { BsBox, BsCheckLg, BsPlusLg, BsXLg, BsLightning } from "react-icons/bs";

function AssetListPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [disposeModal, setDisposeModal] = useState(null);
  const [disposeForm, setDisposeForm] = useState({ disposalAmount: "0", disposalRemarks: "" });

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await getAssets();
      setAssets(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = statusFilter
    ? assets.filter((a) => a.status === statusFilter)
    : assets;

  const handleActivate = async (id) => {
    try {
      await activateAsset(id);
      await loadAssets();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDispose = async (id) => {
    setDisposeModal(id);
    setDisposeForm({ disposalAmount: "0", disposalRemarks: "" });
  };

  const confirmDispose = async () => {
    try {
      await disposeAsset(disposeModal, {
        disposalAmount: Number(disposeForm.disposalAmount) || 0,
        disposalRemarks: disposeForm.disposalRemarks,
      });
      setDisposeModal(null);
      await loadAssets();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDepreciate = async (id) => {
    try {
      await runDepreciation(id);
      await loadAssets();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleBulkDepreciation = async () => {
    try {
      setBulkProcessing(true);
      await runBulkDepreciation();
      await loadAssets();
    } catch (err) {
      setError(String(err));
    } finally {
      setBulkProcessing(false);
    }
  };

  const formatCurrency = (amount) =>
    amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00";

  const getStatusBadge = (status) => {
    const map = {
      Draft: "badge-premium-draft",
      Active: "badge-premium-submitted",
      Depreciated: "badge-premium-active",
      Disposed: "badge-premium-cancelled",
      Sold: "badge-premium-cancelled",
      WrittenOff: "badge-premium-cancelled",
    };
    return `badge-premium ${map[status] || "badge-premium-draft"}`;
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Fixed Assets</h5>
            <p className="page-header-subtitle">Manage fixed assets, depreciation, and disposals</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={handleBulkDepreciation} disabled={bulkProcessing}>
              <BsLightning size={13} /> {bulkProcessing ? "Running..." : "Run Depreciation"}
            </button>
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/assets/new">
              <BsPlusLg size={13} /> New Asset
            </Link>
          </div>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Depreciated">Depreciated</option>
              <option value="Disposed">Disposed</option>
              <option value="Sold">Sold</option>
              <option value="WrittenOff">Written Off</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Date</th>
                <th className="text-end">Cost</th>
                <th className="text-end">Current Value</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading assets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsBox size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No assets found</div>
                      <div className="text-muted small">Create a new fixed asset to start tracking.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td className="font-mono fw-semibold">
                      <Link to={`/assets/${asset._id}`} className="text-decoration-none">{asset.assetCode}</Link>
                    </td>
                    <td className="fw-medium">{asset.assetName}</td>
                    <td className="text-muted">{asset.category?.categoryName || "—"}</td>
                    <td className="text-muted font-mono" style={{ fontSize: "0.8rem" }}>
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="text-end font-mono">{formatCurrency(asset.purchaseCost)}</td>
                    <td className="text-end font-mono fw-semibold">{formatCurrency(asset.currentValue)}</td>
                    <td>
                      <span className={getStatusBadge(asset.status)}>{asset.status}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {asset.status === "Draft" ? (
                          <>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/assets/${asset._id}/edit`)} title="Edit">
                              <BsBox size={13} />
                            </button>
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleActivate(asset._id)} title="Activate">
                              <BsCheckLg size={13} />
                            </button>
                          </>
                        ) : null}
                        {asset.status === "Active" ? (
                          <>
                            <button className="btn btn-sm btn-outline-info" onClick={() => handleDepreciate(asset._id)} title="Run Depreciation">
                              <BsLightning size={13} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDispose(asset._id)} title="Dispose">
                              <BsXLg size={13} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispose Modal */}
      {disposeModal && (
        <div className="modal-backdrop fade show" onClick={() => setDisposeModal(null)}>
          <div className="modal d-block" tabIndex="-1" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title fw-semibold">Dispose Asset</h6>
                  <button type="button" className="btn-close" onClick={() => setDisposeModal(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Disposal Amount</label>
                      <input className="form-control font-mono" type="number" step="0.01" min="0" value={disposeForm.disposalAmount}
                        onChange={(e) => setDisposeForm((p) => ({ ...p, disposalAmount: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Remarks</label>
                      <textarea className="form-control" rows="2" value={disposeForm.disposalRemarks}
                        onChange={(e) => setDisposeForm((p) => ({ ...p, disposalRemarks: e.target.value }))} placeholder="Reason for disposal..." />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={() => setDisposeModal(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDispose}>Confirm Disposal</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AssetListPage;
