import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getProfitAndLoss,
  downloadReport,
} from "../../services/financialReportApi";
import { formatMoney } from "../../utils/formatMoney";

function ProfitLossPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await getProfitAndLoss(params);
      setData(response.data.data);
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

  const handleExport = (format) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    downloadReport("profit-loss", format, params);
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Profit & Loss Statement</h5>
            <p className="page-header-subtitle">
              Summary of income and expenses for the selected period
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => handleExport("xlsx")}
            >
              Export Excel
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleExport("pdf")}
            >
              Export PDF
            </button>
          </div>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}

        <div className="row g-2 mb-4 align-items-end">
          <div className="col-auto">
            <label className="form-label">From</label>
            <input
              className="form-control form-control-sm"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 150 }}
            />
          </div>
          <div className="col-auto">
            <label className="form-label">To</label>
            <input
              className="form-control form-control-sm"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 150 }}
            />
          </div>
          <div className="col-auto d-flex gap-1">
            <button
              className="btn btn-sm btn-dark mt-2"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
            />
            <span className="text-muted small">Computing P&L...</span>
          </div>
        ) : data ? (
          <div className="row g-4">
            {/* Income Section */}
            <div className="col-md-6">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <h6 className="fw-bold mb-3" style={{ color: "#166534" }}>
                  {data.income.label}
                </h6>
                <table className="table table-premium align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.income.accounts.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No income accounts
                        </td>
                      </tr>
                    ) : (
                      data.income.accounts.map((acc, i) => (
                        <tr key={i}>
                          <td>
                            <span className="font-mono text-muted small">
                              {acc.accountCode}
                            </span>{" "}
                            {acc.accountName}
                          </td>
                          <td className="text-end font-mono fw-semibold">
                            {formatMoney(acc.balance, { noSymbol: true })}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr style={{ borderTop: "2px solid #166534" }}>
                      <td className="fw-bold" style={{ color: "#166534" }}>
                        Total {data.income.label}
                      </td>
                      <td className="text-end fw-bold font-mono" style={{ color: "#166534" }}>
                        {formatMoney(data.income.total, { noSymbol: true })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense Section */}
            <div className="col-md-6">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
              >
                <h6 className="fw-bold mb-3" style={{ color: "#991b1b" }}>
                  {data.expenses.label}
                </h6>
                <table className="table table-premium align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.accounts.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          No expense accounts
                        </td>
                      </tr>
                    ) : (
                      data.expenses.accounts.map((acc, i) => (
                        <tr key={i}>
                          <td>
                            <span className="font-mono text-muted small">
                              {acc.accountCode}
                            </span>{" "}
                            {acc.accountName}
                          </td>
                          <td className="text-end font-mono fw-semibold">
                            {formatMoney(acc.balance, { noSymbol: true })}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr style={{ borderTop: "2px solid #991b1b" }}>
                      <td className="fw-bold" style={{ color: "#991b1b" }}>
                        Total {data.expenses.label}
                      </td>
                      <td className="text-end fw-bold font-mono" style={{ color: "#991b1b" }}>
                        {formatMoney(data.expenses.total, { noSymbol: true })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Result */}
            <div className="col-12">
              <div
                className="p-4 rounded text-center"
                style={{
                  backgroundColor:
                    data.netProfit >= 0 ? "#f0fdf4" : "#fef2f2",
                  border: `2px solid ${
                    data.netProfit >= 0 ? "#22c55e" : "#ef4444"
                  }`,
                }}
              >
                <h5 className="fw-bold mb-1 text-dark">{data.netProfitLabel}</h5>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: data.netProfit >= 0 ? "#16a34a" : "#dc2626",
                  }}
                >
                  {data.netProfit >= 0 ? "+" : ""}
                  {formatMoney(Math.abs(data.netProfit), { noSymbol: true })}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default ProfitLossPage;
