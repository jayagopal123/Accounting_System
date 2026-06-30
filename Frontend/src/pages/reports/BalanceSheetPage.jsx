import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getBalanceSheet,
  downloadReport,
} from "../../services/financialReportApi";

function BalanceSheetPage() {
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
      const response = await getBalanceSheet(params);
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
    downloadReport("balance-sheet", format, params);
  };

  const SectionTable = ({ title, accounts, total, color, bgColor }) => (
    <div
      className="p-3 rounded h-100"
      style={{ backgroundColor: bgColor, border: `1px solid ${color}` }}
    >
      <h6 className="fw-bold mb-3" style={{ color }}>
        {title}
      </h6>
      <table className="table table-premium align-middle mb-0">
        <thead>
          <tr>
            <th>Account</th>
            <th className="text-end">Balance</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center text-muted py-3">
                No accounts
              </td>
            </tr>
          ) : (
            accounts.map((acc, i) => (
              <tr key={i}>
                <td>
                  <span className="font-mono text-muted small">
                    {acc.accountCode}
                  </span>{" "}
                  {acc.accountName}
                </td>
                <td className="text-end font-mono fw-semibold">
                  {Math.abs(acc.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))
          )}
          <tr style={{ borderTop: `2px solid ${color}` }}>
            <td className="fw-bold" style={{ color }}>
              Total {title}
            </td>
            <td
              className="text-end fw-bold font-mono"
              style={{ color }}
            >
              {Math.abs(total).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Balance Sheet</h5>
            <p className="page-header-subtitle">
              Financial position — Assets = Liabilities + Equity
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
            <label className="form-label">As of Date</label>
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
            <span className="text-muted small">Computing balance sheet...</span>
          </div>
        ) : data ? (
          <>
            {/* Balance Verification */}
            <div
              className="px-4 py-2 rounded mb-4 d-flex align-items-center gap-3"
              style={{
                backgroundColor: data.totals.isBalanced
                  ? "#ecfdf5"
                  : "#fef2f2",
                border: `1px solid ${
                  data.totals.isBalanced ? "#a7f3d0" : "#fecaca"
                }`,
              }}
            >
              <span
                className="font-mono fw-bold"
                style={{
                  fontSize: "1.1rem",
                  color: data.totals.isBalanced ? "#059669" : "#dc2626",
                }}
              >
                {data.totals.isBalanced ? "✓ BALANCED" : "✗ NOT BALANCED"}
              </span>
              <span className="text-muted small">
                Assets ({data.totals.totalAssets.toLocaleString(undefined, {minimumFractionDigits: 2})})
                {" = "}
                Liabilities ({data.totals.totalLiabilities.toLocaleString(undefined, {minimumFractionDigits: 2})})
                {" + "}
                Equity ({data.totals.totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2})})
              </span>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <SectionTable
                  title="Assets"
                  accounts={data.assets.accounts}
                  total={data.assets.total}
                  color="#1e40af"
                  bgColor="#eff6ff"
                />
              </div>
              <div className="col-md-4">
                <SectionTable
                  title="Liabilities"
                  accounts={data.liabilities.accounts}
                  total={data.liabilities.total}
                  color="#854d0e"
                  bgColor="#fefce8"
                />
              </div>
              <div className="col-md-4">
                <SectionTable
                  title="Equity"
                  accounts={data.equity.accounts}
                  total={data.equity.total}
                  color="#166534"
                  bgColor="#f0fdf4"
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default BalanceSheetPage;
