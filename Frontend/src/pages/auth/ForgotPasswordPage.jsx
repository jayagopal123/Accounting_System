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
    <AuthLayout headline="Recover Security Key" subtitle="Initiate secure node token sequence dispatch.">
      {!submitted ? (
        <form onSubmit={handleRecover}>
          <div className="mb-4">
            <label className="form-label">Enterprise Email Route</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <div className="text-muted mt-2" style={{ fontSize: "0.7rem", lineHeight: "1.4" }}>
              A temporary cryptographic secure reset matrix link will be routed to verified system registry emails only.
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 mb-3" style={{ height: "38px" }} disabled={loading}>
            {loading ? (
              <>
                <FaCircleNotch className="spinner-border-sm animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                <span>Routing Dispatch Node...</span>
              </>
            ) : (
              <span>Send Recovery Link</span>
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-muted small fw-medium" style={{ fontSize: "0.75rem" }}>
              ← Return to Authentication Console
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center py-2">
          <div className="text-success fs-3 mb-2">
            <FaCheckCircle />
          </div>
          <h5 className="fw-bold text-dark small text-uppercase tracking-wider mb-2">Recovery Grid Dispatched</h5>
          <p className="text-muted small mb-4" style={{ lineHeight: "1.5" }}>
            Check inbound enterprise directory pipeline logs at <strong className="text-dark">{email}</strong> to verify token payload signatures.
          </p>
          <Link to="/login" className="btn btn-outline-primary w-100">
            Return to Login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;