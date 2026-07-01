import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { FaCircleNotch, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
    <AuthLayout headline="Set new password" subtitle="Create a new password for your account.">
      <form onSubmit={handleUpdate}>
        {error && (
          <div className="auth-alert auth-alert-error">
            <FaExclamationCircle className="flex-shrink-0" size={12} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success">
            <FaCheckCircle className="flex-shrink-0" size={12} />
            <span>Password updated. Redirecting to login...</span>
          </div>
        )}

        <div className="auth-input-wrapper">
          <label>New Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="auth-input-wrapper">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading || success} style={{ marginTop: "0.5rem" }}>
          {loading ? (
            <>
              <FaCircleNotch className="auth-spinner" size={16} />
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>

        <div className="text-center mt-3">
          <Link to="/login" className="auth-footer-link">
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;