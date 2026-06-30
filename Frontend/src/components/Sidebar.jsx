import { NavLink } from "react-router-dom";
import {
  FaBell,
  FaBook,
  FaBoxes,
  FaChartLine,
  FaChartPie,
  FaCog,
  FaPercent,
  FaFileInvoiceDollar,
  FaFileSignature,
  FaHome,
  FaIndustry,
  FaMoneyCheckAlt,
  FaPeopleCarry,
  FaShieldAlt,
  FaUniversity,
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
    { to: "/reports/sales-register", label: "Sales Register", icon: FaChartLine, section: "Reports" },
    { to: "/reports/purchase-register", label: "Purchase Register", icon: FaChartLine, section: "Reports" },
    { to: "/reports/ar-aging", label: "AR Aging", icon: FaChartLine, section: "Reports" },
    { to: "/reports/ap-aging", label: "AP Aging", icon: FaChartLine, section: "Reports" },
    { to: "/reports/customer-statement", label: "Customer Statement", icon: FaChartLine, section: "Reports" },
    { to: "/reports/vendor-statement", label: "Vendor Statement", icon: FaChartLine, section: "Reports" },
    { to: "/customers", label: "Customers", icon: FaUsers, section: "Masters" },
    { to: "/suppliers", label: "Suppliers", icon: FaPeopleCarry, section: "Masters" },
    { to: "/sales-invoices", label: "Sales Invoices", icon: FaChartLine, section: "Sales" },
    { to: "/credit-notes", label: "Credit Notes", icon: FaFileSignature, section: "Sales" },
    { to: "/purchase-invoices", label: "Purchase Invoices", icon: FaFileInvoiceDollar, section: "Purchase" },
    { to: "/debit-notes", label: "Debit Notes", icon: FaFileSignature, section: "Purchase" },
    { to: "/payments", label: "Payments & Receipts", icon: FaFileInvoiceDollar, section: "Purchase" },
    { to: "/bank-accounts", label: "Bank Accounts", icon: FaUniversity, section: "Banking" },
    { to: "/bank-transactions", label: "Bank Transactions", icon: FaMoneyCheckAlt, section: "Banking" },
    { to: "/bank-reconciliation", label: "Reconciliation", icon: FaCog, section: "Banking" },
    { to: "/budgets", label: "Budgets", icon: FaChartPie, section: "Budgeting" },
    { to: "/settings/cost-centers", label: "Cost Centers", icon: FaCog, section: "Settings" },
    { to: "/settings/fiscal-years", label: "Fiscal Years", icon: FaCog, section: "Settings" },
    { to: "/settings/numbering-series", label: "Numbering Series", icon: FaCog, section: "Settings" },
    { to: "/settings/exchange-rates", label: "Exchange Rates", icon: FaCog, section: "Settings" },
    { to: "/tax-rates", label: "Tax Rates", icon: FaPercent, section: "Tax" },
    { to: "/tax-groups", label: "Tax Groups", icon: FaPercent, section: "Tax" },
    { to: "/reports/gstr-1", label: "GSTR-1", icon: FaChartLine, section: "Tax" },
    { to: "/reports/gstr-3b", label: "GSTR-3B", icon: FaChartLine, section: "Tax" },
    { to: "/assets", label: "Fixed Assets", icon: FaIndustry, section: "Assets" },
    { to: "/settings/asset-categories", label: "Asset Categories", icon: FaCog, section: "Assets" },
  ];

  // Notifications are always visible
  navItems.push({ to: "/notifications", label: "Notifications", icon: FaBell, section: "Admin" });

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