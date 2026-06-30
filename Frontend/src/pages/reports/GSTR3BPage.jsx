import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getGSTR3B } from "../../services/gstrApi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";

function GSTR3BPage() {
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
      const res = await getGSTR3B({ startDate, endDate });
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

  const renderTaxRow = (label, cgst, sgst, igst, cess) => (
    <tr>
      <td className="fw-medium">{label}</td>
      <td className="font-mono text-end">{cgst.toFixed(2)}</td>
      <td className="font-mono text-end">{sgst.toFixed(2)}</td>
      <td className="font-mono text-end">{igst.toFixed(2)}</td>
      <td className="font-mono text-end">{cess.toFixed(2)}</td>
    </tr>
  );

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">GSTR-3B — Monthly Return</h5>
            <p className="page-header-subtitle">Summary of sales, purchases, and tax liability</p>
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
            {/* Sales Summary */}
            <div className="form-section-title">Outward Supplies (Sales)</div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Invoices</div>
                  <div className="fs-5 fw-bold">{report.salesSummary?.totalInvoices || 0}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Taxable Value</div>
                  <div className="fs-5 fw-bold font-mono">{(report.salesSummary?.taxableValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Output Tax</div>
                  <div className="fs-5 fw-bold font-mono">{(report.salesSummary?.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="form-section-title">Inward Supplies (Purchases)</div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Invoices</div>
                  <div className="fs-5 fw-bold">{report.purchaseSummary?.totalInvoices || 0}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Taxable Value</div>
                  <div className="fs-5 fw-bold font-mono">{(report.purchaseSummary?.taxableValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card p-3">
                  <div className="text-muted small">Input Tax Credit</div>
                  <div className="fs-5 fw-bold font-mono">{(report.purchaseSummary?.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Tax Breakdown Table */}
            <div className="form-section-title">Tax Liability Summary</div>
            <div className="table-responsive mb-4">
              <table className="table table-premium align-middle small">
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Description</th>
                    <th className="text-end">CGST</th>
                    <th className="text-end">SGST</th>
                    <th className="text-end">IGST</th>
                    <th className="text-end">CESS</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTaxRow(
                    "Output Tax (Sales)",
                    report.salesSummary?.outputTax?.cgst || 0,
                    report.salesSummary?.outputTax?.sgst || 0,
                    report.salesSummary?.outputTax?.igst || 0,
                    report.salesSummary?.outputTax?.cess || 0,
                  )}
                  {renderTaxRow(
                    "Input Tax Credit (Purchases)",
                    report.purchaseSummary?.inputTax?.cgst || 0,
                    report.purchaseSummary?.inputTax?.sgst || 0,
                    report.purchaseSummary?.inputTax?.igst || 0,
                    report.purchaseSummary?.inputTax?.cess || 0,
                  )}
                  <tr className="table-active fw-bold">
                    <td>Net Tax Payable</td>
                    <td className="font-mono text-end">{(report.netTaxLiability?.cgst || 0).toFixed(2)}</td>
                    <td className="font-mono text-end">{(report.netTaxLiability?.sgst || 0).toFixed(2)}</td>
                    <td className="font-mono text-end">{(report.netTaxLiability?.igst || 0).toFixed(2)}</td>
                    <td className="font-mono text-end">{(report.netTaxLiability?.cess || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="fw-bold" style={{ borderTop: "2px solid #dee2e6" }}>
                    <td>Total Net Tax Liability</td>
                    <td colSpan={4} className="font-mono text-end fs-6">{(report.netTaxLiability?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
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

export default GSTR3BPage;
