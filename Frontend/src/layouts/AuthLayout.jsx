import React from "react";

function AuthLayout({ children, headline, subtitle }) {
  return (
    <div className="login-wrapper">
      {/* ── LEFT PANEL: Dark green brand side ── */}
      <aside className="login-left login-panel-enter-left" aria-label="GRAM platform overview">
        <div className="login-bg-waves login-bg-animate" aria-hidden="true"></div>
        <div className="login-bg-grid login-bg-animate" aria-hidden="true"></div>

        <div className="login-left-inner">
          {/* Brand badge */}
          <div className="login-brand-badge login-animate login-animate-delay-1">
            <img
              alt=""
              className="login-brand-logo"
              src="https://app.getsview.getsenviro.com/GRAM/logo.png"
            />
            <span className="login-brand-text">GRAM</span>
          </div>

          <div className="login-left-content">
            {/* Banner */}
            <img
              alt="GETSVIEW"
              className="login-hero-banner login-animate login-animate-scale login-animate-delay-2"
              src="https://app.getsview.getsenviro.com/GRAM/banner.png"
            />

            {/* Headline */}
            <h1 className="login-hero-headline login-animate login-animate-delay-3">
              Business. <span className="login-hero-tagline-accent">Simplified.</span>
            </h1>

            <p className="login-hero-tagline login-animate login-animate-delay-4">
              Your all-in-one workspace for people, tasks, and growth — built for teams that move fast.
            </p>

            {/* Feature cards */}
            <div className="login-features">
              <article className="login-feature login-feature--people login-animate login-animate-scale login-animate-delay-5">
                <span className="login-feature-shine" aria-hidden="true"></span>
                <span className="login-feature-glow" aria-hidden="true"></span>
                <div className="login-feature-icon">
                  <span className="login-feature-icon-ring" aria-hidden="true"></span>
                  <svg className="adm-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="login-feature-body">
                  <h3 className="login-feature-title">People</h3>
                  <p className="login-feature-label">Manage your team</p>
                </div>
              </article>

              <article className="login-feature login-feature--work login-animate login-animate-scale login-animate-delay-6">
                <span className="login-feature-shine" aria-hidden="true"></span>
                <span className="login-feature-glow" aria-hidden="true"></span>
                <div className="login-feature-icon">
                  <span className="login-feature-icon-ring" aria-hidden="true"></span>
                  <svg className="adm-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                  </svg>
                </div>
                <div className="login-feature-body">
                  <h3 className="login-feature-title">Work</h3>
                  <p className="login-feature-label">Track your tasks</p>
                </div>
              </article>

              <article className="login-feature login-feature--reports login-animate login-animate-scale login-animate-delay-7">
                <span className="login-feature-shine" aria-hidden="true"></span>
                <span className="login-feature-glow" aria-hidden="true"></span>
                <div className="login-feature-icon">
                  <span className="login-feature-icon-ring" aria-hidden="true"></span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <div className="login-feature-body">
                  <h3 className="login-feature-title">Reports</h3>
                  <p className="login-feature-label">See your growth</p>
                </div>
              </article>
            </div>
          </div>

          {/* Footer */}
          <p className="login-left-footer login-animate login-animate-delay-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            Secure • Reliable • Built for Business
          </p>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Form card side ── */}
      <main className="login-right login-panel-enter-right">
        <div className="login-form-card login-animate login-animate-scale login-animate-delay-3">
          {/* Logo in card */}
          <div className="login-form-logo">
            <img alt="GRAM" className="login-form-logo-img" src="https://app.getsview.getsenviro.com/GRAM/logo.png" />
          </div>

          {headline && <h2 className="login-form-title">{headline}</h2>}
          {subtitle && <p className="login-form-subtext">{subtitle}</p>}

          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;