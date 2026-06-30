import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCostCenters } from "../../services/costCenterApi";
import { BsBuilding, BsPencilSquare } from "react-icons/bs";

function CostCenterListPage() {
  const navigate = useNavigate();
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getCostCenters();
      setCostCenters(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Cost Centers</h5>
            <p className="page-header-subtitle">Manage departmental cost allocation centers</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/settings/cost-centers/new">
            <span>+</span> New Cost Center
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading cost centers...</span>
                    </div>
                  </td>
                </tr>
              ) : costCenters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsBuilding size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No cost centers found</div>
                      <div className="text-muted small">Create a new cost center to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                costCenters.map((cc) => (
                  <tr key={cc._id}>
                    <td className="fw-semibold font-mono">{cc.code}</td>
                    <td className="fw-medium">{cc.name}</td>
                    <td className="text-muted">{cc.description || "—"}</td>
                    <td>
                      <span className={`badge-premium ${cc.status === "Active" ? "badge-premium-active" : "badge-premium-blocked"}`}>
                        {cc.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/settings/cost-centers/${cc._id}/edit`)}
                        title="Edit"
                      >
                        <BsPencilSquare size={13} />
                      </button>
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

export default CostCenterListPage;
