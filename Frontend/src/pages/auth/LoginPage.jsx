import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  FaCircleNotch,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function LoginPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Already authenticated — skip to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Welcome back"
      subtitle="Sign in to access your GRAM workspace."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Alerts */}
        {error && (
          <div className="auth-alert auth-alert-error">
            <FaExclamationCircle className="flex-shrink-0" size={12} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success">
            <FaCheckCircle className="flex-shrink-0" size={12} />
            <span>Signed in successfully. Redirecting...</span>
          </div>
        )}

        {/* Email */}
        <div className="auth-input-wrapper">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="auth-input-wrapper">
          <div className="d-flex justify-content-between align-items-center">
            <label>Password</label>
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
              autoComplete="current-password"
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

        {/* Remember me */}
        <div className="auth-checkbox-wrapper d-flex align-items-center gap-2">
          <input type="checkbox" id="remember" disabled={loading || success} />
          <label htmlFor="remember">Remember me</label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <FaCircleNotch className="auth-spinner" size={16} />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Get Started →</span>
          )}
        </button>

        {/* Security text */}
        <p className="auth-security-text">
          Protected by enterprise-grade security
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
