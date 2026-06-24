import React from 'react';

function Navbar() {
  return (
    <header className="topbar px-4 py-3">
      <div className="d-flex align-items-center justify-content-between w-100">
        
        {/* Left Side: Context Navigator */}
        <div className="d-flex align-items-center gap-3">
          <div className="workspace-pill d-flex align-items-center gap-2">
            <span className="workspace-dot"></span>
            <span className="workspace-name">Acme Holdings, Inc.</span>
          </div>
          <div className="text-muted small d-none d-md-inline">
            <span className="text-slate-300 mx-1">/</span> Ledger Workspace
          </div>
        </div>

        {/* Right Side: Global Command Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Quick Search */}
          <div className="search-wrapper d-none d-lg-block">
            <input 
              type="text" 
              className="topbar-search" 
              placeholder="Search ledger (⌘K)..." 
            />
          </div>

          {/* Action Button */}
          <button className="btn btn-sm btn-dark px-3 fw-medium d-flex align-items-center gap-2">
            <span>+ Post Voucher</span>
          </button>

          {/* User Console Profile */}
          <div className="d-flex align-items-center gap-2 border-start ps-3 ms-1">
            <div className="avatar-circle">US</div>
            <span className="small fw-semibold text-secondary d-none d-sm-inline">User Console</span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;