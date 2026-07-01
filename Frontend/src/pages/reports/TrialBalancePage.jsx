import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";import {
  getTrialBalance,
  downloadReport,
} from "../../services/financialReportApi";
import { formatMoney } from "../../utils/formatMoney";


function TrialBalancePage() {
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
      const response = await getTrialBalance(params);
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
    downloadReport("trial-balance", format, params);
  };

  const toggleRow = (id) => {
    setData((prev) => {
      if (!prev) return prev;
      const newRows = prev.rows.map((r) => {
        if (r._id === id) {
          return { ...r, expanded: !r.expanded };
        }
        return r;
      });
      return { ...prev, rows: newRows };
    });
  };

  const getLevelPadding = (level) => `${(level || 0) * 20}px`;

  return (
    <MainLayout>
      <div className="page-card p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Trial Balance</h5>
            <p className="page-header-subtitle">
              List of all ledger accounts with debit and credit balances
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

        {/* Filters */}
        <div className="row g-2 mb-4 align-items-end">
          <div className="col-auto">
            <label className="form-label">From</label>
            <input
              className="form-control form-control-sm"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 160 }}
            />
          </div>
          <div className="col-auto">
            <label className="form-label">To</label>
            <input
              className="form-control form-control-sm"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 160 }}
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
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setTimeout(loadData, 0);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
            />
            <span className="text-muted small">Computing trial balance...</span>
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="row g-2 mb-3">
              <div className="col-auto">
                <div
                  className="px-3 py-2 rounded"
                  style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <small className="text-muted d-block">Total Debits</small>
                  <strong className="font-mono">
                    {formatMoney(data.totals.totalDebit)}
                  </strong>
                </div>
              </div>
              <div className="col-auto">
                <div
                  className="px-3 py-2 rounded"
                  style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <small className="text-muted d-block">Total Credits</small>
                  <strong className="font-mono">
                    {formatMoney(data.totals.totalCredit)}
                  </strong>
                </div>
              </div>
              <div className="col-auto">
                <div
                  className="px-3 py-2 rounded"
                  style={{
                    backgroundColor: data.totals.isBalanced
                      ? "#ecfdf5"
                      : "#fef2f2",
                    border: `1px solid ${
                      data.totals.isBalanced ? "#a7f3d0" : "#fecaca"
                    }`,
                  }}
                >
                  <small className="text-muted d-block">Status</small>
                  <strong
                    className={data.totals.isBalanced ? "text-success" : "text-danger"}
                  >
                    {data.totals.isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}></th>
                    <th style={{ width: "12%" }}>Code</th>
                    <th style={{ width: "33%" }}>Account Name</th>
                    <th style={{ width: "10%" }}>Type</th>
                    <th className="text-end" style={{ width: "15%" }}>
                      Total Debit
                    </th>
                    <th className="text-end" style={{ width: "15%" }}>
                      Total Credit
                    </th>
                    <th className="text-end" style={{ width: "10%" }}>
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr
                      key={row._id}
                      style={{
                        backgroundColor: row.isGroup ? "#f8fafc" : "transparent",
                        fontWeight: row.isGroup ? 600 : 400,
                      }}
                    >
                      <td>
                        {row.children && row.children.length > 0 ? (
                          <button
                            className="btn btn-sm p-0 border-0"
                            onClick={() => toggleRow(row._id)}
                            style={{ fontSize: "0.7rem", width: 20 }}
                          >
                            {row.expanded ? "▼" : "▶"}
                          </button>
                        ) : null}
                      </td>
                      <td className="font-mono">{row.accountCode}</td>
                      <td style={{ paddingLeft: getLevelPadding(row.depth) }}>
                        {row.accountName}
                      </td>
                      <td>
                        <span
                          className="badge-premium"
                          style={{
                            backgroundColor:
                              row.accountType === "ASSET"
                                ? "#dbeafe"
                                : row.accountType === "LIABILITY"
                                  ? "#fef9c3"
                                  : row.accountType === "EQUITY"
                                    ? "#e2f5ea"
                                    : row.accountType === "INCOME"
                                      ? "#e0f2fe"
                                      : "#ffe4e6",
                            color:
                              row.accountType === "ASSET"
                                ? "#1e40af"
                                : row.accountType === "LIABILITY"
                                  ? "#854d0e"
                                  : row.accountType === "EQUITY"
                                    ? "#047857"
                                    : row.accountType === "INCOME"
                                      ? "#0369a1"
                                      : "#991b1b",
                          }}
                        >
                          {row.accountType}
                        </span>
                      </td>
                      <td className="text-end font-mono">
                        {row.totalDebit
                          ? formatMoney(row.totalDebit, { noSymbol: true })
                          : "—"}
                      </td>
                      <td className="text-end font-mono">
                        {row.totalCredit
                          ? formatMoney(row.totalCredit, { noSymbol: true })
                          : "—"}
                      </td>
                      <td
                        className={`text-end font-mono fw-semibold ${
                          row.balance < 0 ? "text-danger" : ""
                        }`}
                      >
                        {row.balance
                          ? formatMoney(Math.abs(row.balance), { noSymbol: true })
                          : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default TrialBalancePage;
