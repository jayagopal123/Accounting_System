import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getNumberingSeries } from "../../services/numberingSeriesApi";
import { BsHash, BsPencilSquare } from "react-icons/bs";

function NumberingSeriesListPage() {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSeries = async () => {
    try {
      setLoading(true);
      const response = await getNumberingSeries();
      setSeries(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Numbering Series</h5>
            <p className="page-header-subtitle">Configure automatic document numbering for all modules</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/settings/numbering-series/new">
            <span>+</span> New Series
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Prefix</th>
                <th>Starting No.</th>
                <th>Current No.</th>
                <th>Pad Length</th>
                <th>Sample</th>
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
                      <span className="text-muted small">Loading numbering series...</span>
                    </div>
                  </td>
                </tr>
              ) : series.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsHash size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No numbering series configured</div>
                      <div className="text-muted small">Create a numbering series to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                series.map((s) => {
                  const sampleNum = s.currentNumber || s.startingNumber;
                  return (
                    <tr key={s._id}>
                      <td className="fw-semibold">{s.documentType}</td>
                      <td className="font-mono fw-medium">{s.prefix}</td>
                      <td className="font-mono text-muted">{s.startingNumber}</td>
                      <td className="font-mono fw-semibold">{s.currentNumber}</td>
                      <td className="font-mono">{s.padLength}</td>
                      <td className="font-mono text-muted">
                        {`${s.prefix}-${String(sampleNum || 1).padStart(s.padLength, "0")}`}
                      </td>
                      <td>
                        <span className={`badge-premium ${s.isActive ? "badge-premium-active" : "badge-premium-blocked"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/settings/numbering-series/${s._id}/edit`)}
                          title="Edit"
                        >
                          <BsPencilSquare size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default NumberingSeriesListPage;
