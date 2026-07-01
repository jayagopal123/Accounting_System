import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAssetById, activateAsset, disposeAsset, runDepreciation } from "../../services/assetApi";
import { BsArrowLeft, BsCheckLg, BsLightning, BsXLg } from "react-icons/bs";
import { formatMoney } from "../../utils/formatMoney";

function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDispose, setShowDispose] = useState(false);
  const [disposeForm, setDisposeForm] = useState({ disposalAmount: "0", disposalRemarks: "" });

  const loadAsset = async () => {
    try {
      setLoading(true);
      const response = await getAssetById(id);
      setAsset(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsset();
  }, [id]);

  const handleActivate = async () => {
    try {
      setActionLoading(true);
      await activateAsset(id);
      await loadAsset();
    } catch (err) {
      setError(String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDepreciate = async () => {
    try {
      setActionLoading(true);
      await runDepreciation(id);
      await loadAsset();
    } catch (err) {
      setError(String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispose = async () => {
    try {
      setActionLoading(true);
      await disposeAsset(id, {
        disposalAmount: Number(disposeForm.disposalAmount) || 0,
        disposalRemarks: disposeForm.disposalRemarks,
      });
      setShowDispose(false);
      await loadAsset();
    } catch (err) {
      setError(String(err));
    } finally {
      setActionLoading(false);
    }
  };

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

  if (loading) {
    return (
      <MainLayout>
        <div className="page-card p-4"><div className="text-center py-5"><div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} /></div></div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <div className="page-card p-4">
          <div className="alert alert-danger">Asset not found.</div>
          <Link className="btn btn-outline-secondary" to="/assets">← Back to Assets</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-1">
              <Link to="/assets" className="text-decoration-none text-muted"><BsArrowLeft size={18} /></Link>
              <h5 className="page-header-title mb-0">{asset.assetName}</h5>
              <span className={getStatusBadge(asset.status)}>{asset.status}</span>
            </div>
            <p className="page-header-subtitle ms-4 ps-1">{asset.assetCode}</p>
          </div>
          <div className="d-flex gap-2">
            {asset.status === "Draft" && (
              <>
                <button className="btn btn-outline-secondary" onClick={() => navigate(`/assets/${id}/edit`)}>Edit</button>
                <button className="btn btn-success" onClick={handleActivate} disabled={actionLoading}>
                  <BsCheckLg size={13} className="me-1" /> Activate
                </button>
              </>
            )}
            {asset.status === "Active" && (
              <>
                <button className="btn btn-info text-white" onClick={handleDepreciate} disabled={actionLoading}>
                  <BsLightning size={13} className="me-1" /> Depreciate
                </button>
                <button className="btn btn-danger" onClick={() => setShowDispose(true)} disabled={actionLoading}>
                  <BsXLg size={13} className="me-1" /> Dispose
                </button>
              </>
            )}
          </div>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="row g-4">
          {/* Financial Summary Cards */}
          <div className="col-md-3">
            <div className="card border">
              <div className="card-body text-center py-3">
                <div className="text-muted small mb-1">Purchase Cost</div>
                <div className="fw-bold fs-5">{formatMoney(asset.purchaseCost, { noSymbol: true })}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border">
              <div className="card-body text-center py-3">
                <div className="text-muted small mb-1">Current Value</div>
                <div className="fw-bold fs-5 text-success">{formatMoney(asset.currentValue, { noSymbol: true })}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border">
              <div className="card-body text-center py-3">
                <div className="text-muted small mb-1">Accumulated Depreciation</div>
                <div className="fw-bold fs-5 text-warning">{formatMoney(asset.accumulatedDepreciation, { noSymbol: true })}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border">
              <div className="card-body text-center py-3">
                <div className="text-muted small mb-1">Depreciation %</div>
                <div className="fw-bold fs-5">
                  {asset.purchaseCost > 0
                    ? ((asset.accumulatedDepreciation / asset.purchaseCost) * 100).toFixed(1)
                    : "0.0"}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <div className="card border">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Asset Details</h6>
                <div className="detail-grid">
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Category</div>
                    <div className="col-7 fw-medium">{asset.category?.categoryName || "—"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Purchase Date</div>
                    <div className="col-7">{new Date(asset.purchaseDate).toLocaleDateString()}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Useful Life</div>
                    <div className="col-7">{asset.usefulLife} months ({Math.round(asset.usefulLife / 12)} years)</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Depreciation Method</div>
                    <div className="col-7">
                      {asset.depreciationMethod === "StraightLine" ? "Straight Line" :
                       asset.depreciationMethod === "WrittenDownValue" ? "WDV" :
                       asset.depreciationMethod === "SumOfYearsDigits" ? "Sum of Years" : "None"}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Salvage Value</div>
                    <div className="col-7">{formatMoney(asset.salvageValue, { noSymbol: true })}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Last Depreciation</div>
                    <div className="col-7">{asset.lastDepreciationDate ? new Date(asset.lastDepreciationDate).toLocaleDateString() : "Not yet"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Assignment & Vendor</h6>
                <div className="detail-grid">
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Location</div>
                    <div className="col-7">{asset.location || "—"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Assigned To</div>
                    <div className="col-7">{asset.assignedTo || "—"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Serial Number</div>
                    <div className="col-7 font-mono">{asset.serialNumber || "—"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Vendor Name</div>
                    <div className="col-7">{asset.vendorName || "—"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted small">Invoice Number</div>
                    <div className="col-7 font-mono">{asset.invoiceNumber || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {asset.description && (
            <div className="col-12">
              <div className="card border">
                <div className="card-body">
                  <h6 className="fw-semibold mb-2">Description</h6>
                  <p className="text-muted mb-0">{asset.description}</p>
                </div>
              </div>
            </div>
          )}

          {asset.status === "Disposed" && (
            <div className="col-12">
              <div className="card border border-danger">
                <div className="card-body">
                  <h6 className="fw-semibold text-danger mb-2">Disposal Information</h6>
                  <div className="row mb-1">
                    <div className="col-2 text-muted small">Disposal Date</div>
                    <div className="col-4">{asset.disposalDate ? new Date(asset.disposalDate).toLocaleDateString() : "—"}</div>
                    <div className="col-2 text-muted small">Disposal Amount</div>
                    <div className="col-4 font-mono">{formatMoney(asset.disposalAmount, { noSymbol: true })}</div>
                  </div>
                  {asset.disposalRemarks && (
                    <div className="row">
                      <div className="col-2 text-muted small">Remarks</div>
                      <div className="col-10">{asset.disposalRemarks}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispose Modal */}
      {showDispose && (
        <div className="modal-backdrop fade show" onClick={() => setShowDispose(false)}>
          <div className="modal d-block" tabIndex="-1" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title fw-semibold">Dispose Asset</h6>
                  <button type="button" className="btn-close" onClick={() => setShowDispose(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Current Value: <strong>{formatMoney(asset.currentValue, { noSymbol: true })}</strong> |
                    Accumulated Depreciation: <strong>{formatMoney(asset.accumulatedDepreciation, { noSymbol: true })}</strong>
                  </p>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Disposal / Sale Amount</label>
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
                  <button className="btn btn-outline-secondary" onClick={() => setShowDispose(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDispose} disabled={actionLoading}>
                    {actionLoading ? "Processing..." : "Confirm Disposal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AssetDetailPage;
