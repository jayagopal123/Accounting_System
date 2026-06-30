import { NavLink } from "react-router-dom";
import {
  FaBook,
  FaBoxes,
  FaChartLine,
  FaFileInvoiceDollar,
  FaFileSignature,
  FaHome,
  FaPeopleCarry,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

function Sidebar() {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("audit_logs:view");

  const navItems = [
    { to: "/", label: "Dashboard", icon: FaHome, section: "Overview" },
    { to: "/accounts", label: "Chart Of Accounts", icon: FaBook, section: "Accounting" },
    { to: "/journal-entries", label: "Journal Entries", icon: FaFileSignature, section: "Accounting" },
    { to: "/reports/general-ledger", label: "General Ledger", icon: FaBook, section: "Reports" },
    { to: "/reports/trial-balance", label: "Trial Balance", icon: FaChartLine, section: "Reports" },
    { to: "/reports/profit-loss", label: "Profit & Loss", icon: FaChartLine, section: "Reports" },
    { to: "/reports/balance-sheet", label: "Balance Sheet", icon: FaChartLine, section: "Reports" },
    { to: "/reports/cash-flow", label: "Cash Flow", icon: FaChartLine, section: "Reports" },
    { to: "/customers", label: "Customers", icon: FaUsers, section: "Masters" },
    { to: "/suppliers", label: "Suppliers", icon: FaPeopleCarry, section: "Masters" },
    { to: "/sales-invoices", label: "Sales Invoices", icon: FaChartLine, section: "Sales" },
    { to: "/purchase-invoices", label: "Purchase Invoices", icon: FaFileInvoiceDollar, section: "Purchase" },
    { to: "/payments", label: "Payments & Receipts", icon: FaFileInvoiceDollar, section: "Purchase" },
  ];

  // Only show System Logs to users with audit_logs:view permission
  if (isAdmin) {
    navItems.push({ to: "/system-logs", label: "System Logs", icon: FaShieldAlt, section: "Admin" });
  }

  let currentSection = "";

  return (
    <aside className="sidebar-shell">
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-3 px-4 py-4 border-bottom border-secondary border-opacity-10">
        <div className="bg-success bg-opacity-10 text-success rounded p-2 d-flex align-items-center justify-content-center">
          <FaBoxes size={18} />
        </div>
        <div>
          <div className="fw-bold text-white small" style={{ letterSpacing: '0.03em' }}>Isaii Ledger</div>
          <div className="text-muted" style={{ fontSize: '0.6875rem' }}>ERP Workspace</div>
        </div>
      </div>

      {/* Navigation Streams */}
      <nav className="d-flex flex-column gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, section }) => {
          const sectionChanged = currentSection !== section;
          currentSection = section;

          return (
            <div key={to}>
              {sectionChanged ? <div className="sidebar-section">{section}</div> : null}
              <NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;