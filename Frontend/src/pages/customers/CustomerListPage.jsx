import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { activateCustomer, blockCustomer, deleteCustomer, getCustomers } from "../../services/customerApi";

function CustomerListPage() {
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
      setError(String(err));
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

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Customers</h2>
          <Link className="btn btn-primary" to="/customers/new">+ New Customer</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Company</th>
                <th>Currency</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No customers found.</td></tr>
              ) : customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.customerCode}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.company || "-"}</td>
                  <td>{customer.defaultCurrency}</td>
                  <td><span className="badge bg-info">{customer.status}</span></td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-warning me-2" to={`/customers/${customer._id}/edit`}>Edit</Link>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleAction(() => customer.status === "Blocked" ? activateCustomer(customer._id) : blockCustomer(customer._id))}>
                      {customer.status === "Blocked" ? "Activate" : "Block"}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm("Delete this customer?") && handleAction(() => deleteCustomer(customer._id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => loadCustomers(page - 1, search)}>Previous</button>
          <span className="text-muted">Page {page} of {totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => loadCustomers(page + 1, search)}>Next</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default CustomerListPage;
