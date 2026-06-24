import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3">

      <h4>ERP System</h4>

      <ul className="nav flex-column">

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/">
            Dashboard
          </NavLink>
        </li>

        <li className="nav-item mt-3">
          <h6>Accounting</h6>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/accounts">
            Chart Of Accounts
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/journal-entries">
            Journal Entries
          </NavLink>
        </li>

        <li className="nav-item mt-3">
          <h6>Masters</h6>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/customers">
            Customers
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/suppliers">
            Suppliers
          </NavLink>
        </li>

        <li className="nav-item mt-3">
          <h6>Sales</h6>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/sales-invoices">
            Sales Invoices
          </NavLink>
        </li>

        <li className="nav-item mt-3">
          <h6>Purchase</h6>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/purchase-invoices">
            Purchase Invoices
          </NavLink>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;