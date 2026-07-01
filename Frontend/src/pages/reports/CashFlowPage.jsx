import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getCashFlow,
  downloadReport,
} from "../../services/financialReportApi";
import { formatMoney } from "../../utils/formatMoney";

function CashFlowPage() {
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
      const response = await getCashFlow(params);
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
    downloadReport("cash-flow", format, params);
  };

  const SectionCard = ({ section, color, bgColor }) => (
    <div
      className="p-3 rounded mb-3"
      style={{ backgroundColor: bgColor, border: `1px solid ${color}` }}
    >
      <h6 className="fw-bold mb-3" style={{ color }}>
        {section.label}
      </h6>
      <table className="table table-premium align-middle mb-0">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {section.items.map((item, i) =>
            item.isHeader ? (
              <tr key={i}>
                <td
                  colSpan={2}
                  className="fw-semibold text-muted pt-3 pb-1"
                  style={{ fontSize: "0.75rem", textTransform: "uppercase" }}
                >
                  {item.label}
                </td>
              </tr>
            ) : (
              <tr key={i}>
                <td style={{ paddingLeft: item.isHeader ? 10 : 24 }}>
                  {item.label}
                </td>
                <td className="text-end font-mono fw-semibold">
                  {item.amount >= 0 ? "" : "("}
                  {formatMoney(Math.abs(item.amount), { noSymbol: true })}
                  {item.amount < 0 ? ")" : ""}
                </td>
              </tr>
            )
          )}
          <tr style={{ borderTop: `2px solid ${color}` }}>
            <td className="fw-bold" style={{ color }}>
              Net Cash from this Activity
            </td>
            <td className="text-end fw-bold font-mono" style={{ color }}>
              {section.total >= 0 ? "" : "("}
              {formatMoney(Math.abs(section.total), { noSymbol: true })}
              {section.total < 0 ? ")" : ""}
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
            <h5 className="page-header-title mb-1">Cash Flow Statement</h5>
            <p className="page-header-subtitle">
              Cash inflows and outflows from operating, investing, and financing
              activities
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
            <span className="text-muted small">Computing cash flow...</span>
          </div>
        ) : data ? (
          <>
            <SectionCard
              section={data.operatingActivities}
              color="#1e40af"
              bgColor="#eff6ff"
            />
            <SectionCard
              section={data.investingActivities}
              color="#854d0e"
              bgColor="#fefce8"
            />
            <SectionCard
              section={data.financingActivities}
              color="#166534"
              bgColor="#f0fdf4"
            />

            {/* Net Cash Flow */}
            <div
              className="p-4 rounded text-center"
              style={{
                backgroundColor:
                  data.netCashFlow >= 0 ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${
                  data.netCashFlow >= 0 ? "#22c55e" : "#ef4444"
                }`,
              }}
            >
              <h5 className="fw-bold mb-1 text-dark">Net Cash Flow</h5>
              <span
                className="font-mono"
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: data.netCashFlow >= 0 ? "#16a34a" : "#dc2626",
                }}
              >
                {data.netCashFlow >= 0 ? "+" : ""}
                {formatMoney(Math.abs(data.netCashFlow), { noSymbol: true })}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default CashFlowPage;
