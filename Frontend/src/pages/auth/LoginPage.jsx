import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  FaCircleNotch,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UX State Simulation Parameters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Sign In"
      subtitle="Access your corporate accounting instance logs."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Banner Alert Notification States */}
        {error && (
          <div
            className="alert alert-danger p-2 small border-0 d-flex align-items-center gap-2 mb-3"
            style={{
              fontSize: "0.75rem",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
            }}
          >
            <FaExclamationCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="alert alert-success p-2 small border-0 d-flex align-items-center gap-2 mb-3"
            style={{
              fontSize: "0.75rem",
              backgroundColor: "#ecfdf5",
              color: "#065f46",
            }}
          >
            <FaCheckCircle className="flex-shrink-0" />
            <span>
              Session cryptographic authorization verified. Redirecting...
            </span>
          </div>
        )}

        {/* Input Block: Account Email */}
        <div className="mb-3">
          <label className="form-label">Enterprise Email</label>
          <div className="auth-input-group">
            <input
              type="email"
              className={`form-control ${error && !email.includes("@") ? "is-invalid" : ""}`}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>
        </div>

        {/* Input Block: Security Signature Key */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label mb-0">Password</label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: "0.725rem",
                color: "#059669",
                fontWeight: "600",
              }}
            >
              Forgot Key?
            </Link>
          </div>
          <div className="auth-input-group">
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>
        </div>

        {/* Persist Context Operations Checkbox */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="form-check d-flex align-items-center gap-2 m-0 p-0">
            <input
              type="checkbox"
              id="remember"
              className="form-check-input m-0"
              style={{ cursor: "pointer", width: "14px", height: "14px" }}
              disabled={loading || success}
            />
            <label
              htmlFor="remember"
              className="text-muted select-none"
              style={{ fontSize: "0.75rem", cursor: "pointer" }}
            >
              Keep workspace authenticated
            </label>
          </div>
        </div>

        {/* Trigger Submission Module Button */}
        <button
          type="submit"
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
          style={{ height: "38px" }}
          disabled={loading || success}
        >
          {loading ? (
            <>
              <FaCircleNotch
                className="spinner-border-sm animate-spin"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>Verifying Node Logins...</span>
            </>
          ) : (
            <span>Authenticate Session</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
