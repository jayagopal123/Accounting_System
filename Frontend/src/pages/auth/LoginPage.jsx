import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

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
      subtitle="Sign in to access your GRAM workspace"
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* Error alert */}
        {error && (
          <div className="login-alert login-alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <div className="login-form-group">
          <label className="login-form-label" htmlFor="login-email">Email</label>
          <div className="login-input-with-icon">
            <span className="login-input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-form-group">
          <label className="login-form-label" htmlFor="login-password">Password</label>
          <div className="login-input-with-icon login-password-input-wrapper">
            <span className="login-input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              id="login-password"
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="login-spinner"></span>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              Get Started
              <span className="login-button-arrow" aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      <p className="login-form-footer">Protected by enterprise-grade security</p>
    </AuthLayout>
  );
}

export default LoginPage;
