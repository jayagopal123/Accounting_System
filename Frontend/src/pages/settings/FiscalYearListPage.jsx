import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getFiscalYears, closeFiscalYear } from "../../services/fiscalYearApi";
import { BsCalendarDate, BsCheckLg, BsPlusLg } from "react-icons/bs";

function FiscalYearListPage() {
  const navigate = useNavigate();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiscalYears = async () => {
    try {
      setLoading(true);
      const response = await getFiscalYears();
      setFiscalYears(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiscalYears();
  }, []);

  const handleClose = async (id) => {
    if (!window.confirm("Close this fiscal year? This action cannot be undone.")) return;
    try {
      await closeFiscalYear(id);
      await loadFiscalYears();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Fiscal Years</h5>
            <p className="page-header-subtitle">Manage accounting periods and financial years</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/settings/fiscal-years/new">
            <BsPlusLg size={13} /> New Fiscal Year
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Year Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Default</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading fiscal years...</span>
                    </div>
                  </td>
                </tr>
              ) : fiscalYears.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsCalendarDate size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No fiscal years found</div>
                      <div className="text-muted small">Create a new fiscal year to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                fiscalYears.map((fy) => (
                  <tr key={fy._id}>
                    <td className="fw-semibold">{fy.yearName}</td>
                    <td className="text-muted font-mono">{new Date(fy.startDate).toLocaleDateString()}</td>
                    <td className="text-muted font-mono">{new Date(fy.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-premium ${fy.status === "Active" ? "badge-premium-active" : "badge-premium-cancelled"}`}>
                        {fy.status}
                      </span>
                    </td>
                    <td>{fy.isDefault ? <BsCheckLg className="text-success" /> : "—"}</td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/settings/fiscal-years/${fy._id}/edit`)}
                          title="Edit"
                        >
                          <BsCalendarDate size={13} />
                        </button>
                        {fy.status === "Active" ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleClose(fy._id)}
                            title="Close Fiscal Year"
                          >
                            <BsCheckLg size={13} />
                          </button>
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
    </MainLayout>
  );
}

export default FiscalYearListPage;
