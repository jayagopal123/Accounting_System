import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAccounts } from "../../services/accountApi";
import {
  getGeneralLedger,
  downloadReport,
} from "../../services/financialReportApi";

function GeneralLedgerPage() {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (accountId) params.accountId = accountId;
      const response = await getGeneralLedger(params);
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
    const init = async () => {
      try {
        const acctRes = await getAccounts();
        setAccounts(acctRes.data.data || []);
      } catch {
        // non-critical
      }
      await loadData();
    };
    init();
  }, []);

  const handleExport = (format) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (accountId) params.accountId = accountId;
    downloadReport("general-ledger", format, params);
  };

  const entries = data?.entries || [];
  const totalPages = Math.max(1, Math.ceil(entries.length / perPage));
  const paginated = entries.slice((page - 1) * perPage, page * perPage);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">General Ledger</h5>
            <p className="page-header-subtitle">
              All posted journal entries with account-wise running balance
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
          <div className="col-auto">
            <label className="form-label">Account</label>
            <select
              className="form-select form-select-sm"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">All Accounts</option>
              {accounts
                .filter((a) => !a.isGroup)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.accountCode} - {a.accountName}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-auto d-flex gap-1">
            <button
              className="btn btn-sm btn-dark mt-2"
              onClick={() => {
                setPage(1);
                loadData();
              }}
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
            <span className="text-muted small">Loading ledger entries...</span>
          </div>
        ) : data ? (
          <>
            <div className="mb-3">
              <small className="text-muted">
                {data.summary.totalEntries} entries · Total Debits:{" "}
                <span className="fw-semibold font-mono">
                  {data.summary.totalDebits.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>{" "}
                · Total Credits:{" "}
                <span className="fw-semibold font-mono">
                  {data.summary.totalCredits.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </small>
            </div>

            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher</th>
                    <th>Account</th>
                    <th className="text-end">Debit</th>
                    <th className="text-end">Credit</th>
                    <th>Description</th>
                    <th className="text-end">Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No entries found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {entry.date
                            ? new Date(entry.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="font-mono fw-semibold">
                          {entry.voucherNumber}
                        </td>
                        <td>
                          <span className="text-muted font-mono small">
                            {entry.account.accountCode}
                          </span>{" "}
                          {entry.account.accountName}
                        </td>
                        <td className="text-end font-mono">
                          {entry.debit
                            ? entry.debit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td className="text-end font-mono">
                          {entry.credit
                            ? entry.credit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td
                          className="text-muted"
                          style={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {entry.description || "—"}
                        </td>
                        <td className="text-end font-mono fw-semibold">
                          {entry.runningBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="text-muted small font-mono">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default GeneralLedgerPage;
