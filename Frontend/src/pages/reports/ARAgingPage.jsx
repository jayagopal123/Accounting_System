import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getARAging } from "../../services/financialReportApi";

const BUCKET_ORDER = ["0-30", "31-60", "61-90", "91-plus"];

function ARAgingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getARAging();
      setData(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Accounts Receivable Aging</h5>
            <p className="page-header-subtitle">Outstanding customer invoices by age</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadData}>Refresh</button>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-secondary" role="status" /></div>
        ) : data ? (
          <>
            <div className="row g-3 mb-4">
              {BUCKET_ORDER.map((key) => {
                const bucket = data.buckets[key];
                const pct = data.totalOutstanding > 0 ? ((bucket.amount / data.totalOutstanding) * 100).toFixed(1) : 0;
                return (
                  <div className="col-md-3" key={key}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small mb-1">{bucket.label}</div>
                        <div className="fw-bold fs-5">{bucket.amount.toFixed(2)}</div>
                        <div className="text-muted small">{pct}% of total</div>
                        <div className="mt-2"><span className="badge bg-secondary">{bucket.invoices.length} invoices</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end mb-3">
              <div className="p-3 bg-light rounded" style={{ minWidth: "220px" }}>
                <div className="d-flex justify-content-between">
                  <strong>Total Outstanding:</strong>
                  <strong className="text-danger">{data.totalOutstanding.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {BUCKET_ORDER.map((key) => {
              const bucket = data.buckets[key];
              if (bucket.invoices.length === 0) return null;
              return (
                <div key={key} className="mb-4">
                  <h6 className="fw-bold mb-2">{bucket.label} <span className="text-muted fw-normal">({bucket.invoices.length} invoices, {bucket.amount.toFixed(2)})</span></h6>
                  <div className="table-responsive">
                    <table className="table table-premium align-middle small">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">Outstanding</th>
                          <th className="text-end">Age (Days)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bucket.invoices.map((inv, idx) => (
                          <tr key={idx}>
                            <td className="font-mono">{inv.invoiceNumber}</td>
                            <td>{inv.customerName}</td>
                            <td className="text-muted">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                            <td className="text-end font-mono">{inv.grandTotal.toFixed(2)}</td>
                            <td className="text-end font-mono text-danger fw-semibold">{inv.outstanding.toFixed(2)}</td>
                            <td className="text-end font-mono">{inv.ageDays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default ARAgingPage;
