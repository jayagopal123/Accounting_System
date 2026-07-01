import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createBankAccount } from "../../services/bankAccountApi";

function CreateBankAccountPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    accountType: "Current",
    openingBalance: "",
    description: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      await createBankAccount({
        ...formData,
        openingBalance: Number(formData.openingBalance) || 0,
      });
      setSuccess(true);
      setTimeout(() => navigate("/bank-accounts"), 800);
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
            <h5 className="page-header-title mb-1">Add Bank Account</h5>
            <p className="page-header-subtitle">
              Register a new bank account for transactions and reconciliation
            </p>
          </div>
          <Link className="btn btn-outline-secondary" to="/bank-accounts">
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
            <span>Bank account created successfully. Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Bank Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Account Name *</label>
              <input
                className="form-control"
                value={formData.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                required
                placeholder="e.g. HDFC Current Account"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Bank Name *</label>
              <input
                className="form-control"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                required
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Number *</label>
              <input
                className="form-control"
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                required
                placeholder="e.g. 1234567890"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Type</label>
              <select
                className="form-select"
                value={formData.accountType}
                onChange={(e) => handleChange("accountType", e.target.value)}
              >
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
                <option value="Overdraft">Overdraft</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Branch Name</label>
              <input
                className="form-control"
                value={formData.branchName}
                onChange={(e) => handleChange("branchName", e.target.value)}
                placeholder="e.g. MG Road Branch"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">IFSC Code</label>
              <input
                className="form-control"
                value={formData.ifscCode}
                onChange={(e) => handleChange("ifscCode", e.target.value)}
                placeholder="e.g. HDFC0001234"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Opening Balance</label>
              <input
                className="form-control font-mono"
                type="number"
                step="0.01"
                min="0"
                value={formData.openingBalance}
                onChange={(e) => handleChange("openingBalance", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Optional notes about this account..."
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
                "Save Bank Account"
              )}
            </button>
            <Link className="btn btn-outline-secondary" to="/bank-accounts">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateBankAccountPage;
