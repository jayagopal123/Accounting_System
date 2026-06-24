 import React from "react";
import { FaBoxes } from "react-icons/fa";

function AuthLayout({ children, headline, subtitle }) {
  return (
    <div className="auth-wrapper">
      {/* Left Column: Monolith Architecture Brand Engine */}
      <div className="auth-brand-side d-flex flex-column justify-content-between">
        <div className="auth-grid-bg"></div>
        <div className="auth-glow-orb"></div>

        {/* Corporate Header */}
        <div className="d-flex align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
          <div className="bg-success bg-opacity-10 text-success rounded p-2 d-flex align-items-center justify-content-center" style={{ border: "1px solid rgba(5, 150, 105, 0.2)" }}>
            <FaBoxes size={20} />
          </div>
          <div>
            <div className="fw-bold text-white fs-5" style={{ letterSpacing: "0.03em" }}>Isaii Ledger</div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>Enterprise ERP Workspace</div>
          </div>
        </div>

        {/* Abstract Financial Telemetry Terminal */}
        <div className="auth-illustration-box position-relative" style={{ zIndex: 2 }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="font-mono text-success small fw-semibold d-flex align-items-center gap-2">
              <span className="workspace-dot"></span> Core.Ledger.System // Active
            </span>
            <span className="text-muted style-none" style={{ fontSize: "0.7rem" }}>SECURE_NODE_TLS</span>
          </div>
          
          <div className="mb-3">
            <div className="text-secondary small mb-1 font-mono">System Asset Throughput</div>
            <div className="metric-strip"><div className="metric-strip-fill" style={{ width: "78%" }}></div></div>
          </div>
          <div>
            <div className="text-secondary small mb-1 font-mono">Realtime Ledger Synchronization</div>
            <div className="metric-strip"><div className="metric-strip-fill" style={{ width: "92%", backgroundColor: "#3b82f6" }}></div></div>
          </div>

          <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between">
            <span className="text-muted font-mono" style={{ fontSize: "0.65rem" }}>SYS.ERRORS: 0</span>
            <span className="text-muted font-mono" style={{ fontSize: "0.65rem" }}>PING: 12ms</span>
          </div>
        </div>

        {/* Brand Promise Footer Quote */}
        <div className="position-relative" style={{ zIndex: 2 }}>
          <p className="text-white-50 small mb-0 fw-light" style={{ lineHeight: "1.6", maxWidth: "420px" }}>
            "Automate critical dual-entry ledgers, optimize fiscal compliance configurations, and orchestrate double-entry audit trials securely at absolute scale."
          </p>
        </div>
      </div>

      {/* Right Column: Dynamic Form Workspace */}
      <div className="auth-form-side">
        <div className="auth-card-shell">
          <div className="mb-4">
            <h2 className="fw-bold text-dark tracking-tight mb-1" style={{ fontSize: "1.5rem" }}>{headline}</h2>
            <p className="text-muted small">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;