import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getVendorStatement } from "../../services/financialReportApi";
import { getSuppliers } from "../../services/supplierApi";

function VendorStatementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    getSuppliers({ limit: 100 }).then((res) => {
      setSuppliers(res.data.data.suppliers || res.data.data || []);
    }).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!supplierId) { setError("Please select a supplier"); return; }
    try {
      setLoading(true);
      const params = { supplierId, startDate, endDate };
      const response = await getVendorStatement(params);
      setData(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  }, [supplierId, startDate, endDate]);

  const selectedSupplier = suppliers.find((s) => s._id === supplierId);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Vendor Statement</h5>
            <p className="page-header-subtitle">Transaction statement for a supplier/vendor</p>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <label className="form-label">Supplier</label>
            <select className="form-select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.supplierName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={loadData}>Generate Statement</button>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-secondary" role="status" /></div>
        ) : data ? (
          <>
            {selectedSupplier && (
              <div className="mb-3 p-3 bg-light rounded small">
                <strong>Supplier:</strong> {selectedSupplier.supplierName} ({selectedSupplier.supplierCode})
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th className="text-end">Debit</th>
                    <th className="text-end">Credit</th>
                    <th className="text-end">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">No transactions found.</td></tr>
                  ) : data.transactions.map((txn, idx) => (
                    <tr key={idx}>
                      <td className="text-muted">{new Date(txn.date).toLocaleDateString()}</td>
                      <td><span className={`badge ${txn.type === "Invoice" ? "bg-primary bg-opacity-10 text-primary" : txn.type === "Payment" ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"}`}>{txn.type}</span></td>
                      <td className="font-mono">{txn.reference}</td>
                      <td className="text-end font-mono">{txn.debit > 0 ? txn.debit.toFixed(2) : "-"}</td>
                      <td className="text-end font-mono">{txn.credit > 0 ? txn.credit.toFixed(2) : "-"}</td>
                      <td className={`text-end font-mono fw-bold ${txn.balance > 0 ? "text-danger" : "text-success"}`}>{txn.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-3 pt-3 border-top">
              <div style={{ minWidth: "280px" }}>
                <div className="summary-row"><span className="summary-label">Total Invoiced</span><span className="summary-value">{data.summary.totalInvoiced.toFixed(2)}</span></div>
                <div className="summary-row"><span className="summary-label">Total Paid</span><span className="summary-value">{data.summary.totalPaid.toFixed(2)}</span></div>
                <div className="summary-row"><span className="summary-label">Total Debited</span><span className="summary-value">{data.summary.totalDebited.toFixed(2)}</span></div>
                <div className="summary-row total"><span className="summary-label">Outstanding</span><span className="summary-value">{data.summary.outstandingBalance.toFixed(2)}</span></div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default VendorStatementPage;
