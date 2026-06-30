import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createPayment } from "../../services/paymentApi";
import { getAccounts } from "../../services/accountApi";
import { getSalesInvoices } from "../../services/salesInvoiceApi";
import { getPurchaseInvoices } from "../../services/purchaseInvoiceApi";

function CreatePaymentPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    paymentType: "Receipt",
    invoiceType: "SalesInvoice",
    invoice: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Bank Transfer",
    referenceNumber: "",
    account: "",
    remarks: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [acctRes, siRes, piRes] = await Promise.all([
          getAccounts(),
          getSalesInvoices(),
          getPurchaseInvoices(),
        ]);

        const allAccounts = acctRes.data.data || [];
        // Filter to cash/bank accounts (accountCode 1201, 1202 or type ASSET with cash-like names)
        setAccounts(
          allAccounts.filter(
            (a) =>
              !a.isGroup &&
              (a.accountCode === "1201" ||
                a.accountCode === "1202" ||
                a.accountName.toLowerCase().includes("cash") ||
                a.accountName.toLowerCase().includes("bank")),
          ),
        );

        setSalesInvoices(
          (siRes.data.data || []).filter((inv) => inv.status === "Submitted"),
        );
        setPurchaseInvoices(
          (piRes.data.data || []).filter((inv) => inv.status === "Submitted"),
        );
      } catch {
        // non-critical
      }
    };
    loadData();
  }, []);

  // Filter invoices based on selected payment/invoice type
  const availableInvoices =
    formData.invoiceType === "SalesInvoice"
      ? salesInvoices
      : purchaseInvoices;

  const selectedInvoice = availableInvoices.find(
    (inv) => inv._id === formData.invoice,
  );

  const handleChange = (field, value) => {
    // Reset invoice when type changes
    if (field === "paymentType" || field === "invoiceType") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        invoice: "",
        amount: "",
      }));
    } else if (field === "invoice") {
      const inv = availableInvoices.find((i) => i._id === value);
      setFormData((prev) => ({
        ...prev,
        invoice: value,
        amount: inv ? inv.grandTotal : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      if (!formData.account) {
        setError("Please select a Cash/Bank account.");
        setSubmitting(false);
        return;
      }

      if (!formData.invoice) {
        setError("Please select an invoice.");
        setSubmitting(false);
        return;
      }

      await createPayment({
        paymentType: formData.paymentType,
        invoiceType: formData.invoiceType,
        invoice: formData.invoice,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        account: formData.account,
        remarks: formData.remarks,
      });
      setSuccess(true);
      setTimeout(() => navigate("/payments"), 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">
              {formData.paymentType === "Receipt"
                ? "Record Customer Receipt"
                : "Record Supplier Payment"}
            </h5>
            <p className="page-header-subtitle">
              {formData.paymentType === "Receipt"
                ? "Receive payment from a customer against a sales invoice"
                : "Make payment to a supplier against a purchase invoice"}
            </p>
          </div>
          <Link className="btn btn-outline-secondary" to="/payments">
            ← Back
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}
        {success && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            style={{
              fontSize: "0.8rem",
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "none",
            }}
          >
            <span>
              {formData.paymentType === "Receipt"
                ? "Receipt recorded"
                : "Payment recorded"}{" "}
              successfully. Redirecting...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Transaction Type</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Payment Type</label>
              <select
                className="form-select"
                value={formData.paymentType}
                onChange={(e) => handleChange("paymentType", e.target.value)}
                required
              >
                <option value="Receipt">Receipt (Customer Pays Us)</option>
                <option value="Payment">Payment (We Pay Supplier)</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Invoice Type</label>
              <select
                className="form-select"
                value={formData.invoiceType}
                onChange={(e) => handleChange("invoiceType", e.target.value)}
                required
              >
                <option value="SalesInvoice">Sales Invoice</option>
                <option value="PurchaseInvoice">Purchase Invoice</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Payment Date</label>
              <input
                className="form-control"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
              />
            </div>
          </div>

          <div className="form-section-title">Invoice Selection</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Invoice</label>
              <select
                className="form-select"
                value={formData.invoice}
                onChange={(e) => handleChange("invoice", e.target.value)}
                required
              >
                <option value="">Select an invoice</option>
                {availableInvoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} —{" "}
                    {(inv.customer?.customerName ||
                      inv.supplier?.supplierName) || "—"}{" "}
                    — {inv.grandTotal?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Invoice Amount</label>
              <input
                className="form-control font-mono"
                value={
                  selectedInvoice
                    ? selectedInvoice.grandTotal?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })
                    : ""
                }
                disabled
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Amount</label>
              <input
                className="form-control font-mono"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-section-title">Payment Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Cash / Bank Account</label>
              <select
                className="form-select"
                value={formData.account}
                onChange={(e) => handleChange("account", e.target.value)}
                required
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountCode} - {acc.accountName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) =>
                  handleChange("paymentMethod", e.target.value)
                }
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Reference / Cheque No.</label>
              <input
                className="form-control"
                value={formData.referenceNumber}
                onChange={(e) =>
                  handleChange("referenceNumber", e.target.value)
                }
                placeholder="e.g. CHQ-001"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                `Save ${formData.paymentType === "Receipt" ? "Receipt" : "Payment"}`
              )}
            </button>
            <Link className="btn btn-outline-secondary" to="/payments">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreatePaymentPage;
