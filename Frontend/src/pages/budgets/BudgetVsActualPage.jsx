import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBudgetVsActual } from "../../services/budgetApi";

function BudgetVsActualPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getBudgetVsActual(id);
        setReport(response.data.data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Budget vs Actual</h5>
            <p className="page-header-subtitle">
              {report ? `${report.budget.name} — ${report.budget.fiscalYear?.yearName || ""}` : "Loading..."}
            </p>
          </div>
          <Link className="btn btn-outline-secondary" to="/budgets">← Back to Budgets</Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status" />
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="page-card p-3 text-center" style={{ background: "#ffffff" }}>
                  <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Budgeted</div>
                  <div className="font-mono fw-bold" style={{ fontSize: "1.25rem", color: "#0f172a" }}>
                    {report.totals.budgeted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="page-card p-3 text-center" style={{ background: "#ffffff" }}>
                  <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Actual</div>
                  <div className="font-mono fw-bold" style={{ fontSize: "1.25rem", color: "#2563eb" }}>
                    {report.totals.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="page-card p-3 text-center" style={{ background: "#ffffff" }}>
                  <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Variance</div>
                  <div className={`font-mono fw-bold ${report.totals.variance >= 0 ? "text-success" : "text-danger"}`} style={{ fontSize: "1.25rem" }}>
                    {report.totals.variance >= 0 ? "+" : ""}
                    {report.totals.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Table */}
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th className="text-end">Budgeted</th>
                    <th className="text-end">Actual</th>
                    <th className="text-end">Variance</th>
                    <th className="text-end">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {report.lines.map((line, index) => (
                    <tr key={index}>
                      <td className="fw-medium">
                        {line.account?.accountCode} — {line.account?.accountName}
                      </td>
                      <td className="font-mono text-end">
                        {line.budgetedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-mono text-end">
                        {line.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`font-mono text-end fw-semibold ${line.variance >= 0 ? "text-success" : "text-danger"}`}>
                        {line.variance >= 0 ? "+" : ""}
                        {line.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`font-mono text-end ${parseFloat(line.variancePercentage) >= 0 ? "text-success" : "text-danger"}`}>
                        {line.variancePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="fw-bold">Total</td>
                    <td className="font-mono fw-bold text-end">{report.totals.budgeted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="font-mono fw-bold text-end">{report.totals.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`font-mono fw-bold text-end ${report.totals.variance >= 0 ? "text-success" : "text-danger"}`}>
                      {report.totals.variance >= 0 ? "+" : ""}
                      {report.totals.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default BudgetVsActualPage;
