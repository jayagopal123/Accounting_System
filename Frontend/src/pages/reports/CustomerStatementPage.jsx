import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerStatement } from "../../services/financialReportApi";
import { getCustomers } from "../../services/customerApi";

function CustomerStatementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    getCustomers({ limit: 100 }).then((res) => {
      setCustomers(res.data.data.customers || res.data.data || []);
    }).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!customerId) { setError("Please select a customer"); return; }
    try {
      setLoading(true);
      const params = { customerId, startDate, endDate };
      const response = await getCustomerStatement(params);
      setData(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  }, [customerId, startDate, endDate]);

  const selectedCustomer = customers.find((c) => c._id === customerId);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Customer Statement</h5>
            <p className="page-header-subtitle">Transaction statement for a customer</p>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <label className="form-label">Customer</label>
            <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.customerName}</option>
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
            {selectedCustomer && (
              <div className="mb-3 p-3 bg-light rounded small">
                <strong>Customer:</strong> {selectedCustomer.customerName} ({selectedCustomer.customerCode})
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
                      <td><span className={`badge ${txn.type === "Invoice" ? "bg-primary bg-opacity-10 text-primary" : "bg-success bg-opacity-10 text-success"}`}>{txn.type}</span></td>
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
                <div className="summary-row"><span className="summary-label">Total Credited</span><span className="summary-value">{data.summary.totalCredited.toFixed(2)}</span></div>
                <div className="summary-row total"><span className="summary-label">Outstanding</span><span className="summary-value">{data.summary.outstandingBalance.toFixed(2)}</span></div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default CustomerStatementPage;
