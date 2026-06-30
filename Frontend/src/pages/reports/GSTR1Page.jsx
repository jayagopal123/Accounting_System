import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getGSTR1 } from "../../services/gstrApi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";

function GSTR1Page() {
  const today = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getGSTR1({ startDate, endDate });
      setReport(res.data.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">GSTR-1 — Outward Supplies</h5>
            <p className="page-header-subtitle">Summary of sales invoices by tax rate</p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <label className="form-label">From</label>
            <input className="form-control form-control-sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">To</label>
            <input className="form-control form-control-sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary btn-sm w-100" onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Generate"}
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Generating report...</span>
          </div>
        ) : report ? (
          <>
            {/* Summary cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="summary-card p-3">
                  <div className="text-muted small">Total Invoices</div>
                  <div className="fs-5 fw-bold">{report.totals?.totalInvoices || 0}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="summary-card p-3">
                  <div className="text-muted small">Taxable Value</div>
                  <div className="fs-5 fw-bold font-mono">{(report.totals?.totalTaxableValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="summary-card p-3">
                  <div className="text-muted small">Total Tax</div>
                  <div className="fs-5 fw-bold font-mono">{(report.totals?.totalTaxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="summary-card p-3">
                  <div className="text-muted small">Total Invoice Value</div>
                  <div className="fs-5 fw-bold font-mono">{(report.totals?.totalInvoiceValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Rate-wise breakdown */}
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Tax Type</th>
                    <th>Rate</th>
                    <th className="text-end">Taxable Value</th>
                    <th className="text-end">Tax Amount</th>
                    <th className="text-end">Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.summary || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-muted">No data for this period</td></tr>
                  ) : (report.summary || []).map((s, i) => (
                    <tr key={i}>
                      <td><span className="badge-premium badge-premium-submitted">{s.taxType}</span></td>
                      <td className="font-mono fw-semibold">{s.rate}%</td>
                      <td className="font-mono text-end">{s.taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="font-mono text-end">{s.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-end">{s.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice detail */}
            {report.invoices?.length > 0 && (
              <>
                <div className="form-section-title mt-4">Invoice Details</div>
                <div className="table-responsive">
                  <table className="table table-premium align-middle small">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th className="text-end">Subtotal</th>
                        <th className="text-end">Tax</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.invoices.map((inv) => (
                        <tr key={inv._id}>
                          <td className="font-mono fw-semibold">{inv.invoiceNumber}</td>
                          <td className="text-muted">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                          <td>{inv.customer?.customerName || "-"}</td>
                          <td className="font-mono text-end">{Number(inv.subtotal).toFixed(2)}</td>
                          <td className="font-mono text-end">{Number(inv.taxAmount).toFixed(2)}</td>
                          <td className="font-mono fw-semibold text-end">{Number(inv.grandTotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="d-flex flex-column align-items-center gap-2 py-5">
            <div className="empty-state-icon"><BsFileEarmarkBarGraph size={18} /></div>
            <div className="text-muted small">Select a period and generate the report</div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default GSTR1Page;
