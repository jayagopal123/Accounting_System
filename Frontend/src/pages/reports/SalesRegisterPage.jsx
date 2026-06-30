import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getSalesRegister } from "../../services/financialReportApi";
import { getCustomers } from "../../services/customerApi";

function SalesRegisterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (customerId) params.customerId = customerId;
      const response = await getSalesRegister(params);
      setData(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, customerId]);

  useEffect(() => {
    getCustomers({ limit: 100 }).then((res) => {
      setCustomers(res.data.data.customers || res.data.data || []);
    }).catch(() => {});
    loadData();
  }, [loadData]);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Sales Register</h5>
            <p className="page-header-subtitle">Register of all sales invoices</p>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Customer</label>
            <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.customerName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={loadData}>Search</button>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status" />
          </div>
        ) : data ? (
          <>
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-end">Tax</th>
                    <th className="text-end">Grand Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">No sales invoices found for the selected period.</td></tr>
                  ) : data.invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td className="font-mono fw-semibold">{inv.invoiceNumber}</td>
                      <td className="text-muted">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td>{inv.customer?.customerName || "N/A"}</td>
                      <td className="text-end font-mono">{inv.subtotal.toFixed(2)}</td>
                      <td className="text-end font-mono">{inv.taxAmount.toFixed(2)}</td>
                      <td className="text-end font-mono fw-bold">{inv.grandTotal.toFixed(2)}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.invoices.length > 0 && (
              <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                <div style={{ minWidth: "280px" }}>
                  <div className="summary-row"><span className="summary-label">Total Invoices</span><span className="summary-value">{data.summary.totalInvoices}</span></div>
                  <div className="summary-row"><span className="summary-label">Total Subtotal</span><span className="summary-value">{data.summary.totalSubtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span className="summary-label">Total Tax</span><span className="summary-value">{data.summary.totalTax.toFixed(2)}</span></div>
                  <div className="summary-row total"><span className="summary-label">Grand Total</span><span className="summary-value">{data.summary.totalGrandTotal.toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default SalesRegisterPage;
