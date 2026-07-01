import React from "react";
import { FaBoxes, FaUsers, FaBriefcase, FaChartLine, FaShieldAlt } from "react-icons/fa";

function AuthLayout({ children, headline, subtitle }) {
  return (
    <div className="auth-wrapper">
      {/* ── LEFT PANEL: Dark enterprise brand side ── */}
      <div className="auth-brand-side">
        <div className="auth-grid-bg"></div>
        <div className="auth-glow-orb"></div>

        <div className="auth-brand-inner">
          {/* Brand pill */}
          <div className="auth-brand-pill">
            <span className="auth-brand-pill-icon">
              <FaBoxes size={10} />
            </span>
            <span>GRAM ERP</span>
          </div>

          {/* Banner image */}
          <img
            src="https://app.getsview.getsenviro.com/GRAM/banner.png"
            alt="GRAM ERP"
            className="auth-banner-img"
          />

          {/* Large wordmark */}
          <h1 className="auth-brand-wordmark">
            Business.{" "}
            <span className="highlight">Simplified.</span>
          </h1>

          {/* Description */}
          <p className="auth-brand-desc">
            Streamline your financial operations with enterprise-grade
            accounting, reporting, and compliance tools.
          </p>

          {/* Feature cards */}
          <div className="auth-features">
            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <FaUsers size={16} />
              </div>
              <div className="auth-feature-text">
                <h4>People</h4>
                <p>Manage employees, roles, and team permissions</p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <FaBriefcase size={16} />
              </div>
              <div className="auth-feature-text">
                <h4>Work</h4>
                <p>Track projects, tasks, and operational workflows</p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <FaChartLine size={16} />
              </div>
              <div className="auth-feature-text">
                <h4>Reports</h4>
                <p>Generate financial statements and real-time insights</p>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="auth-security-badge">
            <FaShieldAlt size={12} />
            <span>Protected by enterprise-grade security</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form card side ── */}
      <div className="auth-form-side">
        <div className="auth-card-shell">
          {/* Brand logo in card */}
          <div className="auth-card-brand">
            <div className="auth-card-brand-icon">
              <FaBoxes size={18} />
            </div>
            <div>
              <div className="auth-card-brand-text">Isaii Ledger</div>
              <div className="auth-card-brand-sub">Enterprise ERP Platform</div>
            </div>
          </div>

          {headline && <h2 className="auth-heading">{headline}</h2>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;