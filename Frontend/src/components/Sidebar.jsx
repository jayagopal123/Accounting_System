import { NavLink } from "react-router-dom";
import {
  FaBook,
  FaBoxes,
  FaChartLine,
  FaFileInvoiceDollar,
  FaFileSignature,
  FaHome,
  FaPeopleCarry,
  FaUsers,
} from "react-icons/fa";

const navItems = [
  { to: "/", label: "Dashboard", icon: FaHome, section: "Overview" },
  { to: "/accounts", label: "Chart Of Accounts", icon: FaBook, section: "Accounting" },
  { to: "/journal-entries", label: "Journal Entries", icon: FaFileSignature, section: "Accounting" },
  { to: "/customers", label: "Customers", icon: FaUsers, section: "Masters" },
  { to: "/suppliers", label: "Suppliers", icon: FaPeopleCarry, section: "Masters" },
  { to: "/sales-invoices", label: "Sales Invoices", icon: FaChartLine, section: "Sales" },
  { to: "/purchase-invoices", label: "Purchase Invoices", icon: FaFileInvoiceDollar, section: "Purchase" },
];

function Sidebar() {
  let currentSection = "";

  return (
    <aside className="sidebar-shell text-white p-3 p-lg-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary rounded-3 p-2">
          <FaBoxes size={20} />
        </div>
        <div>
          <div className="fw-bold">ERP System</div>
          <div className="small text-white-50">Accounting Workspace</div>
        </div>
      </div>

      <nav className="d-flex flex-column gap-1">
        {navItems.map(({ to, label, icon: Icon, section }) => {
          const sectionChanged = currentSection !== section;
          currentSection = section;

          return (
            <div key={to}>
              {sectionChanged ? <div className="sidebar-section">{section}</div> : null}
              <NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Icon size={16} />
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
