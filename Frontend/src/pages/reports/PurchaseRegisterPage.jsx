import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getPurchaseRegister } from "../../services/financialReportApi";
import { getSuppliers } from "../../services/supplierApi";
import { formatMoney } from "../../utils/formatMoney";

function PurchaseRegisterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (supplierId) params.supplierId = supplierId;
      const response = await getPurchaseRegister(params);
      setData(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, supplierId]);

  useEffect(() => {
    getSuppliers({ limit: 100 }).then((res) => {
      setSuppliers(res.data.data.suppliers || res.data.data || []);
    }).catch(() => {});
    loadData();
  }, [loadData]);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Purchase Register</h5>
            <p className="page-header-subtitle">Register of all purchase invoices</p>
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
            <label className="form-label">Supplier</label>
            <select className="form-select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.supplierName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={loadData}>Search</button>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-secondary" role="status" /></div>
        ) : data ? (
          <>
            <div className="table-responsive">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-end">Tax</th>
                    <th className="text-end">Grand Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">No purchase invoices found for the selected period.</td></tr>
                  ) : data.invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td className="font-mono fw-semibold">{inv.invoiceNumber}</td>
                      <td className="text-muted">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td>{inv.supplier?.supplierName || "N/A"}</td>
                      <td className="text-end font-mono">{formatMoney(inv.subtotal, { noSymbol: true })}</td>
                      <td className="text-end font-mono">{formatMoney(inv.taxAmount, { noSymbol: true })}</td>
                      <td className="text-end font-mono fw-bold">{formatMoney(inv.grandTotal, { noSymbol: true })}</td>
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
                  <div className="summary-row"><span className="summary-label">Total Subtotal</span><span className="summary-value">{formatMoney(data.summary.totalSubtotal, { noSymbol: true })}</span></div>
                  <div className="summary-row"><span className="summary-label">Total Tax</span><span className="summary-value">{formatMoney(data.summary.totalTax, { noSymbol: true })}</span></div>
                  <div className="summary-row total"><span className="summary-label">Grand Total</span><span className="summary-value">{formatMoney(data.summary.totalGrandTotal, { noSymbol: true })}</span></div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default PurchaseRegisterPage;
