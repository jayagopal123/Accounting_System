import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBankAccounts } from "../../services/bankAccountApi";
import { createBankTransaction } from "../../services/bankTransactionApi";

function CreateManualTransactionPage() {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bankAccount: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    transactionType: "Deposit",
    amount: "",
    description: "",
    paymentMethod: "Bank Transfer",
    chequeNumber: "",
    referenceNumber: "",
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getBankAccounts();
        setBankAccounts(
          (response.data.data || []).filter((a) => a.isActive),
        );
      } catch {
        setBankAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      if (!formData.bankAccount) {
        setError("Please select a bank account.");
        setSubmitting(false);
        return;
      }

      await createBankTransaction({
        bankAccount: formData.bankAccount,
        transactionDate: formData.transactionDate,
        transactionType: formData.transactionType,
        amount: Number(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        chequeNumber:
          formData.paymentMethod === "Cheque" ? formData.chequeNumber : "",
        referenceNumber: formData.referenceNumber,
        status:
          formData.paymentMethod === "Cheque" ||
          formData.paymentMethod === "Other"
            ? "Pending"
            : "Cleared",
      });

      setSuccess(true);
      setTimeout(() => navigate("/bank-transactions"), 800);
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
            <h5 className="page-header-title mb-1">Manual Bank Transaction</h5>
            <p className="page-header-subtitle">
              Record a one-off bank deposit, withdrawal, or transfer
            </p>
          </div>
          <Link className="btn btn-outline-secondary" to="/bank-transactions">
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
            <span>Transaction recorded successfully. Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Transaction Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Bank Account *</label>
              <select
                className="form-select"
                value={formData.bankAccount}
                onChange={(e) => handleChange("bankAccount", e.target.value)}
                required
              >
                <option value="">Select bank account</option>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountName} - {acc.bankName} (₹{" "}
                    {acc.currentBalance?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Transaction Type *</label>
              <select
                className="form-select"
                value={formData.transactionType}
                onChange={(e) => handleChange("transactionType", e.target.value)}
                required
              >
                <option value="Deposit">Deposit (Money In)</option>
                <option value="Withdrawal">Withdrawal (Money Out)</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => handleChange("transactionDate", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Amount *</label>
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
            <div className="col-md-4">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Reference Number</label>
              <input
                className="form-control"
                value={formData.referenceNumber}
                onChange={(e) => handleChange("referenceNumber", e.target.value)}
                placeholder="e.g. Transaction ID"
              />
            </div>
            {formData.paymentMethod === "Cheque" && (
              <div className="col-md-4">
                <label className="form-label">Cheque Number</label>
                <input
                  className="form-control"
                  value={formData.chequeNumber}
                  onChange={(e) =>
                    handleChange("chequeNumber", e.target.value)
                  }
                  placeholder="e.g. CHQ-001"
                />
              </div>
            )}
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe this transaction..."
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
                "Save Transaction"
              )}
            </button>
            <Link
              className="btn btn-outline-secondary"
              to="/bank-transactions"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateManualTransactionPage;
