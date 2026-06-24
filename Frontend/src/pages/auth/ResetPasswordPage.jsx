import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { FaCircleNotch, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Security infrastructure mandates keys containing 8 characters minimum.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Cryptographic error. Passwords fields show structural mismatch.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    }, 1500);
  };

  return (
    <AuthLayout headline="Update Security Key" subtitle="Re-configure cryptographic ledger access keys.">
      <form onSubmit={handleUpdate}>
        {error && (
          <div className="alert alert-danger p-2 small border-0 d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.75rem", backgroundColor: "#fef2f2", color: "#991b1b" }}>
            <FaExclamationCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success p-2 small border-0 d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.75rem", backgroundColor: "#ecfdf5", color: "#065f46" }}>
            <FaCheckCircle className="flex-shrink-0" />
            <span>Key array synchronized successfully. Initializing Login portal...</span>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">New Password Signature</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Confirm Password Signature</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" style={{ height: "38px" }} disabled={loading || success}>
          {loading ? (
            <>
              <FaCircleNotch className="spinner-border-sm animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              <span>Synchronizing Keys...</span>
            </>
          ) : (
            <span>Update Credentials</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;