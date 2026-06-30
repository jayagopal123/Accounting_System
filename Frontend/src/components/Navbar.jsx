import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount } from '../services/notificationApi';

function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

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

          {/* Notification Bell */}
          <Link to="/notifications" className="position-relative text-decoration-none text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
            </svg>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.55rem", padding: "0.2em 0.4em", minWidth: "16px" }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

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