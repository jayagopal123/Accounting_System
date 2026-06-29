import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { activateCustomer, blockCustomer, deleteCustomer, getCustomers } from "../../services/customerApi";
import { BsPeople, BsPencilSquare, BsTrash, BsToggleOn, BsToggleOff } from "react-icons/bs";

function CustomerListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("customers:create");
  const canUpdate = hasPermission("customers:update");
  const canDelete = hasPermission("customers:delete");

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const response = await getCustomers({ page: nextPage, limit: 10, search: nextSearch });
      setCustomers(response.data.data.customers || []);
      setTotalPages(response.data.data.totalPages || 1);
      setPage(response.data.data.page || 1);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1, search);
  }, [search]);

  const handleAction = async (action) => {
    try {
      await action();
      await loadCustomers();
    } catch (err) {
      setError(String(err));
    }
  };

  const colSpan = 5 + (canUpdate || canDelete ? 1 : 0);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Customers</h5>
            <p className="page-header-subtitle">Manage customer master records</p>
          </div>
          {canCreate && (
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/customers/new">
              <span>+</span> New Customer
            </Link>
          )}
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search customers by name or code..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Company</th>
                <th>Currency</th>
                <th>Status</th>
                {canUpdate || canDelete ? <th className="text-end">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colSpan} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span className="text-muted small">Loading customers...</span>
                  </div>
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={colSpan} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsPeople size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No customers found</div>
                    <div className="text-muted small">Try adjusting the search or add a new customer.</div>
                  </div>
                </td></tr>
              ) : customers.map((customer) => (
                <tr key={customer._id}>
                  <td className="fw-semibold font-mono">{customer.customerCode}</td>
                  <td className="fw-medium">{customer.customerName}</td>
                  <td className="text-muted">{customer.company || "—"}</td>
                  <td className="font-mono">{customer.defaultCurrency}</td>
                  <td><span className={`badge-premium ${customer.status === "Active" ? "badge-premium-active" : "badge-premium-blocked"}`}>{customer.status}</span></td>
                  {canUpdate || canDelete ? (
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {canUpdate && (
                          <Link className="btn btn-sm btn-outline-secondary" to={`/customers/${customer._id}/edit`} title="Edit">
                            <BsPencilSquare size={13} />
                          </Link>
                        )}
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleAction(() => customer.status === "Blocked" ? activateCustomer(customer._id) : blockCustomer(customer._id))} title={customer.status === "Blocked" ? "Activate" : "Block"}>
                            {customer.status === "Blocked" ? <BsToggleOff size={13} /> : <BsToggleOn size={13} />}
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm("Delete this customer?") && handleAction(() => deleteCustomer(customer._id))} title="Delete">
                            <BsTrash size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => loadCustomers(page - 1, search)}>Previous</button>
          <span className="text-muted small font-mono">Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => loadCustomers(page + 1, search)}>Next</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default CustomerListPage;
