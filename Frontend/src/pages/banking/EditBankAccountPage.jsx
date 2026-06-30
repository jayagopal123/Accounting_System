import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getBankAccountById,
  updateBankAccount,
} from "../../services/bankAccountApi";

function EditBankAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setLoading(true);
        const response = await getBankAccountById(id);
        const account = response.data.data;
        setFormData({
          accountName: account.accountName || "",
          accountNumber: account.accountNumber || "",
          bankName: account.bankName || "",
          branchName: account.branchName || "",
          ifscCode: account.ifscCode || "",
          accountType: account.accountType || "Current",
          currency: account.currency || "INR",
          description: account.description || "",
        });
        setError("");
      } catch (err) {
        const msg = String(err);
        if (!msg.includes("Access denied")) setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      await updateBankAccount(id, formData);
      setSuccess(true);
      setTimeout(() => navigate("/bank-accounts"), 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="page-card p-4">
          <div className="text-center py-5">
            <div
              className="spinner-border text-secondary"
              role="status"
              style={{ width: "1.25rem", height: "1.25rem" }}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!formData) {
    return (
      <MainLayout>
        <div className="page-card p-4">
          <div className="alert alert-danger">Bank account not found.</div>
          <Link className="btn btn-outline-secondary" to="/bank-accounts">
            ← Back to Bank Accounts
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Bank Account</h5>
            <p className="page-header-subtitle">
              Update bank account details
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
            <span>Bank account updated successfully. Redirecting...</span>
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
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
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
                "Update Bank Account"
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

export default EditBankAccountPage;
