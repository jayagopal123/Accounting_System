import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { cancelPayment, getPayments, submitPayment } from "../../services/paymentApi";
import { BsFileText, BsCheckLg, BsXLg } from "react-icons/bs";

function PaymentListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();
      setPayments(response.data.data);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (typeFilter) {
      result = result.filter((p) => p.paymentType === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [payments, typeFilter, statusFilter]);

  const handleAction = async (action) => {
    try {
      await action();
      await loadPayments();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Payments & Receipts</h5>
            <p className="page-header-subtitle">
              Record customer receipts and supplier payments
            </p>
          </div>
          <Link
            className="btn btn-primary d-flex align-items-center gap-2"
            to="/payments/new"
          >
            <span>+</span> New Payment
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Receipt">Receipt (Customer)</option>
              <option value="Payment">Payment (Supplier)</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Type</th>
                <th>Invoice</th>
                <th>Party</th>
                <th className="text-end">Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div
                        className="spinner-border text-secondary"
                        role="status"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      />
                      <span className="text-muted small">
                        Loading payments...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon">
                        <BsFileText size={18} />
                      </div>
                      <div
                        className="fw-semibold text-dark"
                        style={{ fontSize: "0.875rem" }}
                      >
                        No payments found
                      </div>
                      <div className="text-muted small">
                        Record a new payment or receipt to get started.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="fw-semibold font-mono">
                      {payment.paymentNumber}
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          payment.paymentType === "Receipt"
                            ? "badge-premium-submitted"
                            : "badge-premium-draft"
                        }`}
                      >
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="text-muted">{payment.invoiceType}</td>
                    <td className="fw-medium">
                      {payment.customer?.customerName ||
                        payment.supplier?.supplierName ||
                        "—"}
                    </td>
                    <td className="text-end font-mono fw-semibold">
                      {payment.amount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-muted">{payment.paymentMethod}</td>
                    <td>
                      <span
                        className={`badge-premium ${
                          payment.status === "Draft"
                            ? "badge-premium-draft"
                            : payment.status === "Submitted"
                              ? "badge-premium-submitted"
                              : "badge-premium-cancelled"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {payment.status === "Draft" ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              handleAction(() => submitPayment(payment._id))
                            }
                            title="Submit"
                          >
                            <BsCheckLg size={13} />
                          </button>
                        ) : null}
                        {payment.status !== "Cancelled" ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleAction(() => cancelPayment(payment._id))
                            }
                            title="Cancel"
                          >
                            <BsXLg size={13} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default PaymentListPage;
