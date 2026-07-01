import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { FaCircleNotch, FaCheckCircle } from "react-icons/fa";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRecover = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <AuthLayout headline="Reset password" subtitle="Enter your email to receive a password reset link.">
      {!submitted ? (
        <form onSubmit={handleRecover}>
          <div className="auth-input-wrapper">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <p className="auth-security-text" style={{ textAlign: "left", marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
            A secure password reset link will be sent to your registered email.
          </p>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <FaCircleNotch className="auth-spinner" size={16} />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="auth-footer-link">
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center py-2">
          <div className="text-success mb-2" style={{ fontSize: "2rem" }}>
            <FaCheckCircle />
          </div>
          <h5 className="fw-bold" style={{ fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.5rem" }}>
            Reset Link Sent
          </h5>
          <p className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Check your inbox at <strong style={{ color: "#0f172a" }}>{email}</strong> for instructions.
          </p>
          <Link to="/login" className="auth-submit-btn" style={{ textDecoration: "none" }}>
            Return to Sign In
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;