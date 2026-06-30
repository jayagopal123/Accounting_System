import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBudgets, approveBudget, closeBudget } from "../../services/budgetApi";
import { BsFileText, BsCheckLg, BsXLg, BsBarChart } from "react-icons/bs";

function BudgetListPage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await getBudgets();
      setBudgets(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this budget?")) return;
    try {
      await approveBudget(id);
      await loadBudgets();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm("Close this budget?")) return;
    try {
      await closeBudget(id);
      await loadBudgets();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Budgets</h5>
            <p className="page-header-subtitle">Plan and track departmental budgets</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/budgets/new">
            <span>+</span> New Budget
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fiscal Year</th>
                <th>Cost Center</th>
                <th className="text-end">Total Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading budgets...</span>
                    </div>
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsFileText size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No budgets found</div>
                      <div className="text-muted small">Create a new budget to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                budgets.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-semibold">{b.name}</td>
                    <td className="text-muted">{b.fiscalYear?.yearName || "—"}</td>
                    <td className="text-muted">{b.costCenter?.name || "—"}</td>
                    <td className="font-mono fw-semibold text-end">
                      {b.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge-premium ${
                        b.status === "Draft" ? "badge-premium-draft" :
                        b.status === "Approved" ? "badge-premium-submitted" :
                        "badge-premium-cancelled"
                      }`}>{b.status}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => navigate(`/budgets/${b._id}/vs-actual`)}
                          title="Budget vs Actual"
                        >
                          <BsBarChart size={13} />
                        </button>
                        {b.status === "Draft" && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/budgets/${b._id}/edit`)}
                            title="Edit"
                          >
                            <BsFileText size={13} />
                          </button>
                        )}
                        {b.status === "Draft" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleApprove(b._id)}
                            title="Approve"
                          >
                            <BsCheckLg size={13} />
                          </button>
                        )}
                        {b.status !== "Closed" && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleClose(b._id)}
                            title="Close"
                          >
                            <BsXLg size={13} />
                          </button>
                        )}
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

export default BudgetListPage;
