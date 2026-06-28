import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { activateSupplier, blockSupplier, deleteSupplier, getSuppliers } from "../../services/supplierApi";
import { BsPeople, BsPencilSquare, BsTrash, BsToggleOn, BsToggleOff } from "react-icons/bs";

function SupplierListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("suppliers:create");
  const canUpdate = hasPermission("suppliers:update");
  const canDelete = hasPermission("suppliers:delete");

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSuppliers = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const response = await getSuppliers({ page: nextPage, limit: 10, search: nextSearch });
      setSuppliers(response.data.data.suppliers || []);
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
    loadSuppliers(1, search);
  }, [search]);

  const handleAction = async (action) => {
    try {
      await action();
      await loadSuppliers();
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
            <h5 className="page-header-title mb-1">Suppliers</h5>
            <p className="page-header-subtitle">Manage supplier master records</p>
          </div>
          {canCreate && (
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/suppliers/new">
              <span>+</span> New Supplier
            </Link>
          )}
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search suppliers by name or code..." value={search} onChange={(event) => setSearch(event.target.value)} />
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
                    <span className="text-muted small">Loading suppliers...</span>
                  </div>
                </td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={colSpan} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsPeople size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No suppliers found</div>
                    <div className="text-muted small">Try adjusting the search or add a new supplier.</div>
                  </div>
                </td></tr>
              ) : suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="fw-semibold font-mono">{supplier.supplierCode}</td>
                  <td className="fw-medium">{supplier.supplierName}</td>
                  <td className="text-muted">{supplier.company || "—"}</td>
                  <td className="font-mono">{supplier.defaultCurrency}</td>
                  <td><span className={`badge-premium ${supplier.status === "Active" ? "badge-premium-active" : "badge-premium-blocked"}`}>{supplier.status}</span></td>
                  {canUpdate || canDelete ? (
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {canUpdate && (
                          <Link className="btn btn-sm btn-outline-secondary" to={`/suppliers/${supplier._id}/edit`} title="Edit">
                            <BsPencilSquare size={13} />
                          </Link>
                        )}
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleAction(() => supplier.status === "Blocked" ? activateSupplier(supplier._id) : blockSupplier(supplier._id))} title={supplier.status === "Blocked" ? "Activate" : "Block"}>
                            {supplier.status === "Blocked" ? <BsToggleOff size={13} /> : <BsToggleOn size={13} />}
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm("Delete this supplier?") && handleAction(() => deleteSupplier(supplier._id))} title="Delete">
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
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => loadSuppliers(page - 1, search)}>Previous</button>
          <span className="text-muted small font-mono">Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => loadSuppliers(page + 1, search)}>Next</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default SupplierListPage;
